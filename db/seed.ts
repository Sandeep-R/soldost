import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTamilWords() {
  try {
    console.log('🌱 Seeding Tamil word bank...');

    // Read seed SQL file
    const seedFilePath = path.join(
      process.cwd(),
      'db/seeds/tamil-word-bank.sql'
    );
    const seedSQL = fs.readFileSync(seedFilePath, 'utf-8');

    // Execute seed SQL
    const { error } = await supabase.rpc('execute_sql', {
      sql: seedSQL,
    });

    if (error) {
      console.error('❌ Error seeding data:', error);
      process.exit(1);
    }

    console.log('✅ Tamil word bank seeded successfully!');
  } catch (err) {
    console.error('❌ Seed script failed:', err);
    process.exit(1);
  }
}

seedTamilWords();
