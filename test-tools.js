#!/usr/bin/env node
// @ts-check
/**
 * Test script to verify MCP tools work correctly
 */

import 'dotenv/config';
import { createSheetsClient } from './src/client/sheets-client.js';
import { getAllToolDefinitions, handleToolCall } from './src/tools/index.js';

async function test() {
  console.log('🧪 Testing MCP tools...\n');

  // Create client
  console.log('1. Creating Sheets client...');
  const client = await createSheetsClient();
  console.log('✅ Client created\n');

  // List all tools
  console.log('2. Available tools:');
  const tools = getAllToolDefinitions();
  tools.forEach((tool) => {
    console.log(`   - ${tool.name}`);
  });
  console.log(`✅ ${tools.length} tools registered\n`);

  // Test get-spreadsheet with URL
  console.log('3. Testing get-spreadsheet tool with URL...');
  const testUrl = 'https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=1850828774';

  try {
    const result = await handleToolCall(
      'get-spreadsheet',
      {
        spreadsheetId: testUrl,
        includeGridData: false,
      },
      client
    );

    console.log('✅ Tool executed successfully!');
    console.log('\nResult:');
    console.log(result.content[0].text);
  } catch (error) {
    console.error('❌ Tool failed:', error.message);
    process.exit(1);
  }

  // Test get-values
  console.log('\n4. Testing get-values tool...');
  try {
    const result = await handleToolCall(
      'get-values',
      {
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: '(0) Template Formula!A1:C3',
      },
      client
    );

    console.log('✅ Tool executed successfully!');
    console.log('\nResult:');
    console.log(result.content[0].text);
  } catch (error) {
    console.error('❌ Tool failed:', error.message);
    console.error('   (This might fail if the sheet name or range doesn\'t exist)');
  }

  console.log('\n✅ Tool tests complete!\n');
}

test().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
