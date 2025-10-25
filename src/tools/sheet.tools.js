// @ts-check
/**
 * Sheet-level MCP tools (individual sheet operations)
 * @module tools/sheet
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger.js';
import { parseSpreadsheetInput } from '../utils/url-parser.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').MCPToolResult} MCPToolResult
 */

const logger = createLogger('sheet-tools');

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
 * Get sheet tool definitions for MCP
 * @returns {Array} Tool definitions
 */
export function getToolDefinitions() {
  return [
    {
      name: 'list-sheets',
      description:
        'List all sheets in a spreadsheet with their names, IDs, and sizes. ' +
        'Perfect for getting an overview of available sheets. ' +
        'Accepts either spreadsheet ID or full Google Sheets URL.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
      }),
    },
    {
      name: 'get-sheet-by-gid',
      description:
        'Get a specific sheet by its gid (sheet ID from URL). ' +
        'When user pastes a Google Sheets URL with gid, use this FIRST to find the sheet name and details. ' +
        'Returns sheet name, size, and basic info. Then you can use other tools with the sheet name. ' +
        'IMPORTANT: Provide EITHER spreadsheetId OR url parameter (both contain the same value).',
      inputSchema: z.object({
        spreadsheetId: z.string().optional().describe('Spreadsheet ID or full Google Sheets URL'),
        url: z.string().optional().describe('Alternative: Full Google Sheets URL (use either spreadsheetId or url)'),
        gid: z.string().optional().describe('Sheet ID (gid from URL, e.g., "1850828774"). If URL contains gid, this is optional.'),
      }),
    },
    {
      name: 'get-sheet-info',
      description:
        'Get detailed information about a specific sheet by name. ' +
        'Returns properties, size, formatting info, and metadata.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        sheetName: z.string().describe('Name of the sheet (e.g., "Sheet1")'),
      }),
    },
    {
      name: 'get-sheet-preview',
      description:
        'Get a preview of a sheet with cell references (A1, B2, etc.) and values. ' +
        'Shows first N rows with exact cell addresses. ' +
        'Perfect for understanding sheet structure before working with it. ' +
        'Makes NO assumptions about headers - just shows raw data row by row.',
      inputSchema: z.object({
        spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
        sheetName: z.string().describe('Name of the sheet'),
        numRows: z
          .number()
          .optional()
          .describe('Number of rows to return (default: 10, max: 50)'),
      }),
    },
  ];
}

/**
 * Handle sheet tool calls
 *
 * @param {string} name - Tool name
 * @param {any} args - Tool arguments
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<MCPToolResult|null>} Tool result or null if not handled
 */
