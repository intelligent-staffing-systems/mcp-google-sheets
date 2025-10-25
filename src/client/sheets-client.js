// @ts-check
/**
 * Google Sheets API client
 * Clean async/await interface to Google Sheets API v4
 * @module client/sheets-client
 */

import { google } from 'googleapis';
import { createLogger } from '../utils/logger.js';

/**
 * @typedef {import('../types.js').GoogleSheetsClient} GoogleSheetsClient
 * @typedef {import('../types.js').Spreadsheet} Spreadsheet
 * @typedef {import('../types.js').ValueRange} ValueRange
 * @typedef {import('../types.js').UpdateValuesResponse} UpdateValuesResponse
 * @typedef {import('../types.js').AppendValuesResponse} AppendValuesResponse
 * @typedef {import('../types.js').BatchGetValuesResponse} BatchGetValuesResponse
 * @typedef {import('../types.js').BatchUpdateValuesResponse} BatchUpdateValuesResponse
 */

const logger = createLogger('sheets-client');

/**
 * Create Google Sheets API client
 * Uses service account credentials from GOOGLE_APPLICATION_CREDENTIALS
 *
 * @returns {Promise<GoogleSheetsClient>} Sheets client instance
 */
export async function createSheetsClient() {
  logger.info('Initializing Google Sheets API client');

  // Authenticate using service account
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  logger.info('Google Sheets API client initialized successfully');

  return {
    /**
     * Create a new spreadsheet
     *
     * @param {Object} properties - Spreadsheet properties
     * @param {string} properties.title - Title of the spreadsheet
     * @param {string} [properties.locale] - Locale (e.g., "en_US")
     * @param {string} [properties.timeZone] - Time zone (e.g., "America/New_York")
     * @returns {Promise<Spreadsheet>} Created spreadsheet
     */
    async createSpreadsheet(properties) {
      logger.info('Creating spreadsheet', { title: properties.title });

      const response = await sheets.spreadsheets.create({
        requestBody: {
          properties,
        },
      });

      logger.info('Spreadsheet created', {
        spreadsheetId: response.data.spreadsheetId,
        url: response.data.spreadsheetUrl,
      });

      return response.data;
    },

    /**
     * Get spreadsheet metadata and optionally grid data
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {boolean} [includeGridData=false] - Whether to include cell data
     * @returns {Promise<Spreadsheet>} Spreadsheet data
     */
    async getSpreadsheet(spreadsheetId, includeGridData = false) {
      logger.info('Getting spreadsheet', { spreadsheetId, includeGridData });

      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData,
      });

      return response.data;
    },

    /**
     * Get values from a single range
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - Range in A1 notation (e.g., "Sheet1!A1:B10")
     * @returns {Promise<ValueRange>} Value range data
     */
    async getValues(spreadsheetId, range) {
      logger.debug('Getting values', { spreadsheetId, range });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data;
    },

    /**
     * Get values from multiple ranges
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string[]} ranges - Array of ranges in A1 notation
     * @returns {Promise<BatchGetValuesResponse>} Batch get response
     */
    async batchGetValues(spreadsheetId, ranges) {
      logger.debug('Batch getting values', { spreadsheetId, rangeCount: ranges.length });

      const response = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      });

      return response.data;
    },

    /**
     * Update values in a single range
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - Range in A1 notation
     * @param {Array<Array<any>>} values - 2D array of values
     * @param {string} [valueInputOption='USER_ENTERED'] - How to interpret input (USER_ENTERED or RAW)
     * @returns {Promise<UpdateValuesResponse>} Update response
     */
    async updateValues(spreadsheetId, range, values, valueInputOption = 'USER_ENTERED') {
      logger.debug('Updating values', {
        spreadsheetId,
        range,
        rowCount: values.length,
        valueInputOption,
      });

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: {
          values,
        },
      });

      logger.info('Values updated', {
        updatedCells: response.data.updatedCells,
        updatedRows: response.data.updatedRows,
      });

      return response.data;
    },

    /**
     * Update values in multiple ranges
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {ValueRange[]} data - Array of value ranges to update
     * @param {string} [valueInputOption='USER_ENTERED'] - How to interpret input
     * @returns {Promise<BatchUpdateValuesResponse>} Batch update response
     */
    async batchUpdateValues(spreadsheetId, data, valueInputOption = 'USER_ENTERED') {
      logger.debug('Batch updating values', {
        spreadsheetId,
        rangeCount: data.length,
        valueInputOption,
      });

      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption,
          data,
        },
      });

      logger.info('Batch values updated', {
        totalUpdatedCells: response.data.totalUpdatedCells,
        totalUpdatedRows: response.data.totalUpdatedRows,
      });

      return response.data;
    },

    /**
     * Append values to a range (adds rows after existing data)
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - Range in A1 notation (table search range)
     * @param {Array<Array<any>>} values - 2D array of values
     * @param {string} [valueInputOption='USER_ENTERED'] - How to interpret input
     * @param {string} [insertDataOption='INSERT_ROWS'] - How to insert data (INSERT_ROWS or OVERWRITE)
     * @returns {Promise<AppendValuesResponse>} Append response
     */
    async appendValues(
      spreadsheetId,
      range,
      values,
      valueInputOption = 'USER_ENTERED',
      insertDataOption = 'INSERT_ROWS'
    ) {
      logger.debug('Appending values', {
        spreadsheetId,
        range,
        rowCount: values.length,
        valueInputOption,
        insertDataOption,
      });

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        insertDataOption,
        requestBody: {
          values,
        },
      });

      logger.info('Values appended', {
        updatedRange: response.data.updates?.updatedRange,
        updatedCells: response.data.updates?.updatedCells,
      });

      return response.data;
    },

    /**
     * Clear values in a range
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - Range in A1 notation
     * @returns {Promise<Object>} Clear response
     */
    async clearValues(spreadsheetId, range) {
      logger.debug('Clearing values', { spreadsheetId, range });

      const response = await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
        requestBody: {},
      });

      logger.info('Values cleared', { range });

      return response.data;
    },

    /**
     * Perform batch update operations (formatting, adding sheets, etc.)
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {Object} requests - Batch update request body
     * @returns {Promise<Object>} Batch update response
     */
    async batchUpdate(spreadsheetId, requests) {
      logger.debug('Batch update', {
        spreadsheetId,
        requestCount: requests.requests?.length || 0,
      });

      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: requests,
      });

      logger.info('Batch update completed', {
        responseCount: response.data.replies?.length || 0,
      });

      return response.data;
    },

    /**
     * Resolve gid (sheet ID) to sheet name
     *
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} gid - Sheet ID (gid from URL)
     * @returns {Promise<Object|null>} Sheet info or null if not found
     */
    async getSheetByGid(spreadsheetId, gid) {
      logger.debug('Resolving gid to sheet name', { spreadsheetId, gid });

      const spreadsheet = await this.getSpreadsheet(spreadsheetId, false);

      // Find sheet with matching sheetId
      const sheet = spreadsheet.sheets?.find(
        (s) => s.properties?.sheetId?.toString() === gid.toString()
      );

      if (!sheet) {
        logger.warn('Sheet not found for gid', { gid });
        return null;
      }

      logger.info('Resolved gid to sheet', {
        gid,
        sheetName: sheet.properties?.title,
      });

      return sheet;
    },

    // Expose raw sheets API for advanced usage
    _sheets: sheets,
  };
}
