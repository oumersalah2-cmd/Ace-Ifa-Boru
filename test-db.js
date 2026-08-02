const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Resolve and read the active .env database URL
const envPath = path.resolve(__dirname, 'packages/backend/.env');
let connectionString = 'postgresql://postgres.gbtjonbaatizeaqfcexb:IFABORU12%40%40a@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const matches = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (matches) {
    connectionString = matches[1];
  }
} catch (e) {
  console.warn("Could not load packages/backend/.env, using default fallback connection string.");
}

const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log(res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client.end();
  });
