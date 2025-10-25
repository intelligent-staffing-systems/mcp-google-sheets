#!/usr/bin/env node
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const schema = z.object({
  spreadsheetId: z.string().describe('Spreadsheet ID or full Google Sheets URL'),
  gid: z.string().optional().describe('Sheet ID (gid from URL, e.g., "1850828774"). If URL contains gid, this is optional.'),
});

const jsonSchema = zodToJsonSchema(schema);
console.log(JSON.stringify(jsonSchema, null, 2));
