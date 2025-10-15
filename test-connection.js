#!/usr/bin/env node

/**
 * Test script to check what credentials are needed for Google Sheets API
 *
 * The spreadsheet URL:
 * https://docs.google.com/spreadsheets/d/1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc/edit?gid=150116909#gid=150116909
 *
 * Spreadsheet ID: 1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc
 */

import https from 'https';

const SPREADSHEET_ID = '1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc';
const BASE_URL = 'https://sheets.googleapis.com/v4';

/**
 * Test 1: Try reading without any authentication (public sheet)
 */
async function testPublicAccess() {
  console.log('\n=== Test 1: Public Access (no auth) ===');
  const url = `${BASE_URL}/spreadsheets/${SPREADSHEET_ID}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data.substring(0, 500));
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

/**
 * Test 2: Try reading with API key (if provided via env)
 */
async function testWithApiKey(apiKey) {
  console.log('\n=== Test 2: With API Key ===');
  const url = `${BASE_URL}/spreadsheets/${SPREADSHEET_ID}?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('Success! Spreadsheet info:');
          console.log('  Title:', parsed.properties?.title);
          console.log('  Sheets:', parsed.sheets?.map(s => s.properties?.title).join(', '));
          console.log('  URL:', parsed.spreadsheetUrl);
        } else {
          console.log('Response:', data.substring(0, 500));
        }
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

/**
 * Test 3: Try reading a specific range with API key
 */
async function testReadRange(apiKey, range = 'Sheet1!A1:B10') {
  console.log(`\n=== Test 3: Read Range "${range}" ===`);
  const url = `${BASE_URL}/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('Success! Data:');
          console.log('  Range:', parsed.range);
          console.log('  Rows:', parsed.values?.length || 0);
          console.log('  Values:', JSON.stringify(parsed.values?.slice(0, 5), null, 2));
        } else {
          console.log('Response:', data.substring(0, 500));
        }
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

/**
 * Main test runner
 */
async function main() {
  console.log('Testing Google Sheets API access...');
  console.log('Spreadsheet ID:', SPREADSHEET_ID);

  try {
    // Test 1: No auth
    await testPublicAccess();

    // Test 2 & 3: With API key (if available)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      console.log('\nAPI Key found in environment');
      await testWithApiKey(apiKey);
      await testReadRange(apiKey);
    } else {
      console.log('\n⚠️  No GOOGLE_API_KEY found in environment');
      console.log('\nTo test with API key:');
      console.log('1. Get an API key from: https://console.cloud.google.com/apis/credentials');
      console.log('2. Enable Google Sheets API in your project');
      console.log('3. Set environment variable: export GOOGLE_API_KEY="your-key-here"');
      console.log('4. Run again: GOOGLE_API_KEY="your-key" node test-connection.js');
    }

    console.log('\n=== Summary ===');
    console.log('For PUBLIC sheets (shared with "Anyone with the link"):');
    console.log('  ✓ API Key required');
    console.log('\nFor PRIVATE sheets:');
    console.log('  ✓ OAuth 2.0 credentials required');
    console.log('  ✓ Service account credentials required');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
