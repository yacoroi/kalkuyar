
const { createClient } = require('@supabase/supabase-js');

// Helper to read env (since we can't easily rely on process.env in this standalone script context without config)
// I will assume I can't read .env easily here, so I need the keys.
// Since I cannot access user secrets directly, I will assume the keys are available in the environment 
// OR I have to ask the user/check the codebase for where they are initialized.
// checking `lib/supabase.ts` might reveal if they are hardcoded (unlikely) or used from process.env.
// Accessing `.env` file via `read_file` is allowed since I am in the workspace.

// I'll just write a script that assumes keys are passed or I'll read .env manually.
// Let's try to read .env first in next step or use `cat` but I can just do it in the script logic if I read the file.

const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) envVars[key.trim()] = value.trim();
        });

        const supabaseUrl = envVars['EXPO_PUBLIC_SUPABASE_URL'];
        const supabaseKey = envVars['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase keys in .env');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('content_packs')
            .select('id, title, media_url, image_url, is_active')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching data:', error);
        } else {
            console.log('Active Content Packs:', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
