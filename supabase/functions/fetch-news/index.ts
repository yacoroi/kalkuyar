import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Fetch the page
        console.log("Fetching saadet.org.tr...");
        const response = await fetch("https://saadet.org.tr/gundem-ve-haberler");
        const html = await response.text();

        console.log("Parsing HTML...");
        const document = new DOMParser().parseFromString(html, "text/html");

        if (!document) {
            throw new Error("Failed to parse document");
        }

        // 2. Extract News Items
        // Based on observation: News items are in a list. 
        // Usually standard structures like `.news-item`, `article`, or checking headers.
        // Inspection showed: `[27]<h2>Faize Giden Kaynak...</h2>` with link `[23]<a href='...' />`
        // Let's assume a structure based on typical bootstrap/tailwind sites or try generic selectors.
        // Best guess selector based on "Gündem ve Haberler" lists: 
        // Look for `a` tags that contain `h2` or `h3` or generic cards.

        // Let's grab all `a` tags and inspect them.
        const gatheredNews: any[] = [];

        // Specific selector strategy:
        // Finding commonly used container classes or semantic tags.
        // Since I can't inspect class names live easily without a full browser dump, I'll allow some fuzzy matching.

        // Let's look for known specific items from previous `browser_subagent`:
        // "Faize Giden Kaynak" was in an <h2> inside an <a>? Or near it.
        // Let's try to find all <a> elements that differ from Nav items.
        // Usually main content is in `main` or a `div` with class `container`.

        // Fallback: Grab all links that look like news (have significant text, maybe an image).
        // Better: Select ALL unique links within the main content area.

        const container = document.querySelector('main') || document.querySelector('.container') || document.body;
        const links = container.querySelectorAll('a');

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || !href.includes('/') || href.length < 5) continue;

            // Filter out nav/footer links implicitly by checking content length
            // or ensure URL path structure (e.g. usually `/haber/...` or slug-like)

            // Saadet URLs: `https://saadet.org.tr/faize-giden-kaynak...`
            // They look like root relative `/slug`.

            let fullUrl = href.startsWith('http') ? href : `https://saadet.org.tr${href.startsWith('/') ? '' : '/'}${href}`;

            // Fix double slash issue if any
            fullUrl = fullUrl.replace('saadet.org.tr//', 'saadet.org.tr/');

            // Try to find title
            let title = "";
            const h2 = link.querySelector('h2, h3, h4, h5');
            if (h2) {
                title = h2.textContent.trim();
            } else {
                // Maybe the link text itself is the title
                // But usually news cards wrap image + title.
                // If we can't find a header tag, assume text content if lengthy.
                if (link.textContent.length > 20) {
                    title = link.textContent.trim();
                }
            }

            // Try to find image
            let imageUrl = null;
            const img = link.querySelector('img');
            if (img) {
                imageUrl = img.getAttribute('src');
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://saadet.org.tr${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }
            }

            // Validation
            if (title && title.length > 10 && !["Anasayfa", "İletişim", "Hakkımızda"].includes(title)) {
                // Deduplicate in memory
                if (!gatheredNews.find(n => n.url === fullUrl)) {
                    gatheredNews.push({
                        title,
                        url: fullUrl,
                        image_url: imageUrl,
                        is_active: true
                    });
                }
            }
        }

        console.log(`Found ${gatheredNews.length} potential news items.`);

        // 3. Upsert into Database
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

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

        return new Response(
            JSON.stringify({
                success: true,
                message: `Scraping complete. Found ${gatheredNews.length}, Processed 10.`,
                new_items: newCount
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

async function fetchNewsContent(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        if (!doc) return null;

        // Clean "Related News"
        // Strategy: Find header, remove it and the element immediately following it (the list)
        const allElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b, span, div');
        for (const el of allElements) {
            const text = el.textContent.trim().toLowerCase();
            if (text === 'i̇lgili haberler' || text === 'ilgili haberler') {
                // Remove the list that follows
                const next = el.nextElementSibling;
                if (next) next.remove();

                // Remove the header itself
                el.remove();
            }
        }

        // Remove Scripts/Styles
        const junk = doc.querySelectorAll('script, style, iframe, nav, footer, button');
        for (const j of junk) j.remove();

        // Extract Body
        // Priority: .prose (Tailwind typography content) - This isolates the article text from sidebar/related news
        const specificContent = doc.querySelector('.prose') || doc.querySelector('.news-content');
        if (specificContent) {
            return specificContent.textContent.replace(/\n\s*\n/g, '\n\n').trim();
        }

        // Try common containers
        const article = doc.querySelector('article') || doc.querySelector('main') || doc.querySelector('.news-detail');
        if (article) {
            // Return text content (trimmed and cleaned of excessive newlines)
            return article.textContent.replace(/\n\s*\n/g, '\n\n').trim();
        }

        return doc.body.textContent.trim();
    } catch (e) {
        return null;
    }
}
