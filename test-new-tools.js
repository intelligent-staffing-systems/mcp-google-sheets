#!/usr/bin/env node

/**
 * Test the new MCP tools: get_sheet_by_gid and get_formulas
 */

import { GoogleSheetsClient } from './src/google-sheets-client.js';
import { sheetHandlers } from './src/handlers/sheet-handlers.js';
import { valueHandlers } from './src/handlers/value-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const TEST_GID = 241635364; // (16) Everyday Day Moisturizer

async function main() {
  try {
    console.log('🧪 Testing New MCP Tools\n');

    // Initialize client
    const client = new GoogleSheetsClient({
      serviceAccountPath: SERVICE_ACCOUNT_PATH
    });

    // Test 1: get_sheet_by_gid
    console.log('📍 Test 1: get_sheet_by_gid');
    console.log(`   Looking for gid: ${TEST_GID}`);
    const sheetByGid = await sheetHandlers.getSheetByGid(client, {
      spreadsheet_id: SPREADSHEET_ID,
      gid: TEST_GID
    });

    if (sheetByGid.success) {
      console.log('   ✓ Success!');
      console.log(`   Sheet name: ${sheetByGid.data.title}`);
      console.log(`   Sheet ID: ${sheetByGid.data.sheetId}`);
      console.log(`   Index: ${sheetByGid.data.index}`);
      console.log(`   Dimensions: ${sheetByGid.data.rowCount} rows × ${sheetByGid.data.columnCount} cols`);
    } else {
      console.log('   ✗ Failed');
      console.log(`   Error: ${sheetByGid.error}`);
      return;
    }

    // Test 2: get_formulas
    console.log('\n📐 Test 2: get_formulas');
    const sheetName = sheetByGid.data.title;
    const range = `${sheetName}!F9:H12`; // Range with formulas
    console.log(`   Reading formulas from: ${range}`);

    const formulas = await valueHandlers.getFormulas(client, {
      spreadsheet_id: SPREADSHEET_ID,
      range: range
    });

    if (formulas.success) {
      console.log('   ✓ Success!');
      console.log(`   Range: ${formulas.data.range}`);
      console.log(`   Rows: ${formulas.data.values?.length || 0}`);
      console.log('\n   Formulas found:');
      formulas.data.values?.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell && cell.toString().startsWith('=')) {
            const col = String.fromCharCode(70 + j); // F, G, H...
            console.log(`     ${col}${i + 9}: ${cell}`);
          }
        });
      });
    } else {
      console.log('   ✗ Failed');
      console.log(`   Error: ${formulas.error}`);
    }

    // Test 3: Validation - invalid gid
    console.log('\n🔍 Test 3: Validation (invalid gid)');
    const invalidGid = await sheetHandlers.getSheetByGid(client, {
      spreadsheet_id: SPREADSHEET_ID,
      gid: 999999999
    });
    console.log(!invalidGid.success ? '   ✓ Correctly rejected' : '   ✗ Should have failed');
    if (!invalidGid.success) {
      console.log(`   Error message: ${invalidGid.error}`);
    }

    // Test 4: Validation - missing gid
    console.log('\n🔍 Test 4: Validation (missing gid)');
    const missingGid = await sheetHandlers.getSheetByGid(client, {
      spreadsheet_id: SPREADSHEET_ID
    });
    console.log(!missingGid.success ? '   ✓ Correctly rejected' : '   ✗ Should have failed');
    if (!missingGid.success) {
      console.log(`   Error message: ${missingGid.error}`);
    }

    console.log('\n✅ All new tool tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
