#!/usr/bin/env node
// @ts-check
/**
 * Test script to verify MCP server setup
 */

import 'dotenv/config';
import { createSheetsClient } from './src/client/sheets-client.js';
import { parseSpreadsheetInput } from './src/utils/url-parser.js';

async function test() {
  console.log('🧪 Testing mcp-sheets setup...\n');

  // Test 1: Environment variables
  console.log('1. Checking environment variables...');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set');
    process.exit(1);
  }
  console.log('✅ GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    console.warn('⚠️  GOOGLE_SPREADSHEET_ID not set (optional)');
  } else {
    console.log('✅ GOOGLE_SPREADSHEET_ID:', process.env.GOOGLE_SPREADSHEET_ID);
  }

  // Test 2: URL parser
  console.log('\n2. Testing URL parser...');
  const testUrl = 'https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=1850828774#gid=1850828774';
  const parsed = parseSpreadsheetInput(testUrl);
  console.log('✅ URL parsed:', parsed);

  // Test 3: Create Sheets client
  console.log('\n3. Creating Google Sheets API client...');
  let client;
  try {
    client = await createSheetsClient();
    console.log('✅ Sheets client created successfully');
  } catch (error) {
    console.error('❌ Failed to create client:', error.message);
    process.exit(1);
  }

  // Test 4: Get spreadsheet metadata
  if (process.env.GOOGLE_SPREADSHEET_ID) {
    console.log('\n4. Testing spreadsheet access...');
    try {
      const spreadsheet = await client.getSpreadsheet(
        process.env.GOOGLE_SPREADSHEET_ID,
        false
      );
      console.log('✅ Successfully accessed spreadsheet:');
      console.log('   - Title:', spreadsheet.properties?.title);
      console.log('   - URL:', spreadsheet.spreadsheetUrl);
      console.log('   - Sheets:', spreadsheet.sheets?.length || 0);
      spreadsheet.sheets?.forEach((sheet) => {
        console.log('     -', sheet.properties?.title);
      });
    } catch (error) {
      console.error('❌ Failed to access spreadsheet:', error.message);
      console.error('   Make sure the service account has access to this spreadsheet!');
      process.exit(1);
    }
  }

  console.log('\n✅ All tests passed! MCP server is ready to use.\n');
}

test().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
