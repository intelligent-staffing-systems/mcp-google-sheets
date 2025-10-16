#!/usr/bin/env node
// @ts-check

/**
 * MCP Server for Google Sheets Integration
 * Provides tools to read and write data in Google Sheets
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { GoogleSheetsClient } from './src/google-sheets-client.js';
import { sheetHandlers } from './src/handlers/sheet-handlers.js';
import { valueHandlers } from './src/handlers/value-handlers.js';

// Load environment variables
dotenv.config();

/** @typedef {import('./types').MCPResponse} MCPResponse */
/** @typedef {import('./types').MCPToolResult} MCPToolResult */

// Validate environment variables
if (!process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
  console.error('Error: GOOGLE_SERVICE_ACCOUNT_PATH is required in environment variables');
  process.exit(1);
}

// Initialize Google Sheets client
const sheetsClient = new GoogleSheetsClient({
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH
});

// Initialize MCP Server
const server = new McpServer({
  name: 'mcp-sheets',
  version: '1.0.0'
});

/**
 * Register all available tools
 */

// Get Spreadsheet tool
server.registerTool(
  'get_spreadsheet',
  {
    description: 'Get metadata about a Google Spreadsheet including its title, URL, and list of sheets',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet (from the URL)'),
      include_grid_data: z.boolean().optional().describe('Whether to include cell data (default: false)')
    }
  },
  async (args) => {
    const result = await sheetHandlers.getSpreadsheet(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// List Sheets tool
server.registerTool(
  'list_sheets',
  {
    description: 'List all sheets (tabs) in a Google Spreadsheet',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet (from the URL)')
    }
  },
  async (args) => {
    const result = await sheetHandlers.listSheets(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Get Values tool
server.registerTool(
  'get_values',
  {
    description: 'Read values from a range in a Google Sheet using A1 notation (e.g., "Sheet1!A1:B10")',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      range: z.string().describe('The range to read in A1 notation (e.g., "Sheet1!A1:B10")'),
      value_render_option: z.enum(['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA']).optional()
        .describe('How to render values (default: FORMATTED_VALUE)'),
      date_time_render_option: z.enum(['SERIAL_NUMBER', 'FORMATTED_STRING']).optional()
        .describe('How to render dates (default: SERIAL_NUMBER)')
    }
  },
  async (args) => {
    const result = await valueHandlers.getValues(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Batch Get Values tool
server.registerTool(
  'batch_get_values',
  {
    description: 'Read values from multiple ranges in a Google Sheet at once',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      ranges: z.array(z.string()).describe('Array of ranges in A1 notation (e.g., ["Sheet1!A1:B10", "Sheet2!C1:D5"])'),
      value_render_option: z.enum(['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA']).optional()
        .describe('How to render values (default: FORMATTED_VALUE)'),
      date_time_render_option: z.enum(['SERIAL_NUMBER', 'FORMATTED_STRING']).optional()
        .describe('How to render dates (default: SERIAL_NUMBER)')
    }
  },
  async (args) => {
    const result = await valueHandlers.batchGetValues(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Update Values tool
server.registerTool(
  'update_values',
  {
    description: 'Update values in a range in a Google Sheet. Overwrites existing data.',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      range: z.string().describe('The range to update in A1 notation (e.g., "Sheet1!A1:B10")'),
      values: z.array(z.array(z.any())).describe('2D array of values to write (e.g., [["A1", "B1"], ["A2", "B2"]])'),
      value_input_option: z.enum(['RAW', 'USER_ENTERED']).optional()
        .describe('How to interpret input (RAW = as-is, USER_ENTERED = parse as if typed, default: USER_ENTERED)')
    }
  },
  async (args) => {
    const result = await valueHandlers.updateValues(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Append Values tool
server.registerTool(
  'append_values',
  {
    description: 'Append values to the end of a sheet (adds new rows)',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      range: z.string().describe('The sheet name or range to append to (e.g., "Sheet1" or "Sheet1!A1")'),
      values: z.array(z.array(z.any())).describe('2D array of values to append (e.g., [["A1", "B1"], ["A2", "B2"]])'),
      value_input_option: z.enum(['RAW', 'USER_ENTERED']).optional()
        .describe('How to interpret input (RAW = as-is, USER_ENTERED = parse as if typed, default: USER_ENTERED)')
    }
  },
  async (args) => {
    const result = await valueHandlers.appendValues(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Get Sheet by GID tool
server.registerTool(
  'get_sheet_by_gid',
  {
    description: 'Find a specific sheet by its gid (from the URL). Example: gid=241635364 from the URL parameter',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      gid: z.number().describe('The gid of the sheet (from URL parameter, e.g., gid=241635364)')
    }
  },
  async (args) => {
    const result = await sheetHandlers.getSheetByGid(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

// Get Formulas tool
server.registerTool(
  'get_formulas',
  {
    description: 'Read formulas from a range in a Google Sheet (convenience tool that returns formulas instead of values)',
    inputSchema: {
      spreadsheet_id: z.string().describe('The ID of the spreadsheet'),
      range: z.string().describe('The range to read in A1 notation (e.g., "Sheet1!A1:B10")')
    }
  },
  async (args) => {
    const result = await valueHandlers.getFormulas(sheetsClient, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }
);

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
    console.error('Google Sheets MCP Server started successfully');
    console.error(`Service Account: ${sheetsClient.serviceAccount.client_email}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Start server
main();
