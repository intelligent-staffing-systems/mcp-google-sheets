/**
 * Type definitions for Google Sheets MCP Server
 * Based on Google Sheets API v4
 * https://sheets.googleapis.com/$discovery/rest?version=v4
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for Google Sheets API client
 */
export interface GoogleSheetsConfig {
  /** Google API Key or OAuth credentials */
  apiKey?: string;
  /** OAuth 2.0 access token */
  accessToken?: string;
  /** Base API URL (defaults to https://sheets.googleapis.com/v4) */
  apiUrl?: string;
}

// ============================================================================
// Core Google Sheets API Types
// ============================================================================

/**
 * Data within a range of the spreadsheet.
 * Represents both input and output for reading/writing cell data.
 */
export interface ValueRange {
  /** The range in A1 notation (e.g., "Sheet1!A1:B2") */
  range?: string;
  /**
   * The major dimension of the values.
   * ROWS = [[row1], [row2]], COLUMNS = [[col1], [col2]]
   */
  majorDimension?: 'DIMENSION_UNSPECIFIED' | 'ROWS' | 'COLUMNS';
  /**
   * 2D array of values. Outer array = all data, inner arrays = major dimension.
   * Each item in inner array = one cell value (string, number, boolean, or null)
   */
  values?: any[][];
}

/**
 * Properties of a spreadsheet
 */
export interface SpreadsheetProperties {
  /** The title of the spreadsheet */
  title?: string;
  /** The locale (e.g., "en_US") */
  locale?: string;
  /** Auto-recalculation setting */
  autoRecalc?: 'RECALCULATION_INTERVAL_UNSPECIFIED' | 'ON_CHANGE' | 'MINUTE' | 'HOUR';
  /** Time zone in CLDR format (e.g., "America/New_York") */
  timeZone?: string;
}

/**
 * Properties of a sheet (tab) within a spreadsheet
 */
export interface SheetProperties {
  /** The ID of the sheet (0-based index) */
  sheetId?: number;
  /** The name of the sheet */
  title?: string;
  /** The index of the sheet within the spreadsheet (0-based) */
  index?: number;
  /** The type of sheet */
  sheetType?: 'SHEET_TYPE_UNSPECIFIED' | 'GRID' | 'OBJECT' | 'DATA_SOURCE';
  /** Number of rows in the sheet */
  gridProperties?: {
    rowCount?: number;
    columnCount?: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
  };
}

/**
 * A sheet (tab) in a spreadsheet
 */
export interface Sheet {
  /** Properties of the sheet */
  properties?: SheetProperties;
  /**
   * Data in the grid, if requested.
   * Note: Usually omitted for metadata requests.
   */
  data?: any[];
}

/**
 * Resource that represents a spreadsheet
 */
export interface Spreadsheet {
  /** The ID of the spreadsheet */
  spreadsheetId?: string;
  /** Overall properties of the spreadsheet */
  properties?: SpreadsheetProperties;
  /** The sheets (tabs) in the spreadsheet */
  sheets?: Sheet[];
  /** The URL of the spreadsheet */
  spreadsheetUrl?: string;
  /** Named ranges defined in the spreadsheet */
  namedRanges?: NamedRange[];
}

/**
 * A named range in a spreadsheet
 */
export interface NamedRange {
  /** The ID of the named range */
  namedRangeId?: string;
  /** The name of the named range */
  name?: string;
  /** The range this represents */
  range?: {
    sheetId?: number;
    startRowIndex?: number;
    endRowIndex?: number;
    startColumnIndex?: number;
    endColumnIndex?: number;
  };
}

/**
 * Response when retrieving multiple ranges
 */
export interface BatchGetValuesResponse {
  /** The ID of the spreadsheet */
  spreadsheetId?: string;
  /** The requested value ranges */
  valueRanges?: ValueRange[];
}

/**
 * Response when updating values
 */
