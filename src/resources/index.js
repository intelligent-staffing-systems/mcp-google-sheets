// @ts-check
/**
 * Resources - Read-only data exposure
 * @module resources
 */

import { createLogger } from '../utils/logger.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 */

const logger = createLogger('resources');

/**
 * Get all resource definitions
 * @returns {Array} Resource definitions
 */
export function getAllResourceDefinitions() {
  return [
    {
      uri: 'resource://mcp-sheets/spreadsheet/{spreadsheetId}',
      name: 'Spreadsheet Metadata',
      description: 'Get spreadsheet structure and properties by ID',
      mimeType: 'application/json',
    },
  ];
}

/**
 * Handle resource read request
 *
 * @param {string} uri - Resource URI
 * @param {GoogleSheetsClient} sheetsClient - Sheets API client
 * @returns {Promise<Object>} Resource data
 */
export async function handleResourceRead(uri, sheetsClient) {
  logger.info('Reading resource', { uri });

  // Parse resource URI
  const match = uri.match(/^resource:\/\/mcp-sheets\/spreadsheet\/(.+)$/);
  if (match) {
    const spreadsheetId = match[1];
    logger.info('Getting spreadsheet resource', { spreadsheetId });

    const spreadsheet = await sheetsClient.getSpreadsheet(spreadsheetId, false);

    // Return just the essential metadata
    const metadata = {
      spreadsheetId: spreadsheet.spreadsheetId,
      title: spreadsheet.properties?.title,
      locale: spreadsheet.properties?.locale,
      timeZone: spreadsheet.properties?.timeZone,
      url: spreadsheet.spreadsheetUrl,
      sheets: spreadsheet.sheets?.map((sheet) => ({
        sheetId: sheet.properties?.sheetId,
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        sheetType: sheet.properties?.sheetType,
        gridProperties: sheet.properties?.gridProperties,
      })),
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}
