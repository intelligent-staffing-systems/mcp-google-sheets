// @ts-check
/**
 * Type definitions for Google Sheets API
 * Generated from Google Sheets API Discovery Document (v4)
 * @module types
 */

// ============================================================================
// Core Spreadsheet Types
// ============================================================================

/**
 * Resource that represents a spreadsheet
 * @typedef {Object} Spreadsheet
 * @property {string} spreadsheetId - The ID of the spreadsheet (read-only)
 * @property {SpreadsheetProperties} properties - Overall properties of the spreadsheet
 * @property {Sheet[]} sheets - The sheets that are part of the spreadsheet
 * @property {NamedRange[]} [namedRanges] - Named ranges defined in the spreadsheet
 * @property {string} spreadsheetUrl - URL of the spreadsheet (read-only)
 * @property {DeveloperMetadata[]} [developerMetadata] - Developer metadata
 * @property {DataSource[]} [dataSources] - External data sources connected
 */

/**
 * Properties of a spreadsheet
 * @typedef {Object} SpreadsheetProperties
 * @property {string} title - Title of the spreadsheet
 * @property {string} [locale] - Locale of the spreadsheet (e.g., "en_US")
 * @property {string} [timeZone] - Time zone of the spreadsheet (e.g., "America/New_York")
 * @property {string} [autoRecalc] - When recalculation occurs (ON_CHANGE, MINUTE, HOUR)
 * @property {IterativeCalculationSettings} [iterativeCalculationSettings] - Iterative calculation settings
 * @property {string} [defaultFormat] - Default format of all cells
 * @property {SpreadsheetTheme} [spreadsheetTheme] - Theme applied to the spreadsheet
 */

/**
 * A sheet in a spreadsheet
 * @typedef {Object} Sheet
 * @property {SheetProperties} properties - Properties of the sheet
 * @property {GridData[]} [data] - Data in the grid (if requested)
 * @property {GridRange[]} [merges] - Merged cell ranges
 * @property {ConditionalFormatRule[]} [conditionalFormats] - Conditional formatting rules
 * @property {FilterView[]} [filterViews] - Filter views in the sheet
 * @property {ProtectedRange[]} [protectedRanges] - Protected ranges
 * @property {BasicFilter} [basicFilter] - Basic filter applied to the sheet
 * @property {EmbeddedChart[]} [charts] - Charts on the sheet
 * @property {BandedRange[]} [bandedRanges] - Banded (alternating row colors) ranges
 * @property {DeveloperMetadata[]} [developerMetadata] - Developer metadata
 * @property {RowGroup[]} [rowGroups] - Row groups on the sheet
 * @property {ColumnGroup[]} [columnGroups] - Column groups on the sheet
 * @property {Slicer[]} [slicers] - Slicers on the sheet
 */

/**
 * Properties of a sheet
 * @typedef {Object} SheetProperties
 * @property {number} sheetId - ID of the sheet (0-indexed)
 * @property {string} title - Title of the sheet
 * @property {number} index - Index of the sheet within the spreadsheet
 * @property {string} sheetType - Type of sheet (GRID, OBJECT, DATA_SOURCE)
 * @property {GridProperties} [gridProperties] - Properties of the grid (for GRID sheets)
 * @property {boolean} [hidden] - Whether the sheet is hidden
 * @property {Color} [tabColor] - Color of the sheet tab
 * @property {Color} [tabColorStyle] - Color style of the sheet tab
 * @property {boolean} [rightToLeft] - Whether the sheet is right-to-left layout
 * @property {DataSourceSheetProperties} [dataSourceSheetProperties] - Properties for DATA_SOURCE sheets
 */

/**
 * Properties of a grid
 * @typedef {Object} GridProperties
 * @property {number} [rowCount] - Number of rows in the grid
 * @property {number} [columnCount] - Number of columns in the grid
 * @property {number} [frozenRowCount] - Number of frozen rows
 * @property {number} [frozenColumnCount] - Number of frozen columns
 * @property {boolean} [hideGridlines] - Whether gridlines are hidden
 * @property {boolean} [rowGroupControlAfter] - Whether row group control is after the group
 * @property {boolean} [columnGroupControlAfter] - Whether column group control is after the group
 */

// ============================================================================
// Value Range Types (Most commonly used for read/write operations)
// ============================================================================

