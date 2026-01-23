const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking connection to:', supabaseUrl);

    const { data, error } = await supabase.from('organizations').select('count').limit(1);

    if (error) {
        console.error('Error querying organizations table:', error);
    } else {
        console.log('Organizations table exists and is accessible.');
    }
}

checkTables();
