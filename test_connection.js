// test_connection.js
require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found in .env file.');
  process.exit(1);
}

console.log('Attempting to connect to the database...');
console.log('Testing URL:', connectionString.replace(/:[^:]*@/, ':[REDACTED_PASSWORD]@'));


const client = new Client({
  connectionString: connectionString,
});

client.connect()
  .then(() => {
    console.log('\n---');
    console.log('✅ SUCCESS: Successfully connected to the database!');
    console.log('---');
    console.log('\nThis confirms your DATABASE_URL is correct and the network path is open.');
    console.log('The issue is likely with how Prisma interacts with your specific database environment.');
    client.end();
  })
  .catch(err => {
    console.error('\n---');
    console.error('❌ ERROR: Failed to connect to the database.');
    console.error('---');
    console.error('\nThis confirms the issue is with your DATABASE_URL (password, host, port) or a network firewall, not with Prisma.');
    console.error('\nError Details:', err.message);
    client.end();
  });