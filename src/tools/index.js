// @ts-check
/**
 * Tool registry - Auto-collects all tool modules
 * @module tools
 */

import * as spreadsheetTools from './spreadsheet.tools.js';
import * as valuesTools from './values.tools.js';
import * as sheetTools from './sheet.tools.js';
import * as searchTools from './search.tools.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').MCPToolResult} MCPToolResult
 */

// Register all tool modules here
const toolModules = [spreadsheetTools, valuesTools, sheetTools, searchTools];

/**
 * Get all tool definitions from all modules
 * @returns {Array} All tool definitions
 */
export function getAllToolDefinitions() {
  return toolModules.flatMap((mod) => mod.getToolDefinitions());
}

/**
 * Handle a tool call by routing to the appropriate module
 *
 * @param {string} name - Tool name
 * @param {any} args - Tool arguments
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<MCPToolResult>} Tool result
 */
export async function handleToolCall(name, args, sheetsClient) {
  // Try each module until one handles it
  for (const mod of toolModules) {
    const result = await mod.handleToolCall(name, args, sheetsClient);
    if (result) {
      return result;
    }
  }

  // No module handled it
  throw new Error(`Unknown tool: ${name}`);
}
