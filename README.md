# mcp-sheets

**Model Context Protocol (MCP) server for Google Sheets API**

Connect AI agents to Google Sheets with a clean, typed interface following MCP best practices.

## Features

✅ **Complete Google Sheets API coverage**
- Create, read, update spreadsheets
- Get/set cell values with A1 notation
- Append data to tables
- Clear ranges

✅ **Smart URL handling**
- Accept full Google Sheets URLs or just spreadsheet IDs
- Automatically extracts spreadsheet ID from URLs
- Example: `https://docs.google.com/spreadsheets/d/{ID}/edit...`

✅ **MCP 2025 compliant**
- Tools for AI actions
- Resources for read-only context
- Structured error handling
- Comprehensive logging

✅ **Developer-friendly**
- TypeScript/JSDoc types throughout
- Clean async/await API
- Modular tool organization
- Zod schema validation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**
4. Create a **Service Account**
5. Download the JSON key file
6. Share your spreadsheet with the service account email

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
GOOGLE_SPREADSHEET_ID=your-default-spreadsheet-id  # Optional
```

### 4. Run the MCP Server

```bash
npm start
```

## Usage

### With Claude Code

Add to your `.claude/config.json`:

```json
{
  "mcpServers": {
    "mcp-sheets": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-sheets/src/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Available Tools

#### Spreadsheet Operations

**`create-spreadsheet`**
```javascript
{
  title: "My New Spreadsheet",
  locale: "en_US",           // Optional
  timeZone: "America/New_York"  // Optional
}
```

**`get-spreadsheet`**
```javascript
{
  spreadsheetId: "1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo",
  // Or use full URL:
  spreadsheetId: "https://docs.google.com/spreadsheets/d/1FmDx.../edit",
  includeGridData: false  // Optional
}
```

#### Value Operations

**`get-values`**
```javascript
{
  spreadsheetId: "1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo",
  range: "Sheet1!A1:C10"
}
```

**`update-values`**
```javascript
{
  spreadsheetId: "1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo",
  range: "Sheet1!A1:B2",
  values: [
    ["Name", "Score"],
    ["Alice", 95]
  ]
}
```

**`append-values`**
```javascript
{
  spreadsheetId: "1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo",
  range: "Sheet1!A:B",  // Table to append to
  values: [
    ["Bob", 87],
    ["Carol", 92]
  ]
}
```

**`clear-values`**
```javascript
{
  spreadsheetId: "1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo",
  range: "Sheet1!A1:Z100"
}
```

### Using with URLs

You can paste Google Sheets URLs directly:

```
User: "Please help me work on this sheet:
https://docs.google.com/spreadsheets/d/1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo/edit?gid=1850828774"

AI: *Automatically extracts spreadsheet ID and can work with it*
```

The server will:
- Extract spreadsheet ID: `1FmDx17Gm2aEa0andQE_JP8qcJD5XfeYhIABvZeFX_Zo`
- Note the gid (sheet ID): `1850828774`
- Use these in API calls

## Project Structure

```
mcp-sheets/
├── src/
│   ├── index.js                 # MCP server entry point
│   ├── types.js                 # JSDoc type definitions
│   │
│   ├── client/
│   │   └── sheets-client.js     # Google Sheets API wrapper
│   │
│   ├── tools/
│   │   ├── index.js             # Tool registry (auto-imports)
│   │   ├── spreadsheet.tools.js # Spreadsheet operations
│   │   └── values.tools.js      # Cell value operations
│   │
│   ├── resources/
│   │   └── index.js             # Read-only resources
│   │
│   └── utils/
│       ├── logger.js            # Logging utility
│       └── url-parser.js        # URL parsing for sheet IDs
│
├── docs/
│   └── discover.json            # Google Sheets API discovery doc
│
├── .env                         # Your credentials (gitignored)
├── .env.example                 # Template
├── .mcp.json                    # MCP configuration
└── package.json
```

## Architecture

### MCP Components

**Tools** (Actions AI can take)
- `create-spreadsheet` - Create new spreadsheets
- `get-spreadsheet` - Get metadata
- `get-values` - Read cell data
- `update-values` - Write cell data
- `append-values` - Add rows
- `clear-values` - Clear ranges

**Resources** (Read-only context)
- `resource://mcp-sheets/spreadsheet/{id}` - Spreadsheet metadata

**Tool Registry Pattern**
- Add new tool files to `src/tools/`
- Import in `src/tools/index.js`
- Auto-registered on server start

### Design Principles

1. **Single Responsibility** - Each tool module handles one domain
2. **URL Flexibility** - Accept IDs or URLs everywhere
3. **Type Safety** - JSDoc types + Zod validation
4. **Clean Errors** - Structured error handling with helpful messages
5. **Security First** - Credentials in .env (gitignored), not .mcp.json

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (auto-restart on changes)
npm run dev

# Run tests
npm test
```

## Troubleshooting

### "GOOGLE_APPLICATION_CREDENTIALS not set"
- Make sure `.env` exists and has the correct path
- Check that the path points to a valid JSON key file

### "Failed to initialize Sheets client"
- Verify your service account key file is valid
- Ensure Google Sheets API is enabled in your project
- Check that the service account has the right permissions

### "The caller does not have permission"
- Share your spreadsheet with the service account email
- The email is in your service account key JSON: `client_email`

### "Invalid Google Sheets URL"
- URL format: `https://docs.google.com/spreadsheets/d/{ID}/edit`
- Or just use the spreadsheet ID directly

## Contributing

This is a clean rebuild following MCP 2025 best practices:
- Modular tool organization
- Comprehensive type definitions
- URL parsing for better UX
- Security-first configuration

Feel free to add more tools or improve existing ones!

## License

MIT

## Test Results ✅

All tests passing as of 2025-10-25:

```bash
# Setup validation
$ node test-setup.js
✅ All tests passed! MCP server is ready to use.

# Tool execution
$ node test-tools.js
✅ 12 tools registered
✅ get-spreadsheet with URL - Works!
✅ get-values - Successfully read data!

# Complete GID workflow
$ node test-gid-workflow.js
✅ Parse URL and extract gid
✅ Resolve gid to sheet name
✅ Show preview with cell references (A1, B2, etc.)
✅ Search and find data
✅ Ready for read/write operations with exact cell refs
```

### Live Test with Claude Code

User workflow tested successfully:
```
User: "work with me on https://docs.google.com/.../edit?gid=241635364"

AI Response:
1. Calls get-sheet-by-gid → Found "From Monday Board List" (996 rows × 23 columns)
2. Calls get-sheet-preview → Shows A1: "Name", E1: "Shopify Status", etc.
3. Ready for operations: "Update E2", "Find all Draft", etc.
```

**Status:** Production ready ✅
