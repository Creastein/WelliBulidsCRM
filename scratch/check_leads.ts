import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Parse .env.local manually to get Supabase credentials
const envPath = '.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        env[match[1]] = val;
    }
});

const supabaseUrl = env['SUPABASE_URL'] || env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching leads from Supabase...');
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching leads:', error.message);
        return;
    }

    console.log(`Found ${leads.length} leads:`);
    leads.forEach(lead => {
        console.log(`ID: ${lead.id} | Name: ${lead.name} | Status: ${lead.status} | Niche: ${lead.niche} | Location: ${lead.location}`);
        console.log(`  Notes: ${lead.notes}`);
        console.log(`  Action: ${lead.action}`);
        console.log(`  Priority: ${lead.priority}`);
        console.log(`  Assigned To: ${lead.assigned_to}`);
        console.log(`  Email: ${lead.email}`);
        console.log(`  Estimated Value: ${lead.estimated_value}`);
        console.log('--------------------------------------------------');
    });
}

main().catch(console.error);
