import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '../supabase/migrations/20260523000000_init.sql'), 'utf8');

const PROJECT_REF = 'cfxujraugcmiymmmpdnc';
const PASSWORD = '@*2JznfY!mV2A8@4s3x22eAmt!';

// Try multiple Supabase connection endpoints
const configs = [
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres', label: 'direct' },
  { host: `aws-0-eu-central-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}`, label: 'eu-session-pooler' },
  { host: `aws-0-us-east-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}`, label: 'us-east-session-pooler' },
  { host: `aws-0-us-west-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}`, label: 'us-west-session-pooler' },
  { host: `aws-0-ap-southeast-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}`, label: 'ap-session-pooler' },
];

for (const cfg of configs) {
  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    database: 'postgres',
    user: cfg.user,
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    process.stdout.write(`Trying ${cfg.label}... `);
    await client.connect();
    console.log('connected!');
    await client.query(sql);
    console.log('Migration applied successfully');
    await client.end();
    process.exit(0);
  } catch (err) {
    try { await client.end(); } catch {}
    console.log(`failed (${err.message.split('\n')[0]})`);
  }
}

console.error('\nAll connection attempts failed.');
console.error('Please run the migration manually in Supabase SQL editor:');
console.error('https://supabase.com/dashboard/project/cfxujraugcmiymmmpdnc/sql/new');
process.exit(1);
