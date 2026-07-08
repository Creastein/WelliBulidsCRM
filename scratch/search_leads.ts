import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

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

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const keywords = ['Client', 'Malang', 'Batu', 'Trawangan', 'Urrohman', 'Iwan', 'Christine', 'Auliya'];
    console.log('Searching for keywords across name, notes, business_name, locations...');
    
    for (const kw of keywords) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .or(`name.ilike.%${kw}%,notes.ilike.%${kw}%,location.ilike.%${kw}%`);
        
        if (error) {
            console.error(`Error searching for ${kw}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`\nFound ${data.length} matches for "${kw}":`);
            data.forEach(lead => {
                console.log(`ID: ${lead.id} | Name: ${lead.name} | Status: ${lead.status} | Niche: ${lead.niche} | Location: ${lead.location}`);
                console.log(`Notes: ${lead.notes}`);
                console.log(`Action: ${lead.action}`);
                console.log(`Priority: ${lead.priority}`);
                console.log('---');
            });
        } else {
            console.log(`No matches for "${kw}".`);
        }
    }
}

main().catch(console.error);
