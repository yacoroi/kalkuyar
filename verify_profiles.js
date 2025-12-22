
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

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase keys in .env');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, city, district, neighborhood, role, points');

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            console.log('Profiles Data:', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

run();
