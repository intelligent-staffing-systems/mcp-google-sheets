#!/usr/bin/env node

/**
 * Test the MCP tools by calling the handlers directly
 */

import { GoogleSheetsClient } from './src/google-sheets-client.js';
import { sheetHandlers } from './src/handlers/sheet-handlers.js';
import { valueHandlers } from './src/handlers/value-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;

async function main() {
  try {
    console.log('🧪 Testing MCP Tool Handlers\n');

    // Initialize client
    const client = new GoogleSheetsClient({
      serviceAccountPath: SERVICE_ACCOUNT_PATH
    });

    // Test 1: get_spreadsheet
    console.log('📊 Test 1: get_spreadsheet');
    const spreadsheet = await sheetHandlers.getSpreadsheet(client, {
      spreadsheet_id: SPREADSHEET_ID,
      include_grid_data: false
    });
    console.log(spreadsheet.success ? '   ✓ Success' : '   ✗ Failed');
    if (spreadsheet.success) {
      console.log(`   Title: ${spreadsheet.data.properties.title}`);
      console.log(`   Sheets: ${spreadsheet.data.sheets?.length}`);
    } else {
      console.log(`   Error: ${spreadsheet.error}`);
    }

    // Test 2: list_sheets
    console.log('\n📋 Test 2: list_sheets');
    const sheets = await sheetHandlers.listSheets(client, {
      spreadsheet_id: SPREADSHEET_ID
    });
    console.log(sheets.success ? '   ✓ Success' : '   ✗ Failed');
    if (sheets.success) {
      console.log(`   Found ${sheets.data.length} sheets`);
      console.log(`   First sheet: ${sheets.data[0]?.title}`);
    } else {
      console.log(`   Error: ${sheets.error}`);
    }

    // Test 3: get_values
    console.log('\n📖 Test 3: get_values');
    const firstSheet = sheets.data[0]?.title;
    const values = await valueHandlers.getValues(client, {
      spreadsheet_id: SPREADSHEET_ID,
      range: `${firstSheet}!A1:D5`
    });
    console.log(values.success ? '   ✓ Success' : '   ✗ Failed');
    if (values.success) {
      console.log(`   Range: ${values.data.range}`);
      console.log(`   Rows: ${values.data.values?.length || 0}`);
      if (values.data.values && values.data.values.length > 0) {
        console.log(`   First row: ${JSON.stringify(values.data.values[0])}`);
      }
    } else {
      console.log(`   Error: ${values.error}`);
    }

    // Test 4: batch_get_values
    console.log('\n📚 Test 4: batch_get_values');
    const batchValues = await valueHandlers.batchGetValues(client, {
      spreadsheet_id: SPREADSHEET_ID,
      ranges: [
        `${firstSheet}!A1:A3`,
        `${firstSheet}!B1:B3`
      ]
    });
    console.log(batchValues.success ? '   ✓ Success' : '   ✗ Failed');
    if (batchValues.success) {
      console.log(`   Ranges fetched: ${batchValues.data.valueRanges?.length}`);
    } else {
      console.log(`   Error: ${batchValues.error}`);
    }

    // Test 5: Validation - missing required fields
    console.log('\n🔍 Test 5: Validation (missing spreadsheet_id)');
    const invalidResult = await valueHandlers.getValues(client, {
      range: 'Sheet1!A1'
    });
    console.log(!invalidResult.success ? '   ✓ Correctly rejected' : '   ✗ Should have failed');
    if (!invalidResult.success) {
      console.log(`   Error message: ${invalidResult.error}`);
    }

    console.log('\n✅ All MCP tool tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
