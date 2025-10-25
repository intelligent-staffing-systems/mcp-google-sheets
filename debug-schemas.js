#!/usr/bin/env node
import { getAllToolDefinitions } from './src/tools/index.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

const tools = getAllToolDefinitions();

const sheetByGidTool = tools.find(t => t.name === 'get-sheet-by-gid');

console.log('\n=== get-sheet-by-gid tool ===');
console.log('Tool definition:');
console.log(JSON.stringify(sheetByGidTool, null, 2));

console.log('\n\n=== Converted JSON Schema ===');
const jsonSchema = zodToJsonSchema(sheetByGidTool.inputSchema);
console.log(JSON.stringify(jsonSchema, null, 2));

console.log('\n\n=== Input Schema (Zod) ===');
console.log('Schema:', sheetByGidTool.inputSchema);
console.log('Shape:', sheetByGidTool.inputSchema.shape);
