/**
 * Supabase Database Migration Script
 * Cloud'dan Self-Hosted'a tüm tabloları taşıma
 * 
 * Kullanım: node scripts/migrate-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// Cloud Supabase (Kaynak)
const CLOUD_URL = 'https://batzvgczjldnnesojnjj.supabase.co';
const CLOUD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDk0MzY0MiwiZXhwIjoyMDgwNTE5NjQyfQ.aQhAO0xmY4LBCCftnt_CLFM4HvrLmFSpAumbl4_ObJo';

// Self-Hosted Supabase (Hedef)
const SELF_HOSTED_URL = 'http://api.kalkuyar.com';
const SELF_HOSTED_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY3ODQwMCwiZXhwIjo0OTIyMzUyMDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.px9vubI9i6D9GX773TcClq5ylUpzcAEjMVk59oKGAio';

// Domain değişikliği (URL'lerdeki eski domain'i yenisiyle değiştir)
const OLD_DOMAIN = 'https://batzvgczjldnnesojnjj.supabase.co';
const NEW_DOMAIN = 'https://api.kalkuyar.com';

const cloudSupabase = createClient(CLOUD_URL, CLOUD_SERVICE_KEY);
const selfHostedSupabase = createClient(SELF_HOSTED_URL, SELF_HOSTED_SERVICE_KEY);

// Taşınacak tablolar (sıralama önemli - foreign key bağımlılıkları)
// NOT: admins tablosu auth.users'a bağlı, manuel eklenmeli
const TABLES = [
    'profiles',
    'categories',
    'trainings',
    'news',
    'contact_messages',
    'tasks',
    'task_submissions',
    'task_reads',
    'training_reads',
    'stories',
    'points',
    'notifications',
    // 'admins' - auth.users bağımlılığı var, manuel eklenmeli
];

// URL içeren kolonlar (domain değişikliği için)
const URL_COLUMNS = {
    'trainings': ['image_url', 'audio_url'],
    'stories': ['media_url'],
    'profiles': ['avatar_url'],
    'tasks': ['image_url'],
    'news': ['image_url'],
};

function replaceUrls(row, table) {
    const columns = URL_COLUMNS[table];
    if (!columns) return row;

    const newRow = { ...row };
    for (const col of columns) {
        if (newRow[col] && typeof newRow[col] === 'string') {
            newRow[col] = newRow[col].replace(OLD_DOMAIN, NEW_DOMAIN);
        }
    }
    return newRow;
}

async function migrateTable(table) {
    console.log(`\n📋 Tablo: ${table}`);
    console.log('─'.repeat(40));

    try {
        // 1. Cloud'dan veriyi çek
        const { data, error } = await cloudSupabase
            .from(table)
            .select('*')
            .limit(10000);

        if (error) {
            console.log(`  ❌ Okuma hatası: ${error.message}`);
            return { table, success: 0, failed: 0, total: 0 };
        }

        if (!data || data.length === 0) {
            console.log(`  ○ Boş tablo`);
            return { table, success: 0, failed: 0, total: 0 };
        }

        console.log(`  Cloud'da ${data.length} kayıt bulundu`);

        // 2. Önce hedef tablodaki verileri temizle (opsiyonel)
        // const { error: deleteError } = await selfHostedSupabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // if (deleteError) console.log(`  ⚠️ Temizleme hatası: ${deleteError.message}`);

        // 3. Self-hosted'a yükle (URL'leri değiştirerek)
        let success = 0;
        let failed = 0;

        // Batch insert (50'şer kayıt)
        const batchSize = 50;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize).map(row => replaceUrls(row, table));

            const { error: insertError } = await selfHostedSupabase
                .from(table)
                .upsert(batch, { onConflict: 'id' });

            if (insertError) {
                console.log(`  ❌ Batch ${Math.floor(i / batchSize) + 1} hatası: ${insertError.message}`);
                failed += batch.length;
            } else {
                success += batch.length;
            }
        }

        console.log(`  ✓ ${success}/${data.length} kayıt aktarıldı`);
        if (failed > 0) console.log(`  ⚠️ ${failed} kayıt aktarılamadı`);

        return { table, success, failed, total: data.length };

    } catch (err) {
        console.log(`  ❌ Beklenmeyen hata: ${err.message}`);
        return { table, success: 0, failed: 0, total: 0 };
    }
}

async function main() {
    console.log('═'.repeat(50));
    console.log('   SUPABASE DATABASE MIGRATION');
    console.log('   Cloud → Self-Hosted');
    console.log('═'.repeat(50));

    const results = [];

    for (const table of TABLES) {
        const result = await migrateTable(table);
        results.push(result);
    }

    // Özet
    console.log('\n' + '═'.repeat(50));
    console.log('   ÖZET');
    console.log('═'.repeat(50));

    let totalSuccess = 0;
    let totalFailed = 0;
    let totalRecords = 0;

    for (const r of results) {
        if (r.total > 0) {
            console.log(`${r.table}: ${r.success}/${r.total}`);
        }
        totalSuccess += r.success;
        totalFailed += r.failed;
        totalRecords += r.total;
    }

    console.log('─'.repeat(50));
    console.log(`TOPLAM: ${totalSuccess}/${totalRecords} kayıt aktarıldı`);
    if (totalFailed > 0) {
        console.log(`⚠️ ${totalFailed} kayıt aktarılamadı`);
    }
    console.log('═'.repeat(50));

    console.log('\n⚠️ NOT: admins tablosu auth.users bağımlılığı nedeniyle');
    console.log('   manuel olarak eklenmelidir.');
}

main().catch(console.error);
