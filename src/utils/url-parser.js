// @ts-check
/**
 * Google Sheets URL parser
 * Extracts spreadsheet ID and gid from Google Sheets URLs
 * @module utils/url-parser
 */

/**
 * Parse Google Sheets URL or return ID as-is
 *
 * @param {string} input - Spreadsheet ID or full Google Sheets URL
 * @returns {{spreadsheetId: string, gid: string|null}} Parsed spreadsheet info
 *
 * @example
 * // From URL
 * parseSpreadsheetInput('https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=1850828774#gid=1850828774')
 * // => { spreadsheetId: '1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo', gid: '1850828774' }
 *
 * // From ID
 * parseSpreadsheetInput('1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo')
 * // => { spreadsheetId: '1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo', gid: null }
 */
export function parseSpreadsheetInput(input) {
  if (!input) {
    throw new Error('Spreadsheet ID or URL is required');
  }

  // If it's a URL, parse it
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return parseGoogleSheetsUrl(input);
  }

  // Otherwise treat as spreadsheet ID
  return {
    spreadsheetId: input,
    gid: null,
  };
}

/**
 * Parse a Google Sheets URL to extract spreadsheet ID and gid
 *
 * @param {string} url - Full Google Sheets URL
 * @returns {{spreadsheetId: string, gid: string|null}} Parsed info
 */
function parseGoogleSheetsUrl(url) {
  // Match spreadsheet ID from URL
  // Format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...
  const spreadsheetMatch = url.match(
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
  );

  if (!spreadsheetMatch) {
    throw new Error(
      'Invalid Google Sheets URL. Expected format: ' +
        'https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit'
    );
  }

  const spreadsheetId = spreadsheetMatch[1];

  // Try to extract gid (sheet ID within the spreadsheet)
  // Can be in query param (?gid=123) or hash (#gid=123)
  let gid = null;

  // Check query params
  const urlObj = new URL(url);
  const gidParam = urlObj.searchParams.get('gid');
  if (gidParam) {
    gid = gidParam;
  }

  // Check hash (fallback)
  if (!gid && url.includes('#gid=')) {
    const hashMatch = url.match(/#gid=(\d+)/);
    if (hashMatch) {
      gid = hashMatch[1];
    }
  }

  return {
    spreadsheetId,
    gid,
  };
}

/**
 * Convert gid (sheet ID as string) to sheet name reference for A1 notation
 * Note: This requires looking up the sheet name from the spreadsheet metadata
 * For now, returns null - tools will need to handle gid lookup
 *
 * @param {string} gid - Sheet ID (numeric string)
 * @returns {null} Currently returns null, needs spreadsheet metadata
 */
export function gidToSheetName(gid) {
  // TODO: Implement sheet name lookup
  // Would need to call getSpreadsheet() and find sheet with matching sheetId
  return null;
}

/**
 * Build A1 notation range with sheet name
 *
 * @param {string} sheetName - Name of the sheet
 * @param {string} [range] - Optional range (e.g., "A1:B10")
 * @returns {string} Full A1 notation (e.g., "Sheet1!A1:B10")
 */
export function buildA1Notation(sheetName, range) {
  if (!range) {
    return sheetName;
  }
  return `${sheetName}!${range}`;
}
