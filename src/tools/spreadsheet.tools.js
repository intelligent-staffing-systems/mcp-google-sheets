// @ts-check
/**
 * Spreadsheet operation MCP tools
 * @module tools/spreadsheet
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger.js';
import { parseSpreadsheetInput } from '../utils/url-parser.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').MCPToolResult} MCPToolResult
 */

const logger = createLogger('spreadsheet-tools');

/**
 * Get spreadsheet tool definitions for MCP
 * @returns {Array} Tool definitions
 */
export function getToolDefinitions() {
  return [
    {
      name: 'create-spreadsheet',
      description:
        'Create a new Google Spreadsheet. ' +
        'Returns the spreadsheet ID and URL. ' +
        'You can optionally specify locale and timezone.',
      inputSchema: z.object({
        title: z.string().describe('Title of the spreadsheet'),
        locale: z
          .string()
          .optional()
          .describe('Locale of the spreadsheet (e.g., "en_US")'),
        timeZone: z
          .string()
          .optional()
          .describe('Time zone (e.g., "America/New_York")'),
      }),
    },
    {
      name: 'get-spreadsheet',
      description:
        'Get spreadsheet metadata including properties, sheet names, and structure. ' +
        'Use this to understand the spreadsheet layout before reading/writing data. ' +
        'Does not include cell data by default. ' +
        'Accepts either a spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        includeGridData: z
          .boolean()
          .optional()
          .describe('Whether to include cell data (default: false)'),
      }),
    },
  ];
}

/**
 * Handle spreadsheet tool calls
 *
 * @param {string} name - Tool name
 * @param {any} args - Tool arguments
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<MCPToolResult|null>} Tool result or null if not handled
 */
export async function handleToolCall(name, args, sheetsClient) {
  // CREATE-SPREADSHEET
  if (name === 'create-spreadsheet') {
    logger.info('Creating spreadsheet', { title: args.title });

    const spreadsheet = await sheetsClient.createSpreadsheet({
      title: args.title,
      locale: args.locale,
      timeZone: args.timeZone,
    });

    return {
      content: [
        {
          type: 'text',
          text:
            `✅ **Spreadsheet created successfully**\n\n` +
            `**Title:** ${spreadsheet.properties?.title}\n` +
            `**ID:** \`${spreadsheet.spreadsheetId}\`\n` +
            `**URL:** ${spreadsheet.spreadsheetUrl}\n\n` +
            `📝 The spreadsheet has been created with one default sheet. ` +
            `You can now use the ID to read/write data or add more sheets.`,
        },
      ],
    };
  }

  // GET-SPREADSHEET
  if (name === 'get-spreadsheet') {
    // Parse URL or ID
    const { spreadsheetId, gid } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Getting spreadsheet', {
      spreadsheetId,
      gid,
      includeGridData: args.includeGridData,
    });

    const spreadsheet = await sheetsClient.getSpreadsheet(
      spreadsheetId,
      args.includeGridData || false
    );

    // Build sheet info
    const sheetInfo = spreadsheet.sheets
      ?.map((sheet) => {
        const props = sheet.properties;
        return (
          `- **${props?.title}** (ID: ${props?.sheetId})` +
          `\n  - Type: ${props?.sheetType || 'GRID'}` +
          `\n  - Size: ${props?.gridProperties?.rowCount || 0} rows × ${props?.gridProperties?.columnCount || 0} columns` +
          (props?.hidden ? '\n  - Status: Hidden' : '')
        );
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text:
            `📊 **Spreadsheet: ${spreadsheet.properties?.title}**\n\n` +
            `**ID:** \`${spreadsheet.spreadsheetId}\`\n` +
            `**URL:** ${spreadsheet.spreadsheetUrl}\n` +
            `**Locale:** ${spreadsheet.properties?.locale || 'N/A'}\n` +
            `**Time Zone:** ${spreadsheet.properties?.timeZone || 'N/A'}\n\n` +
            `**Sheets (${spreadsheet.sheets?.length || 0}):**\n${sheetInfo || 'None'}`,
        },
      ],
    };
  }

  return null;
}
