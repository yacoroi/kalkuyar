// Self-Hosted Supabase Bağlantı Testi
// Çalıştır: node scripts/test-connection.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://api.kalkuyar.com';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY3ODQwMCwiZXhwIjo0OTIyMzUyMDAwLCJyb2xlIjoiYW5vbiJ9._G7KEqNiKVmaCuve2aUkabnCAHweRpKUcJgt_s3LDnQ';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY3ODQwMCwiZXhwIjo0OTIyMzUyMDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.px9vubI9i6D9GX773TcClq5ylUpzcAEjMVk59oKGAio';

async function testConnection() {
    console.log('═'.repeat(50));
    console.log('   SUPABASE CONNECTION TEST');
    console.log('   URL:', SUPABASE_URL);
    console.log('═'.repeat(50));

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Health Check
    console.log('\n📡 Health Check...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: { 'apikey': SUPABASE_ANON_KEY }
        });
        console.log('   Status:', res.status, res.status === 200 ? '✓' : '❌');
    } catch (err) {
        console.log('   ❌ Bağlantı hatası:', err.message);
        return;
    }

    // 2. Tablo Sayıları
    console.log('\n📋 Tablo Verileri:');

    const tables = ['trainings', 'news', 'tasks', 'stories', 'admins', 'profiles'];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabaseAdmin
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`   ${table}: ❌ ${error.message}`);
            } else {
                console.log(`   ${table}: ${count} kayıt ✓`);
            }
        } catch (err) {
            console.log(`   ${table}: ❌ ${err.message}`);
        }
    }

    // 3. Auth Test
    console.log('\n🔐 Auth Servisi:');
    try {
        const { data, error } = await supabase.auth.getSession();
        console.log('   Auth çalışıyor ✓');
    } catch (err) {
        console.log('   ❌ Auth hatası:', err.message);
    }

    // 4. Admins Tablosu Detay
    console.log('\n👤 Admins Tablosu:');
    const { data: admins, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('id, username, full_name');

    if (adminError) {
        console.log('   ❌', adminError.message);
    } else if (!admins || admins.length === 0) {
        console.log('   ⚠️ Admins tablosu BOŞ - Admin oluşturmanız gerekiyor!');
    } else {
        console.log('   Mevcut adminler:');
        admins.forEach(a => console.log(`   - ${a.username} (${a.full_name})`));
    }

    console.log('\n' + '═'.repeat(50));
}

testConnection().catch(console.error);
