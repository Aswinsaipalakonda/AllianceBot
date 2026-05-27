/**
 * Alliance College Admissions CRM - Google Form Submission Trigger Script
 * 
 * INSTRUCTIONS:
 * 1. Open your "Alliance College - Admission Application Form (Responses)" spreadsheet in Google Sheets.
 * 2. In the top menu, go to Extensions -> Apps Script.
 * 3. Delete any default code in the editor, and paste this entire script.
 * 4. Replace "YOUR_BOT_DOMAIN_URL" on line 20 with your actual deployed Vercel domain (e.g., https://alliance-bot.vercel.app).
 * 5. Save the project (click the floppy disk icon).
 * 6. Set up the trigger:
 *    - Click the clock icon (Triggers) on the left sidebar.
 *    - Click "+ Add Trigger" in the bottom-right corner.
 *    - Select:
 *      - Choose which function to run: "onFormSubmitTrigger"
 *      - Choose which deployment should run: "Head"
 *      - Select event source: "From spreadsheet"
 *      - Select event type: "On form submit"
 *    - Click "Save" and authorize any permissions if prompted.
 */

// Replace this with your actual deployed Vercel domain (e.g. https://alliance-bot.vercel.app)
const VERCEL_DOMAIN = "YOUR_BOT_DOMAIN_URL";

function onFormSubmitTrigger(e) {
  try {
    Logger.log("Trigger fired! Processing form submission...");
    
    let name = "";
    let phone = "";
    let course = "";
    
    // Attempt 1: Parse from the Event object directly if available
    if (e && e.values) {
      Logger.log("Found event values: " + JSON.stringify(e.values));
      // Based on Form columns: Full Name is Column B (index 1), Phone Number is Column C (index 2), Interest Course is Column G (index 6)
      name = e.values[1] || "";
      phone = e.values[2] || "";
      course = e.values[6] || "";
    }
    
    // Attempt 2 (Fallback / Robust matching): Read from the sheet's last row directly and match by header names
    if (!phone || !name) {
      Logger.log("Falling back to reading directly from spreadsheet row...");
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const lastRowValues = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        Logger.log("Headers detected: " + JSON.stringify(headers));
        Logger.log("Last row values: " + JSON.stringify(lastRowValues));
        
        for (let i = 0; i < headers.length; i++) {
          const header = String(headers[i]).toLowerCase().trim();
          if (header.includes("name") && !header.includes("parent")) {
            name = lastRowValues[i];
          } else if (header.includes("phone") || header.includes("mobile") || header.includes("contact")) {
            if (!header.includes("parent")) {
              phone = lastRowValues[i];
            }
          } else if (header.includes("course") || header.includes("interest")) {
            course = lastRowValues[i];
          }
        }
      }
    }
    
    // Clean and validate variables
    name = String(name || "").trim();
    phone = String(phone || "").trim();
    course = String(course || "").trim();
    
    Logger.log("Extracted Student: Name=" + name + ", Phone=" + phone + ", Course=" + course);
    
    if (!phone) {
      Logger.log("No student phone number detected. Skipping sync POST.");
      return;
    }
    
    // Call our Vercel API endpoint
    const url = VERCEL_DOMAIN.replace(/\/$/, "") + "/api/webhook/form";
    const payload = {
      name: name,
      phone: phone,
      course: course
    };
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log("Sending POST to: " + url + " with payload: " + JSON.stringify(payload));
    const response = UrlFetchApp.fetch(url, options);
    const respCode = response.getResponseCode();
    const respText = response.getContentText();
    
    Logger.log("API Response Code: " + respCode);
    Logger.log("API Response Body: " + respText);
    
  } catch (err) {
    Logger.log("Error in form submission sync: " + err.message + "\nStack: " + err.stack);
  }
}
