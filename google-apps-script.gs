const CONFIG = {
  spreadsheetId: '1yY7xOyEGyL7l5spXVjGv2hOnJQxZo1IhtEZElZEKNuc',
  sheetName: 'Leads'
};

const HEADERS = [
  'Timestamp',
  'Name',
  'Phone',
  'Email',
  'Website',
  'Requirement',
  'Source',
  'Page URL'
];

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const sheet = getLeadSheet_();
    const data = (e && e.parameter) || {};

    sheet.appendRow([
      new Date(),
      safeCell_(data.name),
      safeCell_(data.phone),
      safeCell_(data.email),
      safeCell_(data.website),
      safeCell_(data.requirement),
      safeCell_(data.source || 'Digital India Grow Website'),
      safeCell_(data.page_url)
    ]);

    return jsonResponse_({ ok: true, message: 'Lead saved successfully.' });
  } catch (error) {
    return jsonResponse_({ ok: false, message: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ ok: true, service: 'Digital India Grow lead endpoint' });
}

function getLeadSheet_() {
  if (!CONFIG.spreadsheetId || CONFIG.spreadsheetId.indexOf('PASTE_') === 0) {
    throw new Error('Add your Google Sheet ID in CONFIG.spreadsheetId.');
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);

  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#5c20e7')
      .setFontColor('#ffffff');
  }

  return sheet;
}

function safeCell_(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/*
SETUP
1. Create a Google Sheet and copy its ID from the Sheet URL.
2. Paste the ID in CONFIG.spreadsheetId above.
3. Open extensions.google.com/apps-script and paste this file.
4. Deploy > New deployment > Web app.
5. Execute as: Me. Who has access: Anyone.
6. Copy the deployment URL.
7. Paste it into index.html:
   <form id="leadForm" data-sheet-endpoint="YOUR_DEPLOYMENT_URL" ...>
*/
