const { google } = require('googleapis');

class GoogleSheetsDB {
    constructor() {
        this.sheets = google.sheets({ version: 'v4' });
        this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
        this.range = 'Sheet1!A:C'; // Date, User, Timestamp columns
    }

    async getAuthClient() {
        // For service account authentication
        let credentials;
        
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // If credentials are provided as environment variable (JSON string)
            try {
                credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
            } catch (error) {
                console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS:', error);
                throw new Error('Invalid GOOGLE_APPLICATION_CREDENTIALS format');
            }
        } else {
            // Fallback to file (for local development)
            const fs = require('fs');
            const path = require('path');
            const credentialsPath = path.join(__dirname, 'credentials.json');
            
            if (fs.existsSync(credentialsPath)) {
                credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            } else {
                throw new Error('No Google credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable or add credentials.json file.');
            }
        }

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth.getClient();
    }

    async getLastWatered() {
        try {
            const auth = await this.getAuthClient();
            const response = await this.sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: this.spreadsheetId,
                range: this.range,
            });

            const rows = response.data.values;
            if (!rows || rows.length <= 1) { // Only header row or empty
                return null;
            }

            // Get the last row (most recent watering)
            const lastRow = rows[rows.length - 1];
            if (lastRow && lastRow.length >= 3) {
                return {
                    date: lastRow[0],
                    user: lastRow[1],
                    timestamp: lastRow[2]
                };
            }

            return null;
        } catch (error) {
            console.error('Error reading from Google Sheets:', error);
            throw error;
        }
    }

    async addWatering(userName) {
        try {
            const auth = await this.getAuthClient();
            const now = new Date();
            const dateStr = now.toLocaleDateString();
            const timeStr = now.toLocaleTimeString();
            const timestamp = now.toISOString();

            const values = [[dateStr, userName, timestamp]];

            await this.sheets.spreadsheets.values.append({
                auth,
                spreadsheetId: this.spreadsheetId,
                range: this.range,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: values
                }
            });

            return {
                date: dateStr,
                user: userName,
                timestamp: timestamp
            };
        } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            throw error;
        }
    }

    async getHistory(limit = 10) {
        try {
            const auth = await this.getAuthClient();
            const response = await this.sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: this.spreadsheetId,
                range: this.range,
            });

            const rows = response.data.values;
            if (!rows || rows.length <= 1) {
                return [];
            }

            // Skip header row and get last 'limit' entries
            const dataRows = rows.slice(1).slice(-limit).reverse();
            return dataRows.map(row => ({
                date: row[0],
                user: row[1],
                timestamp: row[2]
            }));
        } catch (error) {
            console.error('Error reading history from Google Sheets:', error);
            throw error;
        }
    }

    async initializeSheet() {
        try {
            const auth = await this.getAuthClient();
            
            // Check if headers exist
            const response = await this.sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: this.spreadsheetId,
                range: 'Sheet1!A1:C1',
            });

            if (!response.data.values || response.data.values.length === 0) {
                // Add headers
                await this.sheets.spreadsheets.values.update({
                    auth,
                    spreadsheetId: this.spreadsheetId,
                    range: 'Sheet1!A1:C1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [['Date', 'User', 'Timestamp']]
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing sheet:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetsDB; 