// @ts-check
/**
 * Search and find MCP tools
 * @module tools/search
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger.js';
import { parseSpreadsheetInput } from '../utils/url-parser.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').MCPToolResult} MCPToolResult
 */

const logger = createLogger('search-tools');

/**
 * Convert column index to letter (0 -> A, 1 -> B, 25 -> Z, 26 -> AA)
 * @param {number} index - Column index (0-based)
 * @returns {string} Column letter
 */
function columnIndexToLetter(index) {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

/**
 * Get search tool definitions for MCP
 * @returns {Array} Tool definitions
 */
export function getToolDefinitions() {
  return [
    {
      name: 'search-values',
      description:
        'Search for text or values in a sheet. ' +
        'Returns all matching cells with their cell references (A1, B2, etc.). ' +
        'Supports exact match or partial match (contains).',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        sheetName: z.string().describe('Name of the sheet to search'),
        searchText: z.string().describe('Text to search for'),
        matchType: z
          .enum(['exact', 'contains'])
          .optional()
          .describe('Match type: "exact" or "contains" (default: contains)'),
        maxResults: z
          .number()
          .optional()
          .describe('Maximum number of results to return (default: 50)'),
      }),
    },
    {
      name: 'find-in-column',
      description:
        'Find all values in a specific column that match criteria. ' +
        'Returns row numbers and cell references. ' +
        'Perfect for filtering data by column value.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        sheetName: z.string().describe('Name of the sheet'),
        column: z.string().describe('Column letter (A, B, C, etc.)'),
        searchText: z.string().describe('Text to find'),
        matchType: z
          .enum(['exact', 'contains'])
          .optional()
          .describe('Match type: "exact" or "contains" (default: contains)'),
      }),
    },
  ];
}

/**
 * Handle search tool calls
 *
 * @param {string} name - Tool name
 * @param {any} args - Tool arguments
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<MCPToolResult|null>} Tool result or null if not handled
 */
export async function handleToolCall(name, args, sheetsClient) {
  // SEARCH-VALUES
  if (name === 'search-values') {
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);
    const matchType = args.matchType || 'contains';
    const maxResults = args.maxResults || 50;

    logger.info('Searching values', {
      spreadsheetId,
      sheetName: args.sheetName,
      searchText: args.searchText,
      matchType,
    });

    // Get all data from sheet (up to ZZ column for reasonable width)
    const range = `${args.sheetName}!A1:ZZ10000`; // Reasonable limit
    const result = await sheetsClient.getValues(spreadsheetId, range);

    if (!result.values || result.values.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `🔍 **No data found in sheet "${args.sheetName}"**`,
          },
        ],
      };
    }

    // Search through all cells
    const matches = [];
    const searchLower = args.searchText.toLowerCase();

    result.values.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const cellValue = String(cell || '');
        const cellLower = cellValue.toLowerCase();

        let isMatch = false;
        if (matchType === 'exact') {
          isMatch = cellLower === searchLower;
        } else {
          // contains
          isMatch = cellLower.includes(searchLower);
        }

        if (isMatch) {
          const colLetter = columnIndexToLetter(colIdx);
          const cellRef = `${colLetter}${rowIdx + 1}`;
          matches.push({
            cellRef,
            value: cellValue,
            row: rowIdx + 1,
            col: colLetter,
          });
        }
      });

      // Stop if we hit max results
      if (matches.length >= maxResults) {
        return;
      }
    });

    if (matches.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              `🔍 **No matches found**\n\n` +
              `Searched for: "${args.searchText}" (${matchType})\n` +
              `Sheet: ${args.sheetName}`,
          },
        ],
      };
    }

    const matchList = matches
      .slice(0, maxResults)
      .map((m) => `  ${m.cellRef}: "${m.value}"`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text:
            `🔍 **Found ${matches.length} match${matches.length > 1 ? 'es' : ''}**\n\n` +
            `Searched for: "${args.searchText}" (${matchType})\n` +
            `Sheet: ${args.sheetName}\n\n` +
            `**Results${matches.length > maxResults ? ` (showing first ${maxResults})` : ''}:**\n${matchList}`,
        },
      ],
    };
  }

  // FIND-IN-COLUMN
  if (name === 'find-in-column') {
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);
    const matchType = args.matchType || 'contains';

    logger.info('Finding in column', {
      spreadsheetId,
      sheetName: args.sheetName,
      column: args.column,
      searchText: args.searchText,
      matchType,
    });

    // Get entire column (up to row 10000)
    const range = `${args.sheetName}!${args.column}1:${args.column}10000`;
    const result = await sheetsClient.getValues(spreadsheetId, range);

    if (!result.values || result.values.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `🔍 **No data found in column ${args.column}**`,
          },
        ],
      };
    }

    // Search through column
    const matches = [];
    const searchLower = args.searchText.toLowerCase();

    result.values.forEach((row, rowIdx) => {
      const cellValue = String(row[0] || '');
      const cellLower = cellValue.toLowerCase();

      let isMatch = false;
      if (matchType === 'exact') {
        isMatch = cellLower === searchLower;
      } else {
        // contains
        isMatch = cellLower.includes(searchLower);
      }

      if (isMatch) {
        const cellRef = `${args.column}${rowIdx + 1}`;
        matches.push({
          cellRef,
          value: cellValue,
          row: rowIdx + 1,
        });
      }
    });

    if (matches.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              `🔍 **No matches found in column ${args.column}**\n\n` +
              `Searched for: "${args.searchText}" (${matchType})\n` +
              `Sheet: ${args.sheetName}`,
          },
        ],
      };
    }

    const matchList = matches
      .map((m) => `  Row ${m.row} (${m.cellRef}): "${m.value}"`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text:
            `🔍 **Found ${matches.length} match${matches.length > 1 ? 'es' : ''} in column ${args.column}**\n\n` +
            `Searched for: "${args.searchText}" (${matchType})\n` +
            `Sheet: ${args.sheetName}\n\n` +
            `**Results:**\n${matchList}`,
        },
      ],
    };
  }

  return null;
}
