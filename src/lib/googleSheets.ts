import { google } from 'googleapis';

export function normalizePhone(phone: string): string {
  return String(phone).replace(/\D/g, '');
}

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
        aiEnabled: row[7] !== undefined && String(row[7]).toLowerCase() === 'false' ? false : true,
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
  lastMessage: string,
  forceAIEnabled?: boolean
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
    const timestamp = new Date().toISOString();
    let rowIndex = -1;
    let existingAIStatus = 'true'; // Default to true

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      if (normalizePhone(rows[i][2]) === normalizePhone(phone)) {
        rowIndex = i + 1; // 1-indexed for sheets
        existingAIStatus = rows[i][7] !== undefined ? rows[i][7] : 'true';
        break;
      }
    }

    const finalAIStatus = forceAIEnabled !== undefined ? String(forceAIEnabled) : existingAIStatus;

    if (rowIndex !== -1) {
      // Update existing lead row (keep the existing AI toggle status or override it)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:H${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timestamp, name, phone, course, status, category, lastMessage, finalAIStatus]],
        },
      });
      console.log(`Updated lead for ${name} at row ${rowIndex} (AI Status: ${finalAIStatus})`);
    } else {
      // Append new lead with default or forced AI Auto Reply status
      await appendToSheet(sheetName, [[timestamp, name, phone, course, status, category, lastMessage, finalAIStatus]]);
      console.log(`Added new lead for ${name} (AI Status: ${finalAIStatus})`);
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
      if (normalizePhone(rows[i][2]) === normalizePhone(phone)) {
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

let chatLogChecked = false;

async function ensureChatLogSheetExists(sheets: any, spreadsheetId: string) {
  if (chatLogChecked) return;
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = meta.data.sheets.some((s: any) => s.properties.title === 'Chat Log');
    
    if (!sheetExists) {
      console.log('Chat Log sheet does not exist. Creating it...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Chat Log',
                },
              },
            },
          ],
        },
      });
      
      // Add headers
      const headers = [
        ['Timestamp', 'Phone', 'Name', 'Sender', 'Message Text', 'Buttons', 'Category', 'Course']
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Chat Log!A1:H1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: headers,
        },
      });
      console.log('Chat Log sheet created successfully with headers!');
    }
    chatLogChecked = true;
  } catch (err: any) {
    console.error('Failed to ensure Chat Log sheet exists:', err.message);
  }
}

export async function logChatMessage(
  phone: string,
  name: string,
  sender: 'user' | 'bot',
  text: string,
  buttons: string[] = [],
  category: string = 'Course Queries',
  course: string = 'Undecided'
) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    await ensureChatLogSheetExists(sheets, spreadsheetId!);
    
    const timestamp = new Date().toISOString(); // standard UTC ISO format
    const buttonsStr = buttons.join(', ');
    
    const row = [timestamp, phone, name, sender, text, buttonsStr, category, course];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Chat Log!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    console.log(`Successfully logged message from ${sender} to Chat Log`);
  } catch (error: any) {
    console.error('Error logging to Chat Log:', error.message);
  }
}

export async function getConversationHistory(phone: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Ensure the sheet exists before reading
    await ensureChatLogSheetExists(sheets, spreadsheetId!);
    
    // Read from Chat Log
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Chat Log!A:H',
    });
    
    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // Fallback to the old multi-sheet slow logic if unified log is empty
      return await getConversationHistoryFallback(phone);
    }
    
    const messages = [];
    const normalizedTarget = normalizePhone(phone);
    
    // Rows: Timestamp (0), Phone (1), Name (2), Sender (3), Message Text (4), Buttons (5), Category (6), Course (7)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[1] || normalizePhone(row[1]) !== normalizedTarget) continue;
      
      const ts = row[0] || '';
      const sender = row[3] || 'user';
      const text = row[4] || '';
      const buttonsStr = row[5] || '';
      
      let buttons: string[] = [];
      if (buttonsStr) {
        buttons = buttonsStr.split(',').map((b: string) => b.trim()).filter(Boolean);
      }
      
      messages.push({
        id: `chatlog-${i}-${new Date(ts).getTime() || i}`,
        text,
        buttons: buttons.length > 0 ? buttons : undefined,
        time: ts, // Return raw ISO string to be parsed on client
        sender: sender === 'user' ? 'user' : 'bot',
        read: true,
        timestamp: new Date(ts).getTime() || i
      });
    }
    
    // Sort chronologically by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Clean up temporary sorting properties before returning
    return messages.map(({ id, text, buttons, time, sender, read }) => ({
      id,
      text,
      buttons,
      time,
      sender,
      read: read || false
    }));
  } catch (error: any) {
    console.error('Error fetching conversation history from Chat Log, falling back:', error.message);
    return await getConversationHistoryFallback(phone);
  }
}