export interface UpdateValuesResponse {
  /** The spreadsheet the updates were applied to */
  spreadsheetId?: string;
  /** The range that was updated in A1 notation */
  updatedRange?: string;
  /** Number of rows updated */
  updatedRows?: number;
  /** Number of columns updated */
  updatedColumns?: number;
  /** Number of cells updated */
  updatedCells?: number;
  /** The updated data, if requested */
  updatedData?: ValueRange;
}

/**
 * Request to update values in a spreadsheet
 */
export interface UpdateValuesRequest {
  /** The range to update in A1 notation */
  range?: string;
  /** How the input data should be interpreted */
  valueInputOption?: 'INPUT_VALUE_OPTION_UNSPECIFIED' | 'RAW' | 'USER_ENTERED';
  /** The new values to write */
  values?: any[][];
}

/**
 * Response when clearing values
 */
export interface ClearValuesResponse {
  /** The spreadsheet the updates were applied to */
  spreadsheetId?: string;
  /** The range that was cleared in A1 notation */
  clearedRange?: string;
}

/**
 * Request for batch updating values
 */
export interface BatchUpdateValuesRequest {
  /** How the input data should be interpreted */
  valueInputOption?: 'INPUT_VALUE_OPTION_UNSPECIFIED' | 'RAW' | 'USER_ENTERED';
  /** The new values to apply */
  data?: ValueRange[];
  /** Whether to include values in the response */
  includeValuesInResponse?: boolean;
  /** How to render values in the response */
  responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  /** How to render date/time values */
  responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
}

/**
 * Response when batch updating values
 */
export interface BatchUpdateValuesResponse {
  /** The spreadsheet the updates were applied to */
  spreadsheetId?: string;
  /** Total number of rows updated */
  totalUpdatedRows?: number;
  /** Total number of columns updated */
  totalUpdatedColumns?: number;
  /** Total number of cells updated */
  totalUpdatedCells?: number;
  /** Total number of sheets updated */
  totalUpdatedSheets?: number;
  /** Individual update responses, matching the request order */
  responses?: UpdateValuesResponse[];
}

// ============================================================================
// MCP Response Wrapper Types
// ============================================================================

/**
 * Standard response format for MCP tools
 */
export interface MCPResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** The data returned (if successful) */
  data?: T;
  /** Error message (if unsuccessful) */
  error?: string;
  /** Additional error details */
  details?: any;
}

/**
 * MCP tool result format
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// ============================================================================
// Helper Types for Working with Sheets
// ============================================================================

/**
 * Represents a cell address in A1 notation
 */
export interface CellAddress {
  /** Sheet name */
  sheet?: string;
  /** Column (A, B, C, etc.) */
  column: string;
  /** Row number (1-based) */
  row: number;
}

/**
 * Represents a range in A1 notation
 */
export interface RangeAddress {
  /** Sheet name */
  sheet?: string;
  /** Start column */
  startColumn: string;
  /** Start row (1-based) */
  startRow: number;
  /** End column */
  endColumn: string;
  /** End row (1-based) */
  endRow: number;
}

/**
 * Options for reading values from a sheet
 */
export interface ReadOptions {
  /** The spreadsheet ID */
  spreadsheetId: string;
  /** The range to read in A1 notation (e.g., "Sheet1!A1:B10") */
  range: string;
  /** How to format the returned values */
  valueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
  /** How to format date/time values */
  dateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING';
  /** The major dimension to use (ROWS or COLUMNS) */
  majorDimension?: 'ROWS' | 'COLUMNS';
}

/**
 * Options for writing values to a sheet
 */
export interface WriteOptions {
  /** The spreadsheet ID */
  spreadsheetId: string;
  /** The range to write in A1 notation (e.g., "Sheet1!A1:B10") */
  range: string;
  /** The values to write (2D array) */
  values: any[][];
  /** How to interpret the input data */
  valueInputOption?: 'RAW' | 'USER_ENTERED';
}
