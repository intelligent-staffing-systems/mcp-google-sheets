#!/usr/bin/env node
// @ts-check
/**
 * mcp-sheets - Google Sheets integration for Model Context Protocol
 * Main entry point for MCP server
 * @module index
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { createSheetsClient } from './client/sheets-client.js';
import { createLogger } from './utils/logger.js';
import { getAllToolDefinitions, handleToolCall } from './tools/index.js';
import { getAllResourceDefinitions, handleResourceRead } from './resources/index.js';

const logger = createLogger('main');

/**
 * Main server initialization
 */
async function main() {
  logger.info('Starting mcp-sheets server...');

  // Check for required environment variables
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('\n❌ GOOGLE_APPLICATION_CREDENTIALS not set');
    console.error('\n💡 Setup instructions:');
    console.error('   1. Create a service account in Google Cloud Console');
    console.error('   2. Download the JSON key file');
    console.error('   3. Set GOOGLE_APPLICATION_CREDENTIALS=./path/to/key.json');
    console.error('   4. Or copy .env.example to .env and update it\n');
    process.exit(1);
  }

  // Create Google Sheets API client
  let sheetsClient;
  try {
    sheetsClient = await createSheetsClient();
    logger.info('Google Sheets API client initialized');
  } catch (error) {
    logger.error('Failed to initialize Sheets client', { error });
    console.error('\n❌ Sheets client initialization failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify your service account key file exists');
    console.error('   2. Check that GOOGLE_APPLICATION_CREDENTIALS points to the right file');
    console.error('   3. Ensure the service account has Sheets API enabled');
    console.error('   4. Confirm the JSON key file is valid\n');
    process.exit(1);
  }

  // Create MCP server
  const server = new McpServer({
    name: 'mcp-sheets',
    version: '0.1.0',
  });

  // Register all tools
  const tools = getAllToolDefinitions();
  logger.info('Registering tools', { count: tools.length });

  for (const tool of tools) {
    server.tool(
      tool.name,
      tool.description,
      zodToJsonSchema(tool.inputSchema),
      async (args) => {
        // DEBUG: Log what we actually receive
        logger.info('Tool called', {
          toolName: tool.name,
          receivedArgs: JSON.stringify(args),
          argKeys: Object.keys(args || {}),
        });

        try {
          const result = await handleToolCall(tool.name, args, sheetsClient);
          return result;
        } catch (error) {
          logger.error('Tool execution failed', {
            tool: tool.name,
            error: error.message,
          });

          // Handle Google API errors gracefully
          let errorMessage = error.message;
          if (error.response?.data?.error) {
            const apiError = error.response.data.error;
            errorMessage = `${apiError.message} (${apiError.status})`;
          }

          return {
            content: [
              {
                type: 'text',
                text:
                  `❌ **Error executing ${tool.name}**\n\n` +
                  `${errorMessage}\n\n` +
                  `Check the logs for more details.`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  logger.info('Tools registered', { count: tools.length });

  // Register all resources
  const resources = getAllResourceDefinitions();
  logger.info('Registering resources', { count: resources.length });

  server.resource(async (uri) => {
    try {
      const result = await handleResourceRead(uri, sheetsClient);
      return result;
    } catch (error) {
      logger.error('Resource read failed', { uri, error: error.message });

      throw new Error(`Failed to read resource: ${error.message}`);
    }
  });

  logger.info('Resources registered', { count: resources.length });

  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('✅ mcp-sheets server started successfully');
  logger.info('Available tools:', { tools: tools.map((t) => t.name) });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Error handling
main().catch((error) => {
  logger.error('Fatal error', { error });
  console.error('❌ Server crashed:', error);
  process.exit(1);
});
