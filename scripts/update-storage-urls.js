/**
 * Supabase Database URL Update Script
 * Storage URL'lerini eski domain'den yeni domain'e günceller
 * 
 * Kullanım: node scripts/update-storage-urls.js
 */

const { createClient } = require('@supabase/supabase-js');

// Self-Hosted Supabase
const SELF_HOSTED_URL = 'http://api.kalkuyar.com';
const SELF_HOSTED_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY3ODQwMCwiZXhwIjo0OTIyMzUyMDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.px9vubI9i6D9GX773TcClq5ylUpzcAEjMVk59oKGAio';

// Domain değişikliği
const OLD_DOMAIN = 'https://batzvgczjldnnesojnjj.supabase.co';
const NEW_DOMAIN = 'https://api.kalkuyar.com';

const supabase = createClient(SELF_HOSTED_URL, SELF_HOSTED_SERVICE_KEY);

const TABLES_TO_UPDATE = [
    { table: 'trainings', column: 'image_url' },
    { table: 'trainings', column: 'audio_url' },
    { table: 'stories', column: 'media_url' },
    { table: 'profiles', column: 'avatar_url' },
    { table: 'tasks', column: 'image_url' },
    { table: 'news', column: 'image_url' },
];

async function updateTable(table, column) {
    try {
        // Eski domain'i içeren kayıtları bul
        const { data, error } = await supabase
            .from(table)
            .select('id, ' + column)
            .like(column, `%${OLD_DOMAIN}%`);

        if (error) {
            console.log(`  ⚠️ ${table}.${column}: Tablo/kolon bulunamadı`);
            return { updated: 0, skipped: true };
        }

        if (!data || data.length === 0) {
            console.log(`  ○ ${table}.${column}: Güncellenecek kayıt yok`);
            return { updated: 0, skipped: false };
        }

        let updated = 0;
        for (const row of data) {
            const oldUrl = row[column];
            if (!oldUrl) continue;

            const newUrl = oldUrl.replace(OLD_DOMAIN, NEW_DOMAIN);

            const { error: updateError } = await supabase
                .from(table)
                .update({ [column]: newUrl })
                .eq('id', row.id);

            if (!updateError) {
                updated++;
            } else {
                console.log(`    ❌ ID ${row.id}: ${updateError.message}`);
            }
        }

        console.log(`  ✓ ${table}.${column}: ${updated}/${data.length} kayıt güncellendi`);
        return { updated, skipped: false };

    } catch (err) {
        console.log(`  ❌ ${table}.${column}: ${err.message}`);
        return { updated: 0, skipped: true };
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('   DATABASE URL UPDATE');
    console.log(`   ${OLD_DOMAIN}`);
    console.log(`   → ${NEW_DOMAIN}`);
    console.log('═'.repeat(50));

    let totalUpdated = 0;

    for (const { table, column } of TABLES_TO_UPDATE) {
        const result = await updateTable(table, column);
        totalUpdated += result.updated;
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`   TOPLAM: ${totalUpdated} URL güncellendi`);
    console.log('═'.repeat(50));
}

main().catch(console.error);
