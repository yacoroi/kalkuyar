
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: false,
        }
    }
);

export async function POST(req: NextRequest) {
    try {
        // ========== AUTH CHECK ==========
        // Create server client to get the current user session
        const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set() { },
                remove() { },
            },
        });

        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
            console.error('[Scrape API] Auth Error:', authError?.message || 'No user');
            return NextResponse.json({ success: false, error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
        }

        // Check if user is an admin
        const { data: adminRecord, error: adminError } = await supabase
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single();

        if (adminError || !adminRecord) {
            console.error('[Scrape API] Admin Check Failed:', adminError?.message || 'User not admin');
            return NextResponse.json({ success: false, error: 'Bu işlem için yönetici yetkisi gereklidir.' }, { status: 403 });
        }

        console.log('[Scrape API] Auth verified. Admin:', user.id);
        // ========== END AUTH CHECK ==========

        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        console.log('Browser launched. New page...');
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to page...');
        await page.goto('https://saadet.org.tr/gundem-ve-haberler', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Dynamic wait - wait for main content to appear
        console.log('Waiting for content to load...');
        try {
            await page.waitForSelector('main a', { timeout: 10000 });
        } catch {
            console.log('Selector timeout, proceeding anyway...');
        }

        // Extract Links first
        console.log('Extracting links...');
        const linksToScrape = await page.evaluate(() => {
            const items: any[] = [];
            const container = document.querySelector('main') || document.body;
            const links = container.querySelectorAll('a');

            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.length < 5) return;

                let fullUrl = href.startsWith('http') ? href : `https://saadet.org.tr${href.startsWith('/') ? '' : '/'}${href}`;
                fullUrl = fullUrl.replace('saadet.org.tr//', 'saadet.org.tr/');

                // Find Title
                let title = "";
                const hTag = link.querySelector('h2, h3, h4, h5, div.text-xl, div.font-bold');
                if (hTag) title = hTag.textContent?.trim() || "";
                else title = link.textContent?.trim() || "";

                // Find Image
                let imageUrl = null;
                const img = link.querySelector('img');
                if (img) {
                    const src = img.getAttribute('src');
                    if (src) imageUrl = src.startsWith('http') ? src : `https://saadet.org.tr${src.startsWith('/') ? '' : '/'}${src}`;
                } else {
                    // Check background image
                    const divWithBg = link.querySelector('[style*="background-image"]');
                    if (divWithBg) {
                        const style = divWithBg.getAttribute('style');
                        const match = style?.match(/url\(['"]?(.*?)['"]?\)/);
                        if (match && match[1]) {
                            imageUrl = match[1].startsWith('http') ? match[1] : `https://saadet.org.tr${match[1].startsWith('/') ? '' : '/'}${match[1]}`;
                        }
                    }
                }

                if (title && title.length > 5 && !["Anasayfa", "İletişim", "Hakkımızda", "Daha Fazla"].some(k => title.includes(k))) {
                    if (!items.find(x => x.url === fullUrl)) {
                        items.push({
                            title,
                            url: fullUrl,
                            image_url: imageUrl,
                            summary: "",
                            is_active: true
                        });
                    }
                }
            });
            return items;
        });

        console.log(`Found ${linksToScrape.length} links. Scraping content with parallel processing...`);
        const detailedNews: any[] = [];

        // Parallel scraping with concurrency limit
        const CONCURRENCY_LIMIT = 3;
        const scrapeContent = async (item: any, scrapeIndex: number) => {
            const contentPage = await browser.newPage();
            try {
                console.log(`[${scrapeIndex + 1}/${linksToScrape.length}] Visiting: ${item.title}`);
                await contentPage.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
                // Dynamic wait for content
                try {
                    await contentPage.waitForSelector('.prose, article, main p', { timeout: 3000 });
                } catch { /* proceed if timeout */ }

                const pageData = await contentPage.evaluate(() => {
                    // 1. Extract Date
                    let publishedAt = null;
                    // Selector based on inspection: div.flex.items-center.gap-1 inside div.flex-grow
                    // Using a more generic search for the specific date format if selector fails
                    const dateEl = document.querySelector('div.flex-grow div.flex.items-center.gap-1');
                    let dateText = "";

                    if (dateEl && dateEl.textContent) {
                        dateText = dateEl.textContent.trim();
                    } else {
                        // Fallback: search for date pattern in body text nodes
                        const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
                        let node;
                        while (node = iterator.nextNode()) {
                            if (node.textContent && /^\s*\d{2}\.\d{2}\.\d{4}\s*$/.test(node.textContent)) {
                                dateText = node.textContent.trim();
                                break;
                            }
                        }
                    }

                    if (dateText) {
                        // Parse DD.MM.YYYY
                        const parts = dateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                        if (parts) {
                            // Date(year, monthIndex, day) -> monthIndex is 0-based
                            // Set time to noon to avoid timezone shift issues affecting the day
                            const d = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 12, 0, 0);
                            publishedAt = d.toISOString();
                        }
                    }

                    // 2. Extract Content
                    // Try to identify the container again
                    // 2. Extract Content
                    // Try to identify the container again

                    // Priority: Specific content wrappers (Tailwind typography)
                    let bestCandidate = document.querySelector('.prose') || document.querySelector('.news-content');

                    if (!bestCandidate) {
                        const candidates = Array.from(document.querySelectorAll('div.container, article, main'));
                        let maxLen = 0;

                        for (const c of candidates) {
                            const txt = c.textContent || "";
                            if (txt.length > maxLen && txt.length > 200) {
                                maxLen = txt.length;
                                bestCandidate = c;
                            }
                        }
                    }

                    if (!bestCandidate) bestCandidate = document.body;

                    const clone = bestCandidate.cloneNode(true) as HTMLElement;

                    // CLEANUP: Remove scripts, styles, etc.
                    const bads = clone.querySelectorAll('script, style, iframe, button, nav, footer, header, .related-posts, .share-buttons, a[href*="facebook"]');
                    bads.forEach(b => b.remove());

                    // CLEANUP: Remove "İlgili Haberler" sections
                    // Find elements containing "İlgili Haberler" and remove them and potentially their siblings
                    const headers = clone.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b');
                    headers.forEach(h => {
                        const txt = h.textContent?.toLowerCase() || "";
                        if (txt.includes('i̇lgili haberler') || txt.includes('ilgili haberler')) {
                            // Remove the header
                            h.remove();
                            // Note: Advanced sibling removal is hard in simplified evaluate, 
                            // typically these libraries wrap related news in a div. 
                            // Let's rely on extracting only p/ul/h tags which usually excludes the related news cards grid if valid.
                        }
                    });

                    // Extraction Loop
                    const elements = clone.querySelectorAll('p, h2, h3, h4, ul');
                    let pText = "";

                    elements.forEach(el => {
                        const t = el.textContent?.trim() || "";
                        if (t.length < 2 && el.tagName !== 'UL') return;

                        // Extra check for "İlgili Haberler" text if it wasn't caught above
                        if (t.toLowerCase().includes('ilgili haberler')) return;

                        if (['H2', 'H3', 'H4'].includes(el.tagName)) {
                            pText += "\n\n" + t + "\n\n";
                        } else if (el.tagName === 'UL') {
                            const lis = el.querySelectorAll('li');
                            lis.forEach(li => {
                                const liText = li.textContent?.trim();
                                if (liText) pText += "• " + liText + "\n";
                            });
                            pText += "\n";
                        } else {
                            pText += t + "\n\n";
                        }
                    });

                    // Fallback if empty
                    if (pText.length < 50) pText = clone.innerText.trim();

                    return {
                        content: pText.trim(),
                        publishedAt: publishedAt || new Date().toISOString() // Use scraped date or NOW
                    };
                });

                item.content = pageData.content;
                item.published_at = pageData.publishedAt; // Assign the scraped date

                if (item.content && item.content.length > 50) {
                    item.summary = item.content.substring(0, 150) + "...";
                }

                return item;

            } catch (e) {
                console.error(`Failed to scrape content for ${item.url}:`, e);
                return null;
            } finally {
                await contentPage.close();
            }
        };

        // Process in batches with concurrency limit
        for (let i = 0; i < linksToScrape.length; i += CONCURRENCY_LIMIT) {
            const batch = linksToScrape.slice(i, i + CONCURRENCY_LIMIT);
            const results = await Promise.all(
                batch.map((item, idx) => scrapeContent(item, i + idx))
            );
            detailedNews.push(...results.filter((r): r is any => r !== null));
        }

        await browser.close();
        console.log(`Scraped full content for ${detailedNews.length} items`);

        if (detailedNews.length === 0) {
            // Only error if we found links but failed to scrape ANY content
            if (linksToScrape.length > 0) {
                return NextResponse.json({ success: false, error: 'Haber linkleri bulundu ama içerikleri çekilemedi.' });
            }
            return NextResponse.json({ success: false, error: 'Haber linki bulunamadı.' });
        }

        const newsItems = detailedNews;

        // Insert into DB using RPC to bypass RLS
        let insertedCount = newsItems.length;
        try {
            const { error } = await supabase.rpc('upsert_news_items', { items: newsItems });

            if (error) {
                console.error("RPC Error:", error);
                insertedCount = 0;
                throw error;
            } else {
                console.log("RPC execution successful.");
            }
        } catch (dbErr) {
            console.error("DB Error", dbErr);
            return NextResponse.json({ success: false, error: 'Veritabanı Yazma Hatası (SQL Fonksiyonu Eksik Olabilir): ' + (dbErr as any).message });
        }

        return NextResponse.json({
            success: true,
            message: `İşlem Başarılı: ${newsItems.length} haber bulundu ve içerikleriyle birlikte kaydedildi.`,
            data: newsItems
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ success: false, error: 'Scraping failed: ' + (error as Error).message }, { status: 500 });
    }
}