export async function getConversationHistoryFallback(phone: string) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const messages: any[] = [];

    const parseTimestamp = (tsStr: string) => {
      try {
        const d = new Date(tsStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      } catch {
        return 0;
      }
    };

    // 1. Read Course Queries
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Course Queries!A:E',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || normalizePhone(row[1]) !== normalizePhone(phone)) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        if (row[3]) {
          messages.push({
            id: `cq-${idx}-user-${timeVal}`,
            text: row[3],
            time: ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        if (row[4]) {
          let botText = row[4];
          let buttons: string[] = [];
          const buttonMatch = botText.match(/\[Buttons:\s*(.*?)\]/);
          if (buttonMatch) {
            buttons = buttonMatch[1].split(',').map((b: string) => b.trim()).filter(Boolean);
            botText = botText.replace(/\[Buttons:\s*(.*?)\]/, '').trim();
          }

          messages.push({
            id: `cq-${idx}-bot-${timeVal}`,
            text: botText,
            buttons: buttons.length > 0 ? buttons : undefined,
            time: ts,
            timestamp: timeVal + 1,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Course Queries:', e.message);
    }

    // 2. Read Placement Queries
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Placement Queries!A:D',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || normalizePhone(row[1]) !== normalizePhone(phone)) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        if (row[2]) {
          messages.push({
            id: `pq-${idx}-user-${timeVal}`,
            text: row[2],
            time: ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        if (row[3]) {
          let botText = row[3];
          let buttons: string[] = [];
          const buttonMatch = botText.match(/\[Buttons:\s*(.*?)\]/);
          if (buttonMatch) {
            buttons = buttonMatch[1].split(',').map((b: string) => b.trim()).filter(Boolean);
            botText = botText.replace(/\[Buttons:\s*(.*?)\]/, '').trim();
          }

          messages.push({
            id: `pq-${idx}-bot-${timeVal}`,
            text: botText,
            buttons: buttons.length > 0 ? buttons : undefined,
            time: ts,
            timestamp: timeVal + 1,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Placement Queries:', e.message);
    }

    // 3. Read Scholarship Queries
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Scholarship Queries!A:D',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || normalizePhone(row[1]) !== normalizePhone(phone)) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        if (row[2]) {
          messages.push({
            id: `sq-${idx}-user-${timeVal}`,
            text: row[2],
            time: ts,
            timestamp: timeVal,
            sender: 'user',
          });
        }
        if (row[3]) {
          let botText = row[3];
          let buttons: string[] = [];
          const buttonMatch = botText.match(/\[Buttons:\s*(.*?)\]/);
          if (buttonMatch) {
            buttons = buttonMatch[1].split(',').map((b: string) => b.trim()).filter(Boolean);
            botText = botText.replace(/\[Buttons:\s*(.*?)\]/, '').trim();
          }

          messages.push({
            id: `sq-${idx}-bot-${timeVal}`,
            text: botText,
            buttons: buttons.length > 0 ? buttons : undefined,
            time: ts,
            timestamp: timeVal + 1,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Scholarship Queries:', e.message);
    }

    // 4. Read Human Followups
    try {
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Human Followups!A:E',
      });
      const rows = resp.data.values || [];
      rows.forEach((row, idx) => {
        if (idx === 0 || normalizePhone(row[2]) !== normalizePhone(phone)) return;
        const ts = row[0] || '';
        const timeVal = parseTimestamp(ts);
        const notes = row[3] || '';
        const action = row[4] || '';

        if (notes.startsWith('Student Message:')) {
          messages.push({
            id: `hf-${idx}-user-${timeVal}`,
            text: notes.replace('Student Message:', '').trim(),
            time: ts,
            timestamp: timeVal,
            sender: 'user',
          });
        } else if (notes === 'Counselor Reply') {
          let botText = action || '';
          let buttons: string[] = [];
          const buttonMatch = botText.match(/\[Buttons:\s*(.*?)\]/);
          if (buttonMatch) {
            buttons = buttonMatch[1].split(',').map((b: string) => b.trim()).filter(Boolean);
            botText = botText.replace(/\[Buttons:\s*(.*?)\]/, '').trim();
          }

          messages.push({
            id: `hf-${idx}-counselor-${timeVal}`,
            text: botText,
            buttons: buttons.length > 0 ? buttons : undefined,
            time: ts,
            timestamp: timeVal,
            sender: 'bot',
            read: true,
          });
        }
      });
    } catch (e: any) {
      console.warn('Could not read Human Followups:', e.message);
    }

    messages.sort((a, b) => a.timestamp - b.timestamp);

    return messages.map(({ id, text, buttons, time, sender, read }) => ({
      id,
      text,
      buttons,
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
    const timestamp = new Date().toISOString(); // Save standard ISO UTC string

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
    let currentAIStatus = 'false';

    for (let i = 1; i < rows.length; i++) {
      if (normalizePhone(rows[i][2]) === normalizePhone(phone)) {
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

    // 3. Log to unified Chat Log
    await logChatMessage(phone, currentName, 'bot', message, [], currentCategory, currentCourse);

    return true;
  } catch (error: any) {
    console.error('Error logging counselor manual reply:', error.message);
    throw error;
  }
}
