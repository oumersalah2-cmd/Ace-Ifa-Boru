const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.gbtjonbaatizeaqfcexb:IFABORU12%40%40a@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
});

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
