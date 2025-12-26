/**
 * Supabase Storage Migration Script
 * Cloud'dan Self-Hosted'a dosya taşıma
 * 
 * Kullanım:
 * 1. Bu dosyayı çalıştırmadan önce .env değerlerini doldurun
 * 2. node scripts/migrate-storage.js
 */

// Gerekli: npm install @supabase/supabase-js dotenv

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============ AYARLAR ============
// Cloud Supabase (Kaynak)
const CLOUD_URL = 'https://batzvgczjldnnesojnjj.supabase.co';
const CLOUD_SERVICE_KEY = process.env.CLOUD_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdHp2Z2N6amxkbm5lc29qbmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDk0MzY0MiwiZXhwIjoyMDgwNTE5NjQyfQ.aQhAO0xmY4LBCCftnt_CLFM4HvrLmFSpAumbl4_ObJo';

// Self-Hosted Supabase (Hedef)
const SELF_HOSTED_URL = process.env.SELF_HOSTED_URL || 'http://api.kalkuyar.com';
const SELF_HOSTED_SERVICE_KEY = process.env.SELF_HOSTED_SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NjY3ODQwMCwiZXhwIjo0OTIyMzUyMDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.px9vubI9i6D9GX773TcClq5ylUpzcAEjMVk59oKGAio';

// Taşınacak bucket'lar
const BUCKETS = ['stories', 'avatars', 'content_audio', 'content_media', 'content_images'];
// =================================

const cloudSupabase = createClient(CLOUD_URL, CLOUD_SERVICE_KEY);
const selfHostedSupabase = createClient(SELF_HOSTED_URL, SELF_HOSTED_SERVICE_KEY);

async function listAllFiles(supabase, bucket, folder = '') {
    const allFiles = [];

    const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, { limit: 1000 });

    if (error) {
        console.error(`Hata (${bucket}/${folder}):`, error.message);
        return allFiles;
    }

    for (const item of data || []) {
        if (item.id === null) {
            // Bu bir klasör, içine gir
            const subPath = folder ? `${folder}/${item.name}` : item.name;
            const subFiles = await listAllFiles(supabase, bucket, subPath);
            allFiles.push(...subFiles);
        } else {
            // Bu bir dosya
            const filePath = folder ? `${folder}/${item.name}` : item.name;
            allFiles.push(filePath);
        }
    }

    return allFiles;
}

async function migrateFile(bucket, filePath) {
    try {
        // 1. Cloud'dan indir
        const { data: blob, error: downloadError } = await cloudSupabase.storage
            .from(bucket)
            .download(filePath);

        if (downloadError) {
            console.error(`  ❌ İndirme hatası: ${filePath}`, downloadError.message);
            return false;
        }

        // 2. Self-hosted'a yükle
        const { error: uploadError } = await selfHostedSupabase.storage
            .from(bucket)
            .upload(filePath, blob, {
                upsert: true,
                contentType: blob.type
            });

        if (uploadError) {
            console.error(`  ❌ Yükleme hatası: ${filePath}`, uploadError.message);
            return false;
        }

        console.log(`  ✓ ${filePath}`);
        return true;

    } catch (err) {
        console.error(`  ❌ Beklenmeyen hata: ${filePath}`, err.message);
        return false;
    }
}

async function migrateBucket(bucket) {
    console.log(`\n📁 Bucket: ${bucket}`);
    console.log('─'.repeat(40));

    // Önce self-hosted'da bucket var mı kontrol et
    const { data: buckets } = await selfHostedSupabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);

    if (!bucketExists) {
        console.log(`  ⚠️ Bucket "${bucket}" self-hosted'da yok, oluşturuluyor...`);
        const { error } = await selfHostedSupabase.storage.createBucket(bucket, { public: true });
        if (error) {
            console.error(`  ❌ Bucket oluşturulamadı:`, error.message);
            return { total: 0, success: 0, failed: 0 };
        }
        console.log(`  ✓ Bucket oluşturuldu`);
    }

    // Dosyaları listele
    const files = await listAllFiles(cloudSupabase, bucket);
    console.log(`  Toplam dosya: ${files.length}`);

    if (files.length === 0) {
        console.log(`  (boş bucket)`);
        return { total: 0, success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    for (const file of files) {
        const result = await migrateFile(bucket, file);
        if (result) success++;
        else failed++;
    }

    return { total: files.length, success, failed };
}

async function main() {
    console.log('═'.repeat(50));
    console.log('   SUPABASE STORAGE MIGRATION');
    console.log('   Cloud → Self-Hosted');
    console.log('═'.repeat(50));

    const results = [];

    for (const bucket of BUCKETS) {
        const result = await migrateBucket(bucket);
        results.push({ bucket, ...result });
    }

    // Özet
    console.log('\n' + '═'.repeat(50));
    console.log('   ÖZET');
    console.log('═'.repeat(50));

    let totalFiles = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const r of results) {
        console.log(`${r.bucket}: ${r.success}/${r.total} başarılı`);
        totalFiles += r.total;
        totalSuccess += r.success;
        totalFailed += r.failed;
    }

    console.log('─'.repeat(50));
    console.log(`TOPLAM: ${totalSuccess}/${totalFiles} dosya taşındı`);
    if (totalFailed > 0) {
        console.log(`⚠️ ${totalFailed} dosya taşınamadı`);
    }
    console.log('═'.repeat(50));
}

main().catch(console.error);
