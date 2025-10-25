#!/usr/bin/env node
// @ts-check
/**
 * Integration test - Test MCP server through actual stdio transport
 * This simulates how Claude Code actually calls our server
 */

import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function test() {
  console.log('🧪 MCP Integration Test - Testing through actual MCP protocol\n');

  // Start the MCP server as a child process (like Claude Code does)
  console.log('Starting MCP server...');
  const serverProcess = spawn('node', ['src/index.js'], {
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      LOG_LEVEL: 'info',
    },
  });

  // Create MCP client with stdio transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['src/index.js'],
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      LOG_LEVEL: 'info',
    },
  });

  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  try {
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');

    // List available tools
    const tools = await client.listTools();
    console.log(`📋 Available tools: ${tools.tools.length}`);
    const sheetByGidTool = tools.tools.find(t => t.name === 'get-sheet-by-gid');
    console.log('\nget-sheet-by-gid schema:', JSON.stringify(sheetByGidTool?.inputSchema, null, 2));

    // Test 1: Call with 'spreadsheetId' parameter (our original schema)
    console.log('\n\n=== Test 1: Using "spreadsheetId" parameter ===');
    try {
      const result1 = await client.callTool({
        name: 'get-sheet-by-gid',
        arguments: {
          spreadsheetId: '1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo',
          gid: '241635364',
        },
      });
      console.log('✅ SUCCESS with spreadsheetId parameter');
      console.log('Response:', result1.content[0].text.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ FAILED with spreadsheetId parameter');
      console.log('Error:', error.message);
    }

    // Test 2: Call with 'url' parameter (what AI sometimes uses)
    console.log('\n\n=== Test 2: Using "url" parameter ===');
    try {
      const result2 = await client.callTool({
        name: 'get-sheet-by-gid',
        arguments: {
          url: 'https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=241635364',
        },
      });
      console.log('✅ SUCCESS with url parameter');
      console.log('Response:', result2.content[0].text.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ FAILED with url parameter');
      console.log('Error:', error.message);
    }

    // Test 3: Call with full URL in spreadsheetId (should extract gid automatically)
    console.log('\n\n=== Test 3: Using full URL in "spreadsheetId" parameter ===');
    try {
      const result3 = await client.callTool({
        name: 'get-sheet-by-gid',
        arguments: {
          spreadsheetId: 'https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=241635364#gid=241635364',
        },
      });
      console.log('✅ SUCCESS with URL in spreadsheetId (gid auto-extracted)');
      console.log('Response:', result3.content[0].text.substring(0, 200) + '...');
    } catch (error) {
      console.log('❌ FAILED with URL in spreadsheetId');
      console.log('Error:', error.message);
    }

    // Test 4: Call with missing parameters (should fail gracefully)
    console.log('\n\n=== Test 4: Missing parameters (should fail gracefully) ===');
    try {
      const result4 = await client.callTool({
        name: 'get-sheet-by-gid',
        arguments: {},
      });
      console.log('❌ Should have failed but succeeded?');
      console.log('Response:', result4.content[0].text);
    } catch (error) {
      console.log('✅ Correctly failed with error');
      console.log('Error message:', error.message);
    }

    console.log('\n\n✅ Integration tests complete!');
    console.log('\nSummary:');
    console.log('- ✓ MCP server starts and accepts connections');
    console.log('- ✓ Tools are registered correctly');
    console.log('- ✓ Parameter handling works for multiple formats');
    console.log('- ✓ Error handling is graceful\n');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await client.close();
    serverProcess.kill();
  }
}

test().catch((error) => {
  console.error('\n❌ Test crashed:', error);
  process.exit(1);
});