/**
 * Data within a range of the spreadsheet
 * @typedef {Object} ValueRange
 * @property {string} range - The range in A1 notation (e.g., "Sheet1!A1:B10")
 * @property {('ROWS'|'COLUMNS')} [majorDimension] - The major dimension of values (default: ROWS)
 * @property {Array<Array<string|number|boolean>>} values - 2D array of cell values
 */

/**
 * Response when appending values
 * @typedef {Object} AppendValuesResponse
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {string} tableRange - The range (in A1 notation) of the table being appended to
 * @property {UpdateValuesResponse} updates - Information about the updates
 */

/**
 * Response when updating values
 * @typedef {Object} UpdateValuesResponse
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {number} updatedRows - Number of rows updated
 * @property {number} updatedColumns - Number of columns updated
 * @property {number} updatedCells - Number of cells updated
 * @property {string} updatedRange - The range (in A1 notation) that was updated
 * @property {ValueRange} updatedData - The values actually updated
 */

/**
 * Response when getting multiple ranges
 * @typedef {Object} BatchGetValuesResponse
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {ValueRange[]} valueRanges - The requested ranges with their values
 */

/**
 * Response when updating multiple ranges
 * @typedef {Object} BatchUpdateValuesResponse
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {number} totalUpdatedRows - Total number of rows updated
 * @property {number} totalUpdatedColumns - Total number of columns updated
 * @property {number} totalUpdatedCells - Total number of cells updated
 * @property {number} totalUpdatedSheets - Total number of sheets updated
 * @property {UpdateValuesResponse[]} responses - One response per range updated
 */

// ============================================================================
// Grid Data Types (for detailed cell information)
// ============================================================================

/**
 * Data in a grid
 * @typedef {Object} GridData
 * @property {number} startRow - Starting row (0-indexed)
 * @property {number} startColumn - Starting column (0-indexed)
 * @property {RowData[]} rowData - The data in the grid, one entry per row
 * @property {DimensionProperties[]} [rowMetadata] - Metadata about each row
 * @property {DimensionProperties[]} [columnMetadata] - Metadata about each column
 */

/**
 * Data about each row
 * @typedef {Object} RowData
 * @property {CellData[]} values - The values in the row, one per column
 */

/**
 * Data about a cell
 * @typedef {Object} CellData
 * @property {ExtendedValue} [userEnteredValue] - Value the user entered
 * @property {ExtendedValue} [effectiveValue] - Calculated/effective value
 * @property {string} [formattedValue] - Formatted string value
 * @property {string} [userEnteredFormat] - Format the user entered
 * @property {CellFormat} [effectiveFormat] - Effective format being used
 * @property {string} [hyperlink] - Hyperlink in the cell
 * @property {string} [note] - Note attached to the cell
 * @property {TextFormatRun[]} [textFormatRuns] - Runs of text formatting
 * @property {DataValidationRule} [dataValidation] - Data validation rule
 * @property {PivotTable} [pivotTable] - Pivot table anchored at this cell
 * @property {DataSourceTable} [dataSourceTable] - Data source table anchored at this cell
 * @property {DataSourceFormula} [dataSourceFormula] - Data source formula
 */

/**
 * The value of a cell
 * @typedef {Object} ExtendedValue
 * @property {number} [numberValue] - Numeric value
 * @property {string} [stringValue] - String value
 * @property {boolean} [boolValue] - Boolean value
 * @property {string} [formulaValue] - Formula value (starts with =)
 * @property {ErrorValue} [errorValue] - Error value
 */

/**
 * An error in a cell
 * @typedef {Object} ErrorValue
 * @property {string} type - Type of error (ERROR, NULL_VALUE, DIVIDE_BY_ZERO, VALUE, REF, NAME, NUM, N_A, LOADING)
 * @property {string} message - Detailed error message
 */

