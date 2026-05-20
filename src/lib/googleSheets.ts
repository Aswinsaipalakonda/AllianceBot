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

export async function getLeads() {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Admissions Leads';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const leads = [];

    // Columns: Timestamp (0), Name (1), Phone (2), Interested Course (3), Lead Status (4), Lead Category (5), Last Message (6), AI Auto Reply (7)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[2]) continue; // Skip if phone is empty
      leads.push({
        id: `LD-${1000 + i}`,
        name: row[1] || 'Prospective Student',
        phone: row[2],
        course: row[3] || 'Undecided',
        status: row[4] || 'New Lead',
        category: row[5] || 'Course Queries',
        lastMessage: row[6] || '',
        aiEnabled: row[7] !== 'false', // Default to true if not explicitly 'false'
        date: row[0] ? row[0].split(',')[0] : new Date().toLocaleDateString(),
        timestamp: row[0] || '',
      });
    }

    return leads;
  } catch (error: any) {
    console.error('Error fetching leads from Google Sheets:', error.message);
    return [];
  }
}

export async function updateOrAddLead(
  phone: string,
  name: string,
  course: string,
  status: string,
  category: string,
  lastMessage: string
) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Admissions Leads';

    // 1. Fetch current leads to see if phone exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values || [];
    const timestamp = new Date().toLocaleString();
    let rowIndex = -1;
    let existingAIStatus = 'true'; // Default to true

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === phone) {
        rowIndex = i + 1; // 1-indexed for sheets
        existingAIStatus = rows[i][7] !== undefined ? rows[i][7] : 'true';
        break;
      }
    }

    if (rowIndex !== -1) {
      // Update existing lead row (keep the existing AI toggle status)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:H${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, name, phone, course, status, category, lastMessage, existingAIStatus]],
        },
      });
      console.log(`Updated lead for ${name} at row ${rowIndex}`);
    } else {
      // Append new lead with default AI Auto Reply as 'true'
      await appendToSheet(sheetName, [[timestamp, name, phone, course, status, category, lastMessage, 'true']]);
      console.log(`Added new lead for ${name}`);
    }
  } catch (error: any) {
    console.error('Error updating/adding lead:', error.message);
  }
}

export async function toggleAIAutoReply(phone: string, enabled: boolean) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Admissions Leads';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:C`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === phone) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!H${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[enabled ? 'true' : 'false']],
        },
      });
      console.log(`Successfully toggled AI to ${enabled} for phone ${phone}`);
      return true;
    }

    console.warn(`Lead with phone ${phone} not found for AI toggle`);
    return false;
  } catch (error: any) {
    console.error('Error toggling AI Auto Reply status:', error.message);
    throw error;
  }
}

export async function getConversationHistory(phone: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const messages: any[] = [];

    // Helper to safely parse localized timestamp strings to Date objects for sorting
    const parseTimestamp = (tsStr: string) => {
      try {
        const d = new Date(tsStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      } catch {
        return 0;
      }
    };

    // 1. Read Course Queries: [Timestamp, Phone, Course, UserMessage, BotMessage]
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Course Queries!A:E',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || row[1] !== phone) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        // Add User Message
        if (row[3]) {
          messages.push({
            id: `cq-${idx}-user-${timeVal}`,
            text: row[3],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        // Add Bot Reply
        if (row[4]) {
          messages.push({
            id: `cq-${idx}-bot-${timeVal}`,
            text: row[4],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal + 1, // small offset to sort bot message after user message
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Course Queries:', e.message);
    }

    // 2. Read Placement Queries: [Timestamp, Phone, Query, BotResponse]
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Placement Queries!A:D',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || row[1] !== phone) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        if (row[2]) {
          messages.push({
            id: `pq-${idx}-user-${timeVal}`,
            text: row[2],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        if (row[3]) {
          messages.push({
            id: `pq-${idx}-bot-${timeVal}`,
            text: row[3],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal + 1,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Placement Queries:', e.message);
    }

    // 3. Read Scholarship Queries: [Timestamp, Phone, Query, BotResponse]
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Scholarship Queries!A:D',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || row[1] !== phone) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        if (row[2]) {
          messages.push({
            id: `sq-${idx}-user-${timeVal}`,
            text: row[2],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        if (row[3]) {
          messages.push({
            id: `sq-${idx}-bot-${timeVal}`,
            text: row[3],
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal + 1,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Scholarship Queries:', e.message);
    }

    // 4. Read Human Followups: [Timestamp, CounselorName, StudentPhone, Notes, ActionTaken]
    // Webhook log: [timestamp, 'Unassigned Counselor', studentPhone, `Student Message: ${messageText}`, 'Awaiting Human Counselor']
    // Counselor log: [timestamp, 'Counselor Priya', studentPhone, 'Counselor Reply', counselorReplyText]
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Human Followups!A:E',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || row[2] !== phone) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        const notes = row[3] || '';
        const action = row[4] || '';

        if (notes.startsWith('Student Message:')) {
          messages.push({
            id: `hf-${idx}-user-${timeVal}`,
            text: notes.replace('Student Message:', '').trim(),
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal,
            sender: 'user',
          });
        } else if (notes === 'Counselor Reply') {
          messages.push({
            id: `hf-${idx}-counselor-${timeVal}`,
            text: action,
            time: ts.split(',')[1]?.trim() || ts,
            timestamp: timeVal,
            sender: 'bot', // Display as counselor's bubble (aligned right, matching bot replies)
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Human Followups:', e.message);
    }

    // Sort chronologically by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);

    // Remove the temporary timestamp sorting key before returning
    return messages.map(({ id, text, time, sender, read }) => ({
      id,
      text,
      time,
      sender,
      read: read || false,
    }));
  } catch (error: any) {
    console.error('Error fetching conversation history:', error.message);
    return [];
  }
}

export async function logCounselorReply(phone: string, counselorName: string, message: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const timestamp = new Date().toLocaleString();

    // 1. Log manual entry into Human Followups
    // [Timestamp, CounselorName, StudentPhone, Notes, ActionTaken]
    await appendToSheet('Human Followups', [[timestamp, counselorName, phone, 'Counselor Reply', message]]);

    // 2. Fetch student's Name and Course to perform single-cell update on Admissions Leads
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Admissions Leads!A:H',
    });
    const rows = resp.data.values || [];
    let rowIndex = -1;
    let currentName = 'Prospective Student';
    let currentCourse = 'Undecided';
    let currentStatus = 'Follow-up';
    let currentCategory = 'Human Followups';
    let currentAIStatus = 'false'; // Keep as human mode since counselor is manual replying

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === phone) {
        rowIndex = i + 1;
        currentName = rows[i][1] || currentName;
        currentCourse = rows[i][3] || currentCourse;
        currentStatus = rows[i][4] || currentStatus;
        currentCategory = rows[i][5] || currentCategory;
        currentAIStatus = rows[i][7] || currentAIStatus;
        break;
      }
    }

    // Update the last message cell and timestamp in Admissions Leads
    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Admissions Leads!A${rowIndex}:H${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, currentName, phone, currentCourse, 'Follow-up', currentCategory, message, currentAIStatus]],
        },
      });
      console.log(`Updated last message for ${currentName} to: "${message}"`);
    }

    return true;
  } catch (error: any) {
    console.error('Error logging counselor manual reply:', error.message);
    throw error;
  }
}
