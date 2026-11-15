/**
 * BreakMath waitlist backend (Google Apps Script).
 *
 * Lives inside a Google Sheet. Every signup from the website is added as a row
 * (time, email, where they came from) and gets one short thank-you email sent
 * from the Google account that owns the sheet.
 *
 * Setup steps are in backend/README.md.
 */

const SHEET_NAME = 'Signups';
const SITE_NAME = 'BreakMath';
// Gmail allows about 100 emails a day on a free account. Stop a little short
// so a flood of fake signups cannot use the whole allowance.
const MAX_THANK_YOU_EMAILS_PER_DAY = 80;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    const email = String(data.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) return respond({ ok: false, error: 'invalid_email' });

    const sheet = getSheet();
    if (!alreadySignedUp(sheet, email)) {
      const source = String(data.source || 'direct').replace(/[^\w.\-]/g, '').slice(0, 60) || 'direct';
      sheet.appendRow([new Date(), email, source]);
      sendThankYou(email);
    }
    return respond({ ok: true });
  } catch (err) {
    console.error(err);
    return respond({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app address in a browser shows this, so you can tell it is live.
function doGet() {
  return respond({ ok: true, service: SITE_NAME + ' waitlist' });
}

function isValidEmail(email) {
  // The first-character check also stops a value being read as a spreadsheet formula.
  return email.length <= 254 && /^[a-z0-9][^\s@]*@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(['Signed up', 'Email', 'Source', '', 'Total signups', '=COUNTA(B2:B)']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function alreadySignedUp(sheet, email) {
  const rows = sheet.getLastRow() - 1;
  if (rows < 1) return false;
  const emails = sheet.getRange(2, 2, rows, 1).getValues();
  return emails.some(function (row) { return row[0] === email; });
}

function sendThankYou(email) {
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd');
  const sentToday = props.getProperty('sentDate') === today ? Number(props.getProperty('sentCount')) : 0;
  if (sentToday >= MAX_THANK_YOU_EMAILS_PER_DAY) return;

  MailApp.sendEmail({
    to: email,
    name: SITE_NAME,
    subject: "You're on the BreakMath waitlist",
    body: [
      'Thanks for joining the BreakMath waitlist.',
      '',
      "BreakMath isn't open yet. You'll get an email from this address when it is, and waitlist members get in first.",
      '',
      'One question, if you have a minute: how do you price your spots today? Just hit reply. Every answer gets read.',
      '',
      'BreakMath',
      '',
      "Didn't sign up, or want off the list? Reply with \"unsubscribe\" and you'll be removed.",
    ].join('\n'),
  });
  props.setProperties({ sentDate: today, sentCount: String(sentToday + 1) });
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