/**
 * Format of a cell
 * @typedef {Object} CellFormat
 * @property {NumberFormat} [numberFormat] - Number format
 * @property {Color} [backgroundColor] - Background color
 * @property {ColorStyle} [backgroundColorStyle] - Background color style
 * @property {Borders} [borders] - Border configuration
 * @property {Padding} [padding] - Padding
 * @property {('LEFT'|'CENTER'|'RIGHT')} [horizontalAlignment] - Horizontal alignment
 * @property {('TOP'|'MIDDLE'|'BOTTOM')} [verticalAlignment] - Vertical alignment
 * @property {('OVERFLOW_CELL'|'CLIP'|'WRAP')} [wrapStrategy] - Wrap strategy
 * @property {('LEFT_TO_RIGHT'|'RIGHT_TO_LEFT')} [textDirection] - Text direction
 * @property {TextFormat} [textFormat] - Text format
 * @property {('HORIZONTAL'|'UP'|'DOWN')} [textRotation] - Text rotation
 * @property {string} [hyperlinkDisplayType] - Hyperlink display type
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * RGB color value
 * @typedef {Object} Color
 * @property {number} [red] - Red component (0-1)
 * @property {number} [green] - Green component (0-1)
 * @property {number} [blue] - Blue component (0-1)
 * @property {number} [alpha] - Alpha/transparency (0-1, default 1)
 */

/**
 * Color style with theme color support
 * @typedef {Object} ColorStyle
 * @property {Color} [rgbColor] - RGB color
 * @property {string} [themeColor] - Theme color type
 */

/**
 * Number format
 * @typedef {Object} NumberFormat
 * @property {string} type - Type of format (NUMBER, TEXT, DATE, TIME, DATE_TIME, CURRENCY, PERCENT, SCIENTIFIC)
 * @property {string} [pattern] - Pattern string (e.g., "$#,##0.00" for currency)
 */

/**
 * Text format
 * @typedef {Object} TextFormat
 * @property {Color} [foregroundColor] - Text color
 * @property {ColorStyle} [foregroundColorStyle] - Text color style
 * @property {string} [fontFamily] - Font family (e.g., "Arial")
 * @property {number} [fontSize] - Font size in points
 * @property {boolean} [bold] - Bold text
 * @property {boolean} [italic] - Italic text
 * @property {boolean} [strikethrough] - Strikethrough text
 * @property {boolean} [underline] - Underline text
 * @property {string} [link] - Link URL
 */

/**
 * Borders around a cell
 * @typedef {Object} Borders
 * @property {Border} [top] - Top border
 * @property {Border} [bottom] - Bottom border
 * @property {Border} [left] - Left border
 * @property {Border} [right] - Right border
 */

/**
 * A border on a cell
 * @typedef {Object} Border
 * @property {string} style - Border style (DOTTED, DASHED, SOLID, SOLID_MEDIUM, SOLID_THICK, DOUBLE)
 * @property {number} width - Border width in pixels
 * @property {Color} color - Border color
 * @property {ColorStyle} colorStyle - Border color style
 */

/**
 * Padding around content in a cell
 * @typedef {Object} Padding
 * @property {number} [top] - Top padding in pixels
 * @property {number} [right] - Right padding in pixels
 * @property {number} [bottom] - Bottom padding in pixels
 * @property {number} [left] - Left padding in pixels
 */

/**
 * A range on a grid
 * @typedef {Object} GridRange
 * @property {number} sheetId - Sheet ID
 * @property {number} [startRowIndex] - Start row (0-indexed, inclusive)
 * @property {number} [endRowIndex] - End row (0-indexed, exclusive)
 * @property {number} [startColumnIndex] - Start column (0-indexed, inclusive)
 * @property {number} [endColumnIndex] - End column (0-indexed, exclusive)
 */

/**
 * A named range
 * @typedef {Object} NamedRange
 * @property {string} namedRangeId - ID of the named range
 * @property {string} name - Name of the range
 * @property {GridRange} range - The range this represents
 */

/**
 * Properties about a dimension (row or column)
 * @typedef {Object} DimensionProperties
 * @property {boolean} [hiddenByFilter] - Whether hidden by a filter
 * @property {boolean} [hiddenByUser] - Whether hidden by user
 * @property {number} [pixelSize] - Height (for row) or width (for column) in pixels
 * @property {DeveloperMetadata[]} [developerMetadata] - Developer metadata
 * @property {DataSourceColumnReference} [dataSourceColumnReference] - Data source column reference
 */

// ============================================================================
// Placeholder Types (referenced but not fully defined)
// ============================================================================

