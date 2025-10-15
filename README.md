# MCP Google Sheets Server

An MCP (Model Context Protocol) server that enables AI assistants to interact with Google Sheets, allowing them to read and write spreadsheet data programmatically.

## Features

- **Get Spreadsheet Metadata**: Retrieve information about a spreadsheet including title, URL, and sheets
- **List Sheets**: Get all sheets (tabs) in a spreadsheet
- **Read Values**: Read cell values from any range using A1 notation
- **Batch Read**: Read multiple ranges at once for efficiency
- **Update Values**: Write data to specific ranges
- **Append Values**: Add new rows to the end of a sheet

## Prerequisites

- Node.js 18+ installed
- Google Cloud Service Account with Google Sheets API enabled
- Service account credentials JSON file

## Setup

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google Sheets API:
   - Go to APIs & Services → Library
   - Search for "Google Sheets API"
   - Click Enable
4. Create a Service Account:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "Service Account"
   - Fill in details and create
   - Click on the service account
   - Go to "Keys" tab → "Add Key" → "Create new key" → JSON
   - Download the JSON file

### 2. Share Your Spreadsheet

Share your Google Sheet with the service account email (found in the JSON file as `client_email`):
- Open your Google Sheet
- Click "Share"
- Add the service account email (e.g., `your-service-account@project.iam.gserviceaccount.com`)
- Give it "Editor" access (or "Viewer" for read-only)

### 3. Installation

```bash
# Clone or navigate to the directory
cd mcp-google-sheets

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set:
# - GOOGLE_SERVICE_ACCOUNT_PATH: path to your JSON credentials file
# - GOOGLE_SPREADSHEET_ID: (optional) default spreadsheet ID
```

### 4. Test Connection

```bash
# Test service account authentication
npm run test:service

# Test API client
npm test

# Test MCP tools
npm run test:mcp
```

## Running the MCP Server

### Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Available MCP Tools

### `get_spreadsheet`
Get metadata about a spreadsheet

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID from the URL
- `include_grid_data` (optional): Include cell data (default: false)

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc",
  include_grid_data: false
}
```

### `list_sheets`
List all sheets (tabs) in a spreadsheet

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc"
}
```

### `get_values`
Read values from a range

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID
- `range` (required): A1 notation (e.g., "Sheet1!A1:B10")
- `value_render_option` (optional): How to format values
  - `FORMATTED_VALUE` (default): As displayed in the UI
  - `UNFORMATTED_VALUE`: Raw values
  - `FORMULA`: Cell formulas
- `date_time_render_option` (optional): How to format dates
  - `SERIAL_NUMBER` (default): As decimal
  - `FORMATTED_STRING`: As formatted string

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc",
  range: "Sheet1!A1:D10",
  value_render_option: "FORMATTED_VALUE"
}
```

### `batch_get_values`
Read multiple ranges at once

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID
- `ranges` (required): Array of A1 notation ranges
- `value_render_option` (optional): Same as get_values
- `date_time_render_option` (optional): Same as get_values

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc",
  ranges: ["Sheet1!A1:A10", "Sheet1!B1:B10", "Sheet2!A1:Z100"]
}
```

### `update_values`
Update values in a range (overwrites existing data)

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID
- `range` (required): A1 notation for where to write
- `values` (required): 2D array of values to write
- `value_input_option` (optional): How to interpret input
  - `USER_ENTERED` (default): Parse as if user typed (numbers, formulas, etc.)
  - `RAW`: Store as-is (everything as strings)

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc",
  range: "Sheet1!A1:B2",
  values: [
    ["Name", "Score"],
    ["Alice", 95]
  ],
  value_input_option: "USER_ENTERED"
}
```

### `append_values`
Append new rows to a sheet

**Parameters:**
- `spreadsheet_id` (required): The spreadsheet ID
- `range` (required): Sheet name or range (e.g., "Sheet1" or "Sheet1!A1")
- `values` (required): 2D array of values to append
- `value_input_option` (optional): Same as update_values

**Example:**
```javascript
{
  spreadsheet_id: "1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc",
  range: "Sheet1",
  values: [
    ["Bob", 87],
    ["Carol", 92]
  ]
}
```

## A1 Notation Guide

Google Sheets uses A1 notation to specify ranges:

- `A1` - Single cell
- `A1:B10` - Range from A1 to B10
- `Sheet1!A1:B10` - Range on specific sheet
- `Sheet1` - Entire sheet
- `A:A` - Entire column A
- `1:1` - Entire row 1
- `A1:Z` - From A1 to the end of column Z

## Project Structure

```
mcp-google-sheets/
├── index.js                      # Main MCP server entry point
├── types.ts                      # TypeScript type definitions
├── package.json                  # Dependencies and scripts
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .mcp.json                     # MCP server configuration
├── src/
│   ├── google-sheets-client.js   # Google Sheets API client
│   └── handlers/
│       ├── sheet-handlers.js     # Spreadsheet-level operations
│       └── value-handlers.js     # Read/write operations
├── test-client.js                # API client tests
├── test-service-account.js       # Service account auth tests
└── test-mcp-tools.js             # MCP tool handler tests
```

## Environment Variables

Create a `.env` file with:

```bash
# Path to your Google Cloud service account JSON file
GOOGLE_SERVICE_ACCOUNT_PATH=/path/to/your/service-account.json

# Optional: Default spreadsheet ID
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

## Getting Spreadsheet ID

The spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
                                        ^^^^^^^^^^^^^^^^
```

Example:
```
https://docs.google.com/spreadsheets/d/1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc/edit
```
Spreadsheet ID: `1TmPs7UJCKAP6DiiJcVq3W2z6P7LJImrSeEjnI-2TAGc`

## Troubleshooting

### Permission Denied Errors

- Make sure the spreadsheet is shared with the service account email
- Check that the service account has the correct permissions (Editor or Viewer)

### Authentication Errors

- Verify the service account JSON file path is correct
- Ensure the Google Sheets API is enabled in your Google Cloud project
- Check that the JSON file contains valid credentials

### Range Not Found Errors

- Double-check the sheet name spelling (case-sensitive)
- Verify the range is in valid A1 notation
- Make sure the sheet/range exists in the spreadsheet

## Google Sheets API Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [A1 Notation Guide](https://developers.google.com/sheets/api/guides/concepts#cell)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)

## License

MIT
