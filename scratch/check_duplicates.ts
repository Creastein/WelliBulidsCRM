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

const newWhatsapps = [
  '+628123933009',
  '+628123483570',
  '+628179666777',
  '+6282119822272',
  '+628119721888',
  '+6282266216466',
  '+6282146002397',
  '+6281316934203',
  '+6287821281055',
  '+62818354414',
  '+6281584067573',
  '+6285216919947',
  '+628113992267',
  '+6281338615078'
];

async function main() {
    console.log('Checking database for duplicate phone numbers...');
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, name, business_name, phone, status');

    if (error) {
        console.error('Error fetching leads:', error.message);
        return;
    }

    const duplicates: any[] = [];
    
    leads.forEach(lead => {
        const dbPhone = (lead.phone || '').replace(/[^0-9]/g, '');
        if (!dbPhone) return;

        newWhatsapps.forEach(newWa => {
            const cleanNewWa = newWa.replace(/[^0-9]/g, '');
            if (dbPhone.includes(cleanNewWa) || cleanNewWa.includes(dbPhone)) {
                duplicates.push({
                    dbId: lead.id,
                    dbName: lead.business_name || lead.name,
                    dbPhone: lead.phone,
                    dbStatus: lead.status,
                    matchedWa: newWa
                });
            }
        });
    });

    if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicates in database:`);
        duplicates.forEach(d => {
            console.log(`Matched new WA ${d.matchedWa} with existing ID: ${d.dbId} (${d.dbName}) | Phone: ${d.dbPhone} | Status: ${d.dbStatus}`);
        });
    } else {
        console.log('No duplicates found in database.');
    }
}

main().catch(console.error);