/**
 * @typedef {Object} IterativeCalculationSettings
 * @property {number} [maxIterations] - Maximum iterations
 * @property {number} [convergenceThreshold] - Convergence threshold
 */

/**
 * @typedef {Object} SpreadsheetTheme
 * @property {string} [primaryFontFamily] - Primary font family
 * @property {ThemeColorPair[]} [themeColors] - Theme colors
 */

/**
 * @typedef {Object} ThemeColorPair
 * @property {string} colorType - Type of theme color
 * @property {ColorStyle} color - The color value
 */

/**
 * @typedef {Object} ConditionalFormatRule
 * @property {GridRange[]} ranges - Ranges to apply the rule
 * @property {BooleanRule} [booleanRule] - Boolean rule
 * @property {GradientRule} [gradientRule] - Gradient rule
 */

/**
 * @typedef {Object} BooleanRule
 * @property {BooleanCondition} condition - Condition
 * @property {CellFormat} format - Format to apply
 */

/**
 * @typedef {Object} GradientRule
 * @property {InterpolationPoint} minpoint - Min value
 * @property {InterpolationPoint} [midpoint] - Mid value
 * @property {InterpolationPoint} maxpoint - Max value
 */

/**
 * @typedef {Object} BooleanCondition
 * @property {string} type - Condition type
 * @property {ConditionValue[]} [values] - Condition values
 */

/**
 * @typedef {Object} ConditionValue
 * @property {string} [relativeDate] - Relative date
 * @property {string} [userEnteredValue] - User-entered value
 */

/**
 * @typedef {Object} InterpolationPoint
 * @property {Color} color - Color for this point
 * @property {ColorStyle} colorStyle - Color style
 * @property {string} type - Type (MIN, MAX, NUMBER, PERCENT, PERCENTILE)
 * @property {string} [value] - Value (for NUMBER, PERCENT, PERCENTILE)
 */

/**
 * @typedef {Object} FilterView
 */

/**
 * @typedef {Object} ProtectedRange
 */

/**
 * @typedef {Object} BasicFilter
 */

/**
 * @typedef {Object} EmbeddedChart
 */

/**
 * @typedef {Object} BandedRange
 */

/**
 * @typedef {Object} DeveloperMetadata
 */

/**
 * @typedef {Object} RowGroup
 */

/**
 * @typedef {Object} ColumnGroup
 */

/**
 * @typedef {Object} Slicer
 */

/**
 * @typedef {Object} DataSource
 */

/**
 * @typedef {Object} DataSourceSheetProperties
 */

/**
 * @typedef {Object} TextFormatRun
 */

/**
 * @typedef {Object} DataValidationRule
 */

/**
 * @typedef {Object} PivotTable
 */

/**
 * @typedef {Object} DataSourceTable
 */

/**
 * @typedef {Object} DataSourceFormula
 */

/**
 * @typedef {Object} DataSourceColumnReference
 */

// ============================================================================
// MCP-specific Types
// ============================================================================

/**
 * Google Sheets API client interface
 * @typedef {Object} GoogleSheetsClient
 * @property {function(Object): Promise<Spreadsheet>} createSpreadsheet - Create a new spreadsheet
 * @property {function(string, boolean): Promise<Spreadsheet>} getSpreadsheet - Get spreadsheet by ID
 * @property {function(string, string): Promise<ValueRange>} getValues - Get values from a range
 * @property {function(string, string[]): Promise<BatchGetValuesResponse>} batchGetValues - Get multiple ranges
 * @property {function(string, string, Array<Array<any>>, string): Promise<UpdateValuesResponse>} updateValues - Update values in a range
 * @property {function(string, ValueRange[], string): Promise<BatchUpdateValuesResponse>} batchUpdateValues - Update multiple ranges
 * @property {function(string, string, Array<Array<any>>, string, string): Promise<AppendValuesResponse>} appendValues - Append values to a range
 * @property {function(string, Object): Promise<Object>} batchUpdate - Perform batch update operations
 */

/**
 * MCP Tool definition
 * @typedef {Object} MCPTool
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {Object} inputSchema - Input schema (Zod object)
 */

/**
 * MCP Tool result
 * @typedef {Object} MCPToolResult
 * @property {Array<{type: string, text: string}>} content - Response content
 * @property {boolean} [isError] - Whether this is an error response
 */

export {};
