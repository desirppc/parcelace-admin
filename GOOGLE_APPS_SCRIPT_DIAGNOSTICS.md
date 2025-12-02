# Google Apps Script Diagnostics & Recovery Tools

## Diagnostic Function

Run this to identify the issue:

```javascript
/******************** DIAGNOSTIC: Find Mislabeled Emails ********************/

function diagnoseEmailSyncIssues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ticketsSh = ensureTicketsSheet_(ss);
  const messagesSh = ensureMessagesSheet_(ss);
  
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL_NAME);
  const supportLabel = GmailApp.getUserLabelByName(SUPPORT_LABEL_NAME);
  
  if (!processedLabel) {
    Logger.log('❌ Processed label not found');
    return;
  }
  
  // Get all threads with processed label
  const processedThreads = GmailApp.search('label:' + PROCESSED_LABEL_NAME, 0, 100);
  Logger.log('📧 Found ' + processedThreads.length + ' threads with processed label');
  
  // Build map of thread IDs in sheets
  const ticketsMap = buildThreadToTicketMap_(ticketsSh);
  const messagesMap = {};
  
  const mLastRow = messagesSh.getLastRow();
  if (mLastRow >= 2) {
    const mHeaderMap = getHeaderMap_(messagesSh);
    const thCol = mHeaderMap['thread id'];
    if (thCol) {
      const mData = messagesSh.getRange(2, 1, mLastRow - 1, messagesSh.getLastColumn()).getValues();
      mData.forEach(function(row) {
        const threadId = String(row[thCol - 1] || '').trim();
        if (threadId) {
          messagesMap[threadId] = true;
        }
      });
    }
  }
  
  Logger.log('📊 Tickets in sheet: ' + Object.keys(ticketsMap).length);
  Logger.log('📊 Messages in sheet: ' + Object.keys(messagesMap).length);
  
  // Find mislabeled threads
  const mislabeled = [];
  processedThreads.forEach(function(thread) {
    const threadId = thread.getId();
    const hasTicket = !!ticketsMap[threadId];
    const hasMessage = !!messagesMap[threadId];
    
    if (!hasTicket || !hasMessage) {
      mislabeled.push({
        threadId: threadId,
        subject: thread.getFirstMessageSubject(),
        hasTicket: hasTicket,
        hasMessage: hasMessage,
        thread: thread
      });
    }
  });
  
  Logger.log('');
  Logger.log('❌ MISLABELED THREADS (labeled but not in sheets): ' + mislabeled.length);
  
  mislabeled.forEach(function(item, idx) {
    Logger.log('');
    Logger.log('  ' + (idx + 1) + '. Thread: ' + item.threadId);
    Logger.log('     Subject: ' + item.subject);
    Logger.log('     Has Ticket: ' + item.hasTicket);
    Logger.log('     Has Message: ' + item.hasMessage);
  });
  
  // Summary
  Logger.log('');
  Logger.log('📊 SUMMARY:');
  Logger.log('   Total labeled threads: ' + processedThreads.length);
  Logger.log('   Threads with tickets: ' + Object.keys(ticketsMap).length);
  Logger.log('   Threads with messages: ' + Object.keys(messagesMap).length);
  Logger.log('   Mislabeled (missing data): ' + mislabeled.length);
  
  return {
    totalLabeled: processedThreads.length,
    ticketsInSheet: Object.keys(ticketsMap).length,
    messagesInSheet: Object.keys(messagesMap).length,
    mislabeled: mislabeled.length,
    details: mislabeled
  };
}
```

---

## Recovery Function

Use this to fix mislabeled emails by removing the label so they can be reprocessed:

```javascript
/******************** RECOVERY: Remove Label from Mislabeled Emails ********************/

function recoverMislabeledEmails() {
  const result = diagnoseEmailSyncIssues();
  
  if (!result || result.mislabeled === 0) {
    Logger.log('✅ No mislabeled emails found. Nothing to recover.');
    return;
  }
  
  Logger.log('🔄 Starting recovery for ' + result.mislabeled + ' mislabeled threads...');
  
  const processedLabel = GmailApp.getUserLabelByName(PROCESSED_LABEL_NAME);
  if (!processedLabel) {
    Logger.log('❌ Processed label not found');
    return;
  }
  
  let recovered = 0;
  let errors = 0;
  
  result.details.forEach(function(item, idx) {
    try {
      processedLabel.removeFromThread(item.thread);
      recovered++;
      Logger.log('✅ Removed label from thread ' + item.threadId + ' (' + (idx + 1) + '/' + result.mislabeled + ')');
    } catch (e) {
      errors++;
      Logger.log('❌ Failed to remove label from thread ' + item.threadId + ': ' + e.toString());
    }
  });
  
  Logger.log('');
  Logger.log('📊 RECOVERY SUMMARY:');
  Logger.log('   ✅ Recovered: ' + recovered);
  Logger.log('   ❌ Errors: ' + errors);
  Logger.log('');
  Logger.log('💡 These threads will be picked up in the next syncIncomingEmails() run');
  
  return {
    recovered: recovered,
    errors: errors
  };
}
```

---

## Test Function for Sheet Permissions

Run this to verify the script can write to sheets:

