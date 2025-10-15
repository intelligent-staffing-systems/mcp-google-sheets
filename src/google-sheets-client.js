// @ts-check

/**
 * Google Sheets API Client
 * Handles authentication and API calls to Google Sheets API v4
 */

import https from 'https';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';

/** @typedef {import('../types').GoogleSheetsConfig} GoogleSheetsConfig */
/** @typedef {import('../types').Spreadsheet} Spreadsheet */
/** @typedef {import('../types').ValueRange} ValueRange */
/** @typedef {import('../types').BatchGetValuesResponse} BatchGetValuesResponse */
/** @typedef {import('../types').UpdateValuesResponse} UpdateValuesResponse */
/** @typedef {import('../types').MCPResponse} MCPResponse */

export class GoogleSheetsClient {
  /**
   * @param {GoogleSheetsConfig & { serviceAccountPath: string }} config
   */
  constructor(config) {
    this.config = {
      apiUrl: config.apiUrl || 'https://sheets.googleapis.com/v4',
      serviceAccountPath: config.serviceAccountPath
    };

    // Load service account credentials
    try {
      this.serviceAccount = JSON.parse(readFileSync(this.config.serviceAccountPath, 'utf8'));
    } catch (error) {
      throw new Error(`Failed to load service account: ${error.message}`);
    }

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Create a JWT for service account authentication
   * @private
   * @returns {string}
   */
  createJWT() {
    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: this.serviceAccount.token_uri,
      exp: now + 3600, // 1 hour
      iat: now
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const sign = createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(this.serviceAccount.private_key, 'base64url');

    return `${signatureInput}.${signature}`;
  }

  /**
   * Get or refresh access token
   * @private
   * @returns {Promise<string>}
   */
  async getAccessToken() {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    const jwt = this.createJWT();
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const url = new URL(this.serviceAccount.token_uri);

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            this.accessToken = parsed.access_token;
            this.tokenExpiry = Date.now() + (parsed.expires_in * 1000);
            resolve(this.accessToken);
          } else {
            reject(new Error(`Token request failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Make an authenticated GET request to Google Sheets API
   * @private
   * @param {string} path - API path (e.g., '/spreadsheets/123')
   * @returns {Promise<any>}
   */
  async get(path) {
    const token = await this.getAccessToken();
    const url = `${this.config.apiUrl}${path}`;

    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`GET ${path} failed: ${res.statusCode} ${data}`));
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Make an authenticated PUT request to Google Sheets API
   * @private
   * @param {string} path - API path
   * @param {any} body - Request body
   * @returns {Promise<any>}
   */
  async put(path, body) {
    const token = await this.getAccessToken();
    const url = new URL(`${this.config.apiUrl}${path}`);
    const postData = JSON.stringify(body);

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`PUT ${path} failed: ${res.statusCode} ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Get spreadsheet metadata
   * @param {string} spreadsheetId
   * @param {boolean} [includeGridData=false] - Whether to include cell data
   * @returns {Promise<MCPResponse<Spreadsheet>>}
   */
  async getSpreadsheet(spreadsheetId, includeGridData = false) {
    try {
      const params = includeGridData ? '?includeGridData=true' : '';
      const data = await this.get(`/spreadsheets/${spreadsheetId}${params}`);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get values from a range
   * @param {string} spreadsheetId
   * @param {string} range - A1 notation (e.g., "Sheet1!A1:B10")
   * @param {Object} [options]
   * @param {string} [options.valueRenderOption] - How to render values
   * @param {string} [options.dateTimeRenderOption] - How to render dates
   * @returns {Promise<MCPResponse<ValueRange>>}
   */
  async getValues(spreadsheetId, range, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.valueRenderOption) {
        params.append('valueRenderOption', options.valueRenderOption);
      }
      if (options.dateTimeRenderOption) {
        params.append('dateTimeRenderOption', options.dateTimeRenderOption);
      }

      const queryString = params.toString();
      const path = `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}${queryString ? '?' + queryString : ''}`;
      const data = await this.get(path);

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get values from multiple ranges
   * @param {string} spreadsheetId
   * @param {string[]} ranges - Array of A1 notation ranges
   * @param {Object} [options]
   * @param {string} [options.valueRenderOption] - How to render values
   * @param {string} [options.dateTimeRenderOption] - How to render dates
   * @returns {Promise<MCPResponse<BatchGetValuesResponse>>}
   */
  async batchGetValues(spreadsheetId, ranges, options = {}) {
    try {
      const params = new URLSearchParams();
      ranges.forEach(range => params.append('ranges', range));
      if (options.valueRenderOption) {
        params.append('valueRenderOption', options.valueRenderOption);
      }
      if (options.dateTimeRenderOption) {
        params.append('dateTimeRenderOption', options.dateTimeRenderOption);
      }

      const path = `/spreadsheets/${spreadsheetId}/values:batchGet?${params.toString()}`;
      const data = await this.get(path);

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update values in a range
   * @param {string} spreadsheetId
   * @param {string} range - A1 notation
   * @param {any[][]} values - 2D array of values
   * @param {Object} [options]
   * @param {string} [options.valueInputOption='USER_ENTERED'] - How to interpret input
   * @returns {Promise<MCPResponse<UpdateValuesResponse>>}
   */
  async updateValues(spreadsheetId, range, values, options = {}) {
    try {
      const valueInputOption = options.valueInputOption || 'USER_ENTERED';
      const path = `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`;

      const data = await this.put(path, { values });

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Append values to a sheet
   * @param {string} spreadsheetId
   * @param {string} range - A1 notation (usually just sheet name)
   * @param {any[][]} values - 2D array of values
   * @param {Object} [options]
   * @param {string} [options.valueInputOption='USER_ENTERED'] - How to interpret input
   * @returns {Promise<MCPResponse<any>>}
   */
  async appendValues(spreadsheetId, range, values, options = {}) {
    try {
      const valueInputOption = options.valueInputOption || 'USER_ENTERED';
      const token = await this.getAccessToken();
      const path = `/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}`;
      const url = new URL(`${this.config.apiUrl}${path}`);
      const postData = JSON.stringify({ values });

      return new Promise((resolve, reject) => {
        const req = https.request({
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': postData.length
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve({
                success: true,
                data: JSON.parse(data)
              });
            } else {
              resolve({
                success: false,
                error: `POST ${path} failed: ${res.statusCode} ${data}`
              });
            }
          });
        });

        req.on('error', (error) => {
          resolve({
            success: false,
            error: error.message
          });
        });
        req.write(postData);
        req.end();
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all sheets in a spreadsheet
   * @param {string} spreadsheetId
   * @returns {Promise<MCPResponse<Array<{title: string, sheetId: number, index: number}>>>}
   */
  async listSheets(spreadsheetId) {
    try {
      const result = await this.getSpreadsheet(spreadsheetId, false);
      if (!result.success) {
        return result;
      }

      const sheets = result.data.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
        index: sheet.properties?.index,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount
      })) || [];

      return {
        success: true,
        data: sheets
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