export async function handleToolCall(name, args, sheetsClient) {
  // LIST-SHEETS
  if (name === 'list-sheets') {
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Listing sheets', { spreadsheetId });

    const spreadsheet = await sheetsClient.getSpreadsheet(spreadsheetId, false);

    const sheetsList = spreadsheet.sheets
      ?.map((sheet, idx) => {
        const props = sheet.properties;
        return (
          `${idx + 1}. **${props?.title}**` +
          `\n   - Sheet ID (gid): \`${props?.sheetId}\`` +
          `\n   - Size: ${props?.gridProperties?.rowCount || 0} rows × ${props?.gridProperties?.columnCount || 0} columns` +
          (props?.hidden ? '\n   - Status: Hidden' : '')
        );
      })
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text:
            `📑 **Sheets in "${spreadsheet.properties?.title}"**\n\n` +
            `Total: ${spreadsheet.sheets?.length || 0} sheets\n\n` +
            `${sheetsList || 'No sheets found'}`,
        },
      ],
    };
  }

  // GET-SHEET-BY-GID
  if (name === 'get-sheet-by-gid') {
    // Handle both URL and separate ID+gid parameters
    let spreadsheetId, gid;

    // Accept both 'spreadsheetId' and 'url' parameter names (AI sometimes uses either)
    const inputId = args.spreadsheetId || args.url;

    // Check if any ID was provided
    if (!inputId) {
      return {
        content: [
          {
            type: 'text',
            text:
              `❌ **Missing spreadsheet ID**\n\n` +
              `Please provide either:\n` +
              `1. A full Google Sheets URL with gid\n` +
              `2. A spreadsheet ID plus gid parameter\n\n` +
              `Received args: ${JSON.stringify(args)}`,
          },
        ],
        isError: true,
      };
    }

    const parsed = parseSpreadsheetInput(inputId);
    spreadsheetId = parsed.spreadsheetId;
    gid = parsed.gid;

    // If gid not in URL, use the provided gid argument
    if (!gid && args.gid) {
      gid = args.gid;
    }

    if (!gid) {
      return {
        content: [
          {
            type: 'text',
            text:
              `❌ **No gid provided**\n\n` +
              `Please provide either:\n` +
              `1. A URL with gid: https://docs.google.com/spreadsheets/d/{ID}/edit?gid={GID}\n` +
              `2. Or specify gid as a parameter\n\n` +
              `Received: spreadsheetId="${args.spreadsheetId}", gid="${args.gid}"`,
          },
        ],
        isError: true,
      };
    }

    logger.info('Getting sheet by gid', { spreadsheetId, gid });

    const sheet = await sheetsClient.getSheetByGid(spreadsheetId, gid);

    if (!sheet) {
      return {
        content: [
          {
            type: 'text',
            text:
              `❌ **Sheet not found**\n\n` +
              `No sheet found with gid: \`${gid}\`\n\n` +
              `Use \`list-sheets\` to see all available sheets.`,
          },
        ],
        isError: true,
      };
    }

    const props = sheet.properties;

    return {
      content: [
        {
          type: 'text',
          text:
            `📄 **Sheet Found**\n\n` +
            `**Name:** \`${props?.title}\`\n` +
            `**Sheet ID (gid):** \`${props?.sheetId}\`\n` +
            `**Index:** ${props?.index}\n` +
            `**Type:** ${props?.sheetType || 'GRID'}\n` +
            `**Size:** ${props?.gridProperties?.rowCount || 0} rows × ${props?.gridProperties?.columnCount || 0} columns\n` +
            `**Frozen Rows:** ${props?.gridProperties?.frozenRowCount || 0}\n` +
            `**Frozen Columns:** ${props?.gridProperties?.frozenColumnCount || 0}\n` +
            (props?.hidden ? `**Status:** Hidden\n` : '') +
            `\n💡 Use sheet name \`"${props?.title}"\` for reading/writing data.`,
        },
      ],
    };
  }

  // GET-SHEET-INFO
  if (name === 'get-sheet-info') {
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);

    logger.info('Getting sheet info', {
      spreadsheetId,
      sheetName: args.sheetName,
    });

    const spreadsheet = await sheetsClient.getSpreadsheet(spreadsheetId, false);

    const sheet = spreadsheet.sheets?.find(
      (s) => s.properties?.title === args.sheetName
    );

    if (!sheet) {
      return {
        content: [
          {
            type: 'text',
            text:
              `❌ **Sheet not found**\n\n` +
              `No sheet named "${args.sheetName}"\n\n` +
              `Use \`list-sheets\` to see all available sheets.`,
          },
        ],
        isError: true,
      };
    }

    const props = sheet.properties;

    return {
      content: [
        {
          type: 'text',
          text:
            `📄 **Sheet: ${props?.title}**\n\n` +
            `**Sheet ID (gid):** \`${props?.sheetId}\`\n` +
            `**Index:** ${props?.index}\n` +
            `**Type:** ${props?.sheetType || 'GRID'}\n` +
            `**Size:** ${props?.gridProperties?.rowCount || 0} rows × ${props?.gridProperties?.columnCount || 0} columns\n` +
            `**Frozen Rows:** ${props?.gridProperties?.frozenRowCount || 0}\n` +
            `**Frozen Columns:** ${props?.gridProperties?.frozenColumnCount || 0}\n` +
            `**Gridlines Hidden:** ${props?.gridProperties?.hideGridlines || false}\n` +
            `**Right-to-Left:** ${props?.rightToLeft || false}\n` +
            (props?.hidden ? `**Status:** Hidden\n` : '') +
            (props?.tabColor
              ? `**Tab Color:** RGB(${props.tabColor.red || 0}, ${props.tabColor.green || 0}, ${props.tabColor.blue || 0})\n`
              : ''),
        },
      ],
    };
  }

  // GET-SHEET-PREVIEW
  if (name === 'get-sheet-preview') {
    const { spreadsheetId } = parseSpreadsheetInput(args.spreadsheetId);
    const numRows = Math.min(args.numRows || 10, 50); // Cap at 50 rows

    logger.info('Getting sheet preview', {
      spreadsheetId,
      sheetName: args.sheetName,
      numRows,
    });

    // Get first N rows (all columns up to ZZ for reasonable width)
    const range = `${args.sheetName}!A1:ZZ${numRows}`;
    const result = await sheetsClient.getValues(spreadsheetId, range);

    if (!result.values || result.values.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text:
              `📄 **Sheet Preview: ${args.sheetName}**\n\n` +
              `This sheet appears to be empty.`,
          },
        ],
      };
    }

    // Build cell-by-cell view
    let preview = '';
    const maxCols = Math.max(...result.values.map((row) => row.length));

    result.values.forEach((row, rowIdx) => {
      const rowNum = rowIdx + 1;
      preview += `**Row ${rowNum}:**\n`;

      row.forEach((cell, colIdx) => {
        const colLetter = columnIndexToLetter(colIdx);
        const cellRef = `${colLetter}${rowNum}`;
        const cellValue = cell !== undefined && cell !== '' ? cell : '(empty)';
        preview += `  ${cellRef}: ${JSON.stringify(cellValue)}\n`;
      });

      preview += '\n';
    });

    return {
      content: [
        {
          type: 'text',
          text:
            `📄 **Sheet Preview: ${args.sheetName}**\n\n` +
            `**Size:** ${result.values.length} rows × ${maxCols} columns (showing first ${numRows} rows)\n\n` +
            `${preview}` +
            `💡 Use cell references (A1, B2, etc.) to read/write specific cells.`,
        },
      ],
    };
  }

  return null;
}
