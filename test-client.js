#!/usr/bin/env node

/**
 * Test the Google Sheets API client
 */

import { GoogleSheetsClient } from './src/google-sheets-client.js';
import dotenv from 'dotenv';

dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc';
const SERVICE_ACCOUNT_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || '/Users/ldraney/Downloads/gen-lang-client-0502540690-387fcf5d8161.json';

async function main() {
  try {
    console.log('🚀 Initializing Google Sheets client...');
    const client = new GoogleSheetsClient({
      serviceAccountPath: SERVICE_ACCOUNT_PATH
    });

    console.log('\n📊 Test 1: Get spreadsheet metadata');
    const spreadsheet = await client.getSpreadsheet(SPREADSHEET_ID);
    if (spreadsheet.success) {
      console.log('   ✓ Title:', spreadsheet.data.properties.title);
      console.log('   ✓ URL:', spreadsheet.data.spreadsheetUrl);
      console.log('   ✓ Number of sheets:', spreadsheet.data.sheets?.length);
    } else {
      console.log('   ✗ Error:', spreadsheet.error);
    }

    console.log('\n📋 Test 2: List all sheets');
    const sheets = await client.listSheets(SPREADSHEET_ID);
    if (sheets.success) {
      console.log(`   ✓ Found ${sheets.data.length} sheets:`);
      sheets.data.slice(0, 5).forEach(sheet => {
        console.log(`      - ${sheet.title} (${sheet.rowCount} rows × ${sheet.columnCount} cols)`);
      });
      if (sheets.data.length > 5) {
        console.log(`      ... and ${sheets.data.length - 5} more`);
      }
    } else {
      console.log('   ✗ Error:', sheets.error);
    }

    console.log('\n📖 Test 3: Read values from a range');
    const firstSheetName = sheets.data[0].title;
    const range = `${firstSheetName}!A1:D10`;
    const values = await client.getValues(SPREADSHEET_ID, range);
    if (values.success) {
      console.log('   ✓ Range:', values.data.range);
      console.log('   ✓ Rows:', values.data.values?.length || 0);
      if (values.data.values && values.data.values.length > 0) {
        console.log('   ✓ First row:', values.data.values[0]);
      }
    } else {
      console.log('   ✗ Error:', values.error);
    }

    console.log('\n📚 Test 4: Batch get values from multiple ranges');
    const ranges = [
      `${firstSheetName}!A1:A5`,
      `${firstSheetName}!B1:B5`
    ];
    const batchValues = await client.batchGetValues(SPREADSHEET_ID, ranges);
    if (batchValues.success) {
      console.log('   ✓ Ranges fetched:', batchValues.data.valueRanges?.length);
      batchValues.data.valueRanges?.forEach((vr, i) => {
        console.log(`      Range ${i + 1}: ${vr.range} (${vr.values?.length || 0} rows)`);
      });
    } else {
      console.log('   ✗ Error:', batchValues.error);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
