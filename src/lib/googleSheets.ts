import { google } from 'googleapis';

function getSheetsClient() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function appendToSheet(sheetName: string, rows: any[][]) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });
    console.log(`Successfully appended to sheet: ${sheetName}`);
  } catch (error: any) {
    console.error(`Error appending to sheet ${sheetName}:`, error.message);
    throw error;
  }
}

export async function updateOrAddLead(phone: string, name: string, course: string, status: string, category: string, lastMessage: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Admissions Leads';

    // 1. Fetch current leads to see if phone exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = response.data.values || [];
    const timestamp = new Date().toLocaleString();
    let rowIndex = -1;

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === phone) {
        rowIndex = i + 1; // 1-indexed for sheets
        break;
      }
    }

    if (rowIndex !== -1) {
      // Update existing lead row
      // Columns: Timestamp (A), Name (B), Phone (C), Interested Course (D), Lead Status (E), Lead Category (F), Last Message (G)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:G${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, name, phone, course, status, category, lastMessage]]
        }
      });
      console.log(`Updated lead for ${name} at row ${rowIndex}`);
    } else {
      // Append new lead
      await appendToSheet(sheetName, [[timestamp, name, phone, course, status, category, lastMessage]]);
      console.log(`Added new lead for ${name}`);
    }
  } catch (error: any) {
    console.error('Error updating/adding lead:', error.message);
  }
}
