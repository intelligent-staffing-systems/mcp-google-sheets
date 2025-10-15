#!/usr/bin/env node

/**
 * Test Google Sheets API access using Service Account credentials
 */

import https from 'https';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';

const SPREADSHEET_ID = '1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc';
const CREDENTIALS_PATH = '/Users/ldraney/Downloads/gen-lang-client-0502540690-387fcf5d8161.json';

/**
 * Create a JWT (JSON Web Token) for service account authentication
 */
function createJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: serviceAccount.token_uri,
    exp: now + 3600, // 1 hour
    iat: now
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');

  return `${signatureInput}.${signature}`;
}

/**
 * Exchange JWT for access token
 */
async function getAccessToken(serviceAccount) {
  const jwt = createJWT(serviceAccount);

  const postData = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  }).toString();

  const url = new URL(serviceAccount.token_uri);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve(parsed.access_token);
        } else {
          reject(new Error(`Token request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Get spreadsheet metadata
 */
async function getSpreadsheet(accessToken, spreadsheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GET failed: ${res.statusCode} ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Read values from a range
 */
async function getValues(accessToken, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GET failed: ${res.statusCode} ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Main test
 */
async function main() {
  try {
    console.log('🔑 Loading service account credentials...');
    const serviceAccount = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
    console.log('   Email:', serviceAccount.client_email);

    console.log('\n🎫 Getting access token...');
    const accessToken = await getAccessToken(serviceAccount);
    console.log('   ✓ Got access token:', accessToken.substring(0, 20) + '...');

    console.log('\n📊 Fetching spreadsheet metadata...');
    const spreadsheet = await getSpreadsheet(accessToken, SPREADSHEET_ID);
    console.log('   Title:', spreadsheet.properties.title);
    console.log('   URL:', spreadsheet.spreadsheetUrl);
    console.log('   Sheets:');
    spreadsheet.sheets.forEach(sheet => {
      const props = sheet.properties;
      console.log(`     - ${props.title} (${props.gridProperties.rowCount} rows × ${props.gridProperties.columnCount} cols)`);
    });

    // Try reading from first sheet
    const firstSheetName = spreadsheet.sheets[0].properties.title;
    const range = `${firstSheetName}!A1:Z10`;

    console.log(`\n📖 Reading range: ${range}`);
    const values = await getValues(accessToken, SPREADSHEET_ID, range);
    console.log('   Range:', values.range);
    console.log('   Rows found:', values.values?.length || 0);
    if (values.values && values.values.length > 0) {
      console.log('\n   First few rows:');
      values.values.slice(0, 5).forEach((row, i) => {
        console.log(`     Row ${i + 1}:`, row);
      });
    }

    console.log('\n✅ SUCCESS! Service account authentication is working.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.message.includes('403') || error.message.includes('404')) {
      console.log('\n💡 Tip: Make sure the spreadsheet is shared with:');
      console.log('   copy2-912@gen-lang-client-0502540690.iam.gserviceaccount.com');
    }
  }
}

main();