```javascript
/******************** TEST: Sheet Write Permissions ********************/

function testSheetWritePermissions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const testResults = [];
  
  try {
    // Test Tickets sheet
    const ticketsSh = ensureTicketsSheet_(ss);
    const tHeaderMap = getHeaderMap_(ticketsSh);
    const testRow = ticketsSh.getLastRow() + 1;
    
    // Try writing a test value
    const testCol = tHeaderMap['ticket id'] || 1;
    const originalValue = ticketsSh.getRange(testRow, testCol).getValue();
    const testValue = 'TEST_' + Date.now();
    
    ticketsSh.getRange(testRow, testCol).setValue(testValue);
    SpreadsheetApp.flush(); // Force write
    
    // Verify
    const writtenValue = ticketsSh.getRange(testRow, testCol).getValue();
    ticketsSh.getRange(testRow, testCol).setValue(originalValue); // Restore
    
    if (String(writtenValue) === String(testValue)) {
      testResults.push({ sheet: 'Tickets', status: '✅ PASS', message: 'Write/read verified' });
    } else {
      testResults.push({ 
        sheet: 'Tickets', 
        status: '❌ FAIL', 
        message: 'Write verification failed. Expected: ' + testValue + ', Got: ' + writtenValue 
      });
    }
  } catch (e) {
    testResults.push({ sheet: 'Tickets', status: '❌ ERROR', message: e.toString() });
  }
  
  try {
    // Test Messages sheet
    const messagesSh = ensureMessagesSheet_(ss);
    const mHeaderMap = getHeaderMap_(messagesSh);
    const testRow = messagesSh.getLastRow() + 1;
    
    const testCol = mHeaderMap['ticket id'] || 1;
    const originalValue = messagesSh.getRange(testRow, testCol).getValue();
    const testValue = 'TEST_' + Date.now();
    
    messagesSh.getRange(testRow, testCol).setValue(testValue);
    SpreadsheetApp.flush(); // Force write
    
    const writtenValue = messagesSh.getRange(testRow, testCol).getValue();
    messagesSh.getRange(testRow, testCol).setValue(originalValue); // Restore
    
    if (String(writtenValue) === String(testValue)) {
      testResults.push({ sheet: 'Messages', status: '✅ PASS', message: 'Write/read verified' });
    } else {
      testResults.push({ 
        sheet: 'Messages', 
        status: '❌ FAIL', 
        message: 'Write verification failed. Expected: ' + testValue + ', Got: ' + writtenValue 
      });
    }
  } catch (e) {
    testResults.push({ sheet: 'Messages', status: '❌ ERROR', message: e.toString() });
  }
  
  // Log results
  Logger.log('📋 SHEET PERMISSION TEST RESULTS:');
  testResults.forEach(function(result) {
    Logger.log('   ' + result.sheet + ' Sheet: ' + result.status);
    Logger.log('      ' + result.message);
  });
  
  const allPassed = testResults.every(r => r.status === '✅ PASS');
  if (allPassed) {
    Logger.log('');
    Logger.log('✅ All permission tests passed!');
  } else {
    Logger.log('');
    Logger.log('❌ Some permission tests failed. Check script permissions in Apps Script settings.');
  }
  
  return testResults;
}
```

---

## Enhanced Error Logging Function

Add this to track errors over time:

```javascript
/******************** ERROR LOG SHEET ********************/

function ensureErrorLogSheet_(ss) {
  const ERROR_LOG_SHEET = 'ErrorLog';
  let sh = ss.getSheetByName(ERROR_LOG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(ERROR_LOG_SHEET);
    sh.getRange(1, 1, 1, 6).setValues([[
      'Timestamp',
      'Thread ID',
      'Ticket ID',
      'Error Type',
      'Error Message',
      'Stack Trace'
    ]]);
    sh.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  return sh;
}

function logError_(threadId, ticketId, errorType, errorMessage, stackTrace) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const errorSh = ensureErrorLogSheet_(ss);
    const row = errorSh.getLastRow() + 1;
    
    errorSh.getRange(row, 1, 1, 6).setValues([[
      new Date(),
      threadId || '',
      ticketId || '',
      errorType || 'Unknown',
      errorMessage || '',
      stackTrace ? stackTrace.substring(0, 500) : ''
    ]]);
  } catch (e) {
    Logger.log('Failed to log error to sheet: ' + e.toString());
  }
}
```

Then in your fixed `syncIncomingEmails()`, call `logError_()` whenever an error occurs:

```javascript
catch (sheetError) {
  logError_(
    threadId,
    ticketId || '',
    'Sheet Write Error',
    sheetError.toString(),
    sheetError.stack
  );
  // ... rest of error handling
}
```

---

## Usage Instructions

1. **Run Diagnostics First**:
   ```
   diagnoseEmailSyncIssues()
   ```
   This will show you how many emails are mislabeled.

2. **Test Permissions**:
   ```
   testSheetWritePermissions()
   ```
   Verify the script can write to sheets.

3. **Recover Mislabeled Emails** (if needed):
   ```
   recoverMislabeledEmails()
   ```
   This removes the label from emails that weren't saved, so they'll be reprocessed.

4. **Deploy Fixed Function**:
   Copy the fixed `syncIncomingEmails()` from `GOOGLE_APPS_SCRIPT_FIX.md` into your script.

5. **Monitor**:
   Check the ErrorLog sheet (if you added error logging) and execution logs after each run.

---

## Common Issues & Solutions

### Issue: "Script does not have permission"
**Solution**: 
- Go to Apps Script → Project Settings → OAuth consent screen
- Ensure the script has access to Gmail, Drive, and Sheets
- Re-authorize the script

### Issue: "Execution time exceeded"
**Solution**:
- Reduce `MAX_THREADS_PER_RUN` to a smaller number (e.g., 30)
- Process in batches

### Issue: "Sheet is read-only"
**Solution**:
- Check that the script is running as the correct user
- Verify the spreadsheet sharing settings
- Ensure the script has edit access

### Issue: "Label not found"
**Solution**:
- Create the label manually in Gmail first
- Or modify the script to create it if it doesn't exist

