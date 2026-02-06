/**
 * Import Teams from CSV
 * 
 * CSV Format:
 * name,username,password
 * Team Alpha,team01,secretpass123
 * 
 * Usage: node scripts/import-teams.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file directly
function loadEnv() {
    const envPath = join(__dirname, '..', '.env.local');
    try {
        const envContent = readFileSync(envPath, 'utf-8');
        const env = {};
        for (const line of envContent.split('\n')) {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
        return env;
    } catch (err) {
        console.error('❌ Could not read .env.local file');
        process.exit(1);
    }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables in .env.local!');
    console.error('Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('✅ Loaded environment from .env.local');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importTeams(csvPath) {
    console.log('📂 Reading CSV file:', csvPath);

    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // Skip header row
    const teams = lines.slice(1).filter(line => line.trim()).map(line => {
        const [name, username, password] = line.split(',').map(s => s.trim());
        return { name, username, password };
    });

    console.log(`📋 Found ${teams.length} teams to import\n`);

    let success = 0;
    let failed = 0;

    for (const team of teams) {
        console.log(`🔄 Importing: ${team.username} (${team.name})`);

        const { data, error } = await supabase.rpc('insert_team_with_password', {
            p_name: team.name,
            p_username: team.username,
            p_password: team.password
        });

        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
            failed++;
        } else if (!data.success) {
            console.log(`   ⚠️ Skipped: ${data.error}`);
            failed++;
        } else {
            console.log(`   ✅ Created!`);
            success++;
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed/Skipped: ${failed}`);
}

// Default CSV path
const csvPath = process.argv[2] || join(__dirname, 'teams.csv');
importTeams(csvPath);
