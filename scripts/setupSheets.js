const { google } = require('googleapis');
require('dotenv').config({ path: '../.env.local' });

async function setupSheets() {
  try {
    console.log("Authenticating with Google API...");
    
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
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

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`Accessing Spreadsheet ID: ${spreadsheetId}`);

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const currentSheets = spreadsheet.data.sheets;
    const defaultSheet = currentSheets.find(s => s.properties.title === 'Sheet1' || s.properties.index === 0);
    const defaultSheetId = defaultSheet ? defaultSheet.properties.sheetId : 0;

    const newSheetsConfig = [
      {
        title: 'Admissions Leads',
        headers: ['Timestamp', 'Name', 'Phone', 'Interested Course', 'Lead Status', 'Lead Category', 'Last Message']
      },
      {
        title: 'Course Queries',
        headers: ['Timestamp', 'Phone', 'Course Asked', 'User Message', 'AI Response']
      },
      {
        title: 'Placement Queries',
        headers: ['Timestamp', 'Phone', 'Query', 'AI Response']
      },
      {
        title: 'Scholarship Queries',
        headers: ['Timestamp', 'Phone', 'Query', 'AI Response']
      },
      {
        title: 'Human Followups',
        headers: ['Timestamp', 'Counselor Name', 'Student Phone', 'Notes', 'Action Taken']
      }
    ];

    console.log("Preparing batch updates...");

    const requests = [];

    for (let i = 0; i < newSheetsConfig.length; i++) {
      const config = newSheetsConfig[i];
      const existingSheet = currentSheets.find(s => s.properties.title === config.title);

      if (i === 0 && !existingSheet) {
        requests.push({
          updateSheetProperties: {
            properties: {
              sheetId: defaultSheetId,
              title: config.title
            },
            fields: 'title'
          }
        });
      } else if (!existingSheet) {
        requests.push({
          addSheet: {
            properties: {
              title: config.title
            }
          }
        });
      }
    }

    if (requests.length > 0) {
      console.log("Creating/Renaming sheets...");
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });
    } else {
      console.log("Sheets already exist.");
    }

    console.log("Setting up column headers...");
    for (const config of newSheetsConfig) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${config.title}!A1:Z1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [config.headers]
        }
      });
      console.log(`Set headers for ${config.title}`);
    }

    console.log("Formatting headers...");
    const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const formatRequests = [];

    for (const config of newSheetsConfig) {
      const sheetInfo = updatedSpreadsheet.data.sheets.find(s => s.properties.title === config.title);
      if (sheetInfo) {
        formatRequests.push({
          repeatCell: {
            range: {
              sheetId: sheetInfo.properties.sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: config.headers.length
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
              }
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)'
          }
        });
      }
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests }
    });

    console.log("Successfully setup all Google Sheets!");

  } catch (error) {
    console.error("Error setting up sheets:", error.message);
  }
}

setupSheets();
