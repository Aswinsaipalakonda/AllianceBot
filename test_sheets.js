const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
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

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('Fetching spreadsheet metadata for ID:', spreadsheetId);
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    console.log('Sheets found:', meta.data.sheets.map(s => s.properties.title));

    console.log('Reading Admissions Leads sheet range A:H...');
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Admissions Leads!A:H',
    });
    console.log('Admissions Leads rows count:', resp.data.values?.length || 0);
    if (resp.data.values && resp.data.values.length > 0) {
      console.log('Headers:', resp.data.values[0]);
      console.log('Sample Row 1:', resp.data.values[1]);
    }
  } catch (err) {
    console.error('Error running test:', err);
  }
}

run();
