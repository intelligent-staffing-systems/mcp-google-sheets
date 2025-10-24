// @ts-check
/**
 * Values operation MCP tools (read/write cell data)
 * @module tools/values
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger.js';
import { parseSpreadsheetInput } from '../utils/url-parser.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').MCPToolResult} MCPToolResult
 */

const logger = createLogger('values-tools');

/**
 * Get values tool definitions for MCP
 * @returns {Array} Tool definitions
 */
export function getToolDefinitions() {
  return [
    {
      name: 'get-values',
      description:
        'Get cell values from a spreadsheet range. ' +
        'Use A1 notation like "Sheet1!A1:C10" or just "A1:C10" for the first sheet. ' +
        'Returns a 2D array of values. ' +
        'Accepts either spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        range: z
          .string()
          .describe('Range in A1 notation (e.g., "Sheet1!A1:B10")'),
      }),
    },
    {
      name: 'update-values',
      description:
        'Update cell values in a spreadsheet range. ' +
        'Provide a 2D array of values to write. ' +
        'Values are interpreted as if typed by a user (formulas work, "=SUM(A1:A10)" becomes a formula). ' +
        'Accepts either spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        range: z
          .string()
          .describe('Range in A1 notation (e.g., "Sheet1!A1:B10")'),
        values: z
          .array(z.array(z.any()))
          .describe('2D array of values [[row1], [row2], ...]'),
      }),
    },
    {
      name: 'append-values',
      description:
        'Append rows of data after existing content in a spreadsheet. ' +
        'Automatically finds the last row with data and adds new rows below it. ' +
        'Perfect for adding entries to a table or log. ' +
        'Accepts either spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        range: z
          .string()
          .describe(
            'Range to search for a table (e.g., "Sheet1!A:C" or "Sheet1")'
          ),
        values: z
          .array(z.array(z.any()))
          .describe('2D array of values to append [[row1], [row2], ...]'),
      }),
    },
    {
      name: 'clear-values',
      description:
        'Clear cell values in a range. ' +
        'Removes data but preserves formatting. ' +
        'Use this to erase content without deleting cells. ' +
        'Accepts either spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        range: z
          .string()
          .describe('Range in A1 notation (e.g., "Sheet1!A1:B10")'),
      }),
    },
  ];
}

/**
 * Format values for display
 * @param {Array<Array<any>>} values - 2D array of values
 * @returns {string} Formatted table
 */
function formatValuesAsTable(values) {
  if (!values || values.length === 0) {
    return '(empty)';
  }

  // Simple table formatting
  return values
    .map((row, i) => `Row ${i + 1}: [${row.map((cell) => JSON.stringify(cell)).join(', ')}]`)
    .join('\n');
}

/**
 * Handle values tool calls
 *
 * @param {string} name - Tool name
 * @param {any} args - Tool arguments
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<MCPToolResult|null>} Tool result or null if not handled
 */
export async function handleToolCall(name, args, sheetsClient) {
  // GET-VALUES
  if (name === 'get-values') {
    // Parse URL or ID
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Getting values', {
      spreadsheetId,
      range: args.range,
    });

    const result = await sheetsClient.getValues(spreadsheetId, args.range);

    const rowCount = result.values?.length || 0;
    const colCount = result.values?.[0]?.length || 0;

    return {
      content: [
        {
          type: 'text',
          text:
            `📋 **Values from ${result.range}**\n\n` +
            `**Size:** ${rowCount} rows × ${colCount} columns\n\n` +
            `**Data:**\n\`\`\`\n${formatValuesAsTable(result.values || [])}\n\`\`\``,
        },
      ],
    };
  }

  // UPDATE-VALUES
  if (name === 'update-values') {
    // Parse URL or ID
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Updating values', {
      spreadsheetId,
      range: args.range,
      rowCount: args.values.length,
    });

    const result = await sheetsClient.updateValues(
      spreadsheetId,
      args.range,
      args.values
    );

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ **Values updated successfully**\n\n` +
            `**Range:** ${result.updatedRange}\n` +
            `**Cells updated:** ${result.updatedCells}\n` +
            `**Rows updated:** ${result.updatedRows}\n` +
            `**Columns updated:** ${result.updatedColumns}`,
        },
      ],
    };
  }

  // APPEND-VALUES
  if (name === 'append-values') {
    // Parse URL or ID
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Appending values', {
      spreadsheetId,
      range: args.range,
      rowCount: args.values.length,
    });

    const result = await sheetsClient.appendValues(
      spreadsheetId,
      args.range,
      args.values
    );

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ **Values appended successfully**\n\n` +
            `**Table range:** ${result.tableRange}\n` +
            `**Updated range:** ${result.updates?.updatedRange}\n` +
            `**Rows added:** ${result.updates?.updatedRows}\n` +
            `**Cells written:** ${result.updates?.updatedCells}`,
        },
      ],
    };
  }

  // CLEAR-VALUES
  if (name === 'clear-values') {
    // Parse URL or ID
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Clearing values', {
      spreadsheetId,
      range: args.range,
    });

    const result = await sheetsClient.clearValues(spreadsheetId, args.range);

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ **Values cleared successfully**\n\n` +
            `**Range:** ${args.range}\n\n` +
            `📝 Cell data has been cleared. Formatting is preserved.`,
        },
      ],
    };
  }

  return null;
}
