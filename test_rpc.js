
const { createClient } = require('@supabase/supabase-js');
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
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Testing RPC 'get_leaderboard'...");

        // Test City Scope
        const { data: cityData, error: cityError } = await supabase.rpc('get_leaderboard', {
            p_scope: 'city',
            p_city: 'İstanbul',
            p_district: '',
            p_neighborhood: '',
            p_limit: 50
        });

        if (cityError) console.error('City Scope Error:', cityError);
        else console.log('City Scope Results:', JSON.stringify(cityData, null, 2));

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
