import { createClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';
import { NextRequest, NextResponse } from 'next/server';

// Supabase client - ortam değişkenlerinden
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(req: NextRequest) {
    try {
        console.log("Fetching news from saadet.org.tr...");

        // 1. Fetch the page
        const response = await fetch("https://saadet.org.tr/gundem-ve-haberler", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();

        console.log("Parsing HTML...");
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // 2. Extract News Items
        const gatheredNews: any[] = [];
        const container = document.querySelector('main') || document.querySelector('.container') || document.body;
        const links = container.querySelectorAll('a');

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || !href.includes('/') || href.length < 5) return;

            let fullUrl = href.startsWith('http') ? href : `https://saadet.org.tr${href.startsWith('/') ? '' : '/'}${href}`;
            fullUrl = fullUrl.replace('saadet.org.tr//', 'saadet.org.tr/');

            // Try to find title
            let title = "";
            const h2 = link.querySelector('h2, h3, h4, h5');
            if (h2) {
                title = h2.textContent?.trim() || "";
            } else if (link.textContent && link.textContent.length > 20) {
                title = link.textContent.trim();
            }

            // Try to find image
            let imageUrl: string | null = null;
            const img = link.querySelector('img');
            if (img) {
                imageUrl = img.getAttribute('src');
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://saadet.org.tr${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }
            }

            // Validation
            if (title && title.length > 10 && !["Anasayfa", "İletişim", "Hakkımızda"].includes(title)) {
                if (!gatheredNews.find(n => n.url === fullUrl)) {
                    gatheredNews.push({
                        title,
                        url: fullUrl,
                        image_url: imageUrl,
                        is_active: true
                    });
                }
            }
        });

        console.log(`Found ${gatheredNews.length} potential news items.`);

        // 3. Upsert into Database
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        let newCount = 0;

        for (const item of gatheredNews.slice(0, 20)) {
            // Fetch content for each item
            try {
                console.log("Fetching content for:", item.url);
                const contentStr = await fetchNewsContent(item.url);
                if (contentStr) {
                    item.content = contentStr;
                }
            } catch (err) {
                console.error("Failed to fetch content for", item.url, err);
            }

            const { error } = await supabase
                .from('news')
                .upsert(item, { onConflict: 'url', ignoreDuplicates: false });

            if (!error) newCount++;
            else console.error("Error inserting:", error);
        }

        return NextResponse.json({
            success: true,
            message: `Scraping complete. Found ${gatheredNews.length}, Processed 20.`,
            new_items: newCount
        });

    } catch (error) {
        console.error("Fetch News Error:", error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}

async function fetchNewsContent(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await res.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Remove Scripts/Styles
        const junk = doc.querySelectorAll('script, style, iframe, nav, footer, button');
        junk.forEach(j => j.remove());

        // Clean "Related News"
        const allElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b, span, div');
        allElements.forEach(el => {
            const text = el.textContent?.trim().toLowerCase() || "";
            if (text === 'i̇lgili haberler' || text === 'ilgili haberler') {
                const next = el.nextElementSibling;
                if (next) next.remove();
                el.remove();
            }
        });

        // Extract Body
        const specificContent = doc.querySelector('.prose') || doc.querySelector('.news-content');
        if (specificContent) {
            return specificContent.textContent?.replace(/\n\s*\n/g, '\n\n').trim() || null;
        }

        const article = doc.querySelector('article') || doc.querySelector('main') || doc.querySelector('.news-detail');
        if (article) {
            return article.textContent?.replace(/\n\s*\n/g, '\n\n').trim() || null;
        }

        return doc.body.textContent?.trim() || null;
    } catch (e) {
        return null;
    }
}

// POST method for manual trigger
export async function POST(req: NextRequest) {
    return GET(req);
}
