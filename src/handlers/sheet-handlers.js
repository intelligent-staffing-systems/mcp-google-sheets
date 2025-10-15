// @ts-check

/**
 * Spreadsheet-level operation handlers for Google Sheets MCP Server
 */

/** @typedef {import('../../types').Spreadsheet} Spreadsheet */
/** @typedef {import('../../types').MCPResponse} MCPResponse */
/** @typedef {import('../google-sheets-client').GoogleSheetsClient} GoogleSheetsClient */

export const sheetHandlers = {
  /**
   * Get spreadsheet metadata
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {boolean} [args.include_grid_data] - Whether to include cell data
   * @returns {Promise<MCPResponse<Spreadsheet>>}
   */
  async getSpreadsheet(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    return await client.getSpreadsheet(
      args.spreadsheet_id,
      args.include_grid_data || false
    );
  },

  /**
   * List all sheets in a spreadsheet
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @returns {Promise<MCPResponse<Array<{title: string, sheetId: number, index: number}>>>}
   */
  async listSheets(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    return await client.listSheets(args.spreadsheet_id);
  }
};
