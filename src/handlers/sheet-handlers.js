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
  },

  /**
   * Get a specific sheet by its gid (sheetId)
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {number} args.gid - The sheet gid (from URL)
   * @returns {Promise<MCPResponse<{title: string, sheetId: number, index: number, rowCount: number, columnCount: number}>>}
   */
  async getSheetByGid(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    if (args.gid === undefined || args.gid === null) {
      return {
        success: false,
        error: 'gid is required'
      };
    }

    const sheetsResult = await client.listSheets(args.spreadsheet_id);
    if (!sheetsResult.success) {
      return sheetsResult;
    }

    const sheet = sheetsResult.data.find(s => s.sheetId === args.gid);
    if (!sheet) {
      return {
        success: false,
        error: `Sheet with gid ${args.gid} not found`
      };
    }

    return {
      success: true,
      data: sheet
    };
  }
};
