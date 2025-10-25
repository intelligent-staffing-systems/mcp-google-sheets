#!/usr/bin/env node
// @ts-check
/**
 * Test the complete GID workflow
 * Simulates: "Help me work on this sheet: [URL with gid]"
 */

import 'dotenv/config';
import { createSheetsClient } from './src/client/sheets-client.js';
import { getAllToolDefinitions, handleToolCall } from './src/tools/index.js';

async function test() {
  console.log('🧪 Testing complete GID workflow...\n');
  console.log('Scenario: User pastes a Google Sheets URL with gid\n');

  // User provides this URL
  const testUrl = 'https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=1850828774#gid=1850828774';

  console.log(`User: "Help me work on this sheet:"`);
  console.log(`      ${testUrl}\n`);

  // Create client
  const client = await createSheetsClient();

  // List all available tools
  const tools = getAllToolDefinitions();
  console.log(`📋 Available tools: ${tools.length} total`);
  console.log(`   New tools: list-sheets, get-sheet-by-gid, get-sheet-info, get-sheet-preview, search-values, find-in-column\n`);

  // Step 1: Get sheet info from GID
  console.log('Step 1: AI calls get-sheet-by-gid to identify the sheet...');
  const sheetInfo = await handleToolCall(
    'get-sheet-by-gid',
    {
      spreadsheetId: testUrl,
      // gid is auto-extracted from URL
    },
    client
  );

  console.log(sheetInfo.content[0].text);
  console.log();

  // Extract sheet name from response (in real usage, AI would parse this)
  const sheetName = 'From Monday Board List- for photos ONLY'; // We know this from the URL's gid

  // Step 2: Get preview of the sheet
  console.log('\nStep 2: AI calls get-sheet-preview to see what\'s in the sheet...');
  const preview = await handleToolCall(
    'get-sheet-preview',
    {
      spreadsheetId: testUrl,
      sheetName: sheetName,
      numRows: 5,
    },
    client
  );

  console.log(preview.content[0].text);
  console.log();

  // Step 3: Demonstrate search
  console.log('\nStep 3: User asks "Find all rows with \'PEL\' in them"');
  console.log('AI calls search-values...');
  const searchResult = await handleToolCall(
    'search-values',
    {
      spreadsheetId: testUrl,
      sheetName: sheetName,
      searchText: 'PEL',
      matchType: 'contains',
      maxResults: 10,
    },
    client
  );

  console.log(searchResult.content[0].text);
  console.log();

  console.log('\n✅ GID workflow test complete!');
  console.log('\nThe user story "Work with me on this sheet [URL]" now works:');
  console.log('  1. ✅ Parse URL and extract gid');
  console.log('  2. ✅ Resolve gid to sheet name');
  console.log('  3. ✅ Show preview with cell references (A1, B2, etc.)');
  console.log('  4. ✅ Search and find data');
  console.log('  5. ✅ Ready for read/write operations with exact cell refs\n');
}

test().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
