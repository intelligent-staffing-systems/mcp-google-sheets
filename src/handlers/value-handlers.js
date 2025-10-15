// @ts-check

/**
 * Value-level operation handlers for Google Sheets MCP Server
 */

/** @typedef {import('../../types').ValueRange} ValueRange */
/** @typedef {import('../../types').BatchGetValuesResponse} BatchGetValuesResponse */
/** @typedef {import('../../types').UpdateValuesResponse} UpdateValuesResponse */
/** @typedef {import('../../types').MCPResponse} MCPResponse */
/** @typedef {import('../google-sheets-client').GoogleSheetsClient} GoogleSheetsClient */

export const valueHandlers = {
  /**
   * Get values from a range
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {string} args.range - A1 notation range (e.g., "Sheet1!A1:B10")
   * @param {string} [args.value_render_option] - How to render values
   * @param {string} [args.date_time_render_option] - How to render dates
   * @returns {Promise<MCPResponse<ValueRange>>}
   */
  async getValues(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    if (!args.range) {
      return {
        success: false,
        error: 'range is required (e.g., "Sheet1!A1:B10")'
      };
    }

    return await client.getValues(
      args.spreadsheet_id,
      args.range,
      {
        valueRenderOption: args.value_render_option,
        dateTimeRenderOption: args.date_time_render_option
      }
    );
  },

  /**
   * Get values from multiple ranges
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {string[]} args.ranges - Array of A1 notation ranges
   * @param {string} [args.value_render_option] - How to render values
   * @param {string} [args.date_time_render_option] - How to render dates
   * @returns {Promise<MCPResponse<BatchGetValuesResponse>>}
   */
  async batchGetValues(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    if (!args.ranges || !Array.isArray(args.ranges) || args.ranges.length === 0) {
      return {
        success: false,
        error: 'ranges is required and must be a non-empty array'
      };
    }

    return await client.batchGetValues(
      args.spreadsheet_id,
      args.ranges,
      {
        valueRenderOption: args.value_render_option,
        dateTimeRenderOption: args.date_time_render_option
      }
    );
  },

  /**
   * Update values in a range
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {string} args.range - A1 notation range
   * @param {any[][]} args.values - 2D array of values to write
   * @param {string} [args.value_input_option] - How to interpret input data
   * @returns {Promise<MCPResponse<UpdateValuesResponse>>}
   */
  async updateValues(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    if (!args.range) {
      return {
        success: false,
        error: 'range is required (e.g., "Sheet1!A1:B10")'
      };
    }

    if (!args.values || !Array.isArray(args.values)) {
      return {
        success: false,
        error: 'values is required and must be a 2D array'
      };
    }

    return await client.updateValues(
      args.spreadsheet_id,
      args.range,
      args.values,
      {
        valueInputOption: args.value_input_option
      }
    );
  },

  /**
   * Append values to a sheet
   * @param {GoogleSheetsClient} client
   * @param {Object} args
   * @param {string} args.spreadsheet_id - The spreadsheet ID
   * @param {string} args.range - A1 notation range (usually just sheet name)
   * @param {any[][]} args.values - 2D array of values to append
   * @param {string} [args.value_input_option] - How to interpret input data
   * @returns {Promise<MCPResponse<any>>}
   */
  async appendValues(client, args) {
    if (!args.spreadsheet_id) {
      return {
        success: false,
        error: 'spreadsheet_id is required'
      };
    }

    if (!args.range) {
      return {
        success: false,
        error: 'range is required (e.g., "Sheet1" or "Sheet1!A1")'
      };
    }

    if (!args.values || !Array.isArray(args.values)) {
      return {
        success: false,
        error: 'values is required and must be a 2D array'
      };
    }

    return await client.appendValues(
      args.spreadsheet_id,
      args.range,
      args.values,
      {
        valueInputOption: args.value_input_option
      }
    );
  }
};
