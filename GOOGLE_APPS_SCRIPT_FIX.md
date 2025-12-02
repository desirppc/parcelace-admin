# Google Apps Script Fix: syncIncomingEmails() - Critical Bug Fix

## Problem
When `syncIncomingEmails()` runs via automated trigger, emails are marked with "ticket-logged" label but NOT saved to Sheets. This causes data loss.

## Root Cause
The label is applied at the end of the loop regardless of whether sheet writes succeeded. If there's an error during sheet operations, the email is still marked as processed.

## Solution
Only apply the label AFTER confirming successful sheet writes. Add comprehensive error handling and logging.

---

## Fixed syncIncomingEmails() Function

Replace your existing `syncIncomingEmails()` function with this improved version:

```javascript
/******************** MAIN SYNC: INCOMING EMAILS (FIXED) ********************/

function syncIncomingEmails() {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const ticketsSh  = ensureTicketsSheet_(ss);
  const messagesSh = ensureMessagesSheet_(ss);
  
  // Initialize logging
  const logEntries = [];
  logEntries.push('🚀 syncIncomingEmails() started at ' + new Date().toISOString());
  
  const threads = fetchSupportThreads_();
  
  if (!threads.length) {
    logEntries.push('ℹ No new threads to process.');
    Logger.log(logEntries.join('\n'));
    return;
  }
  
  logEntries.push('📧 Found ' + threads.length + ' threads to process');
  
  const ticketsMap     = buildThreadToTicketMap_(ticketsSh);
  const processedLabel = GmailApp.createLabel(PROCESSED_LABEL_NAME);
  const negativeList   = getNegativeList_();
  
  let successCount = 0;
  let errorCount = 0;
  const errorDetails = [];
  
  threads.forEach(function (thread, idx) {
    if (idx >= MAX_THREADS_PER_RUN) {
      logEntries.push('⚠ Stopped at thread ' + idx + ' (MAX_THREADS_PER_RUN limit)');
      return;
    }
    
    const threadId = thread.getId();
    let threadProcessed = false;
    let errorMessage = '';
    
    try {
      const msgs     = thread.getMessages();
      if (!msgs || msgs.length === 0) {
        logEntries.push('⚠ Thread ' + threadId + ': No messages found');
        errorCount++;
        return;
      }
      
      const lastMsg  = msgs[msgs.length - 1];
      const subject   = thread.getFirstMessageSubject();
      const rawFrom   = lastMsg.getFrom();
      const fromEmail = extractEmailAddress_(rawFrom).toLowerCase();
      const to        = lastMsg.getTo();
      const date      = lastMsg.getDate();
      
      // Check negative list BEFORE processing
      if (isBlockedSender_(fromEmail, negativeList)) {
        logEntries.push('🚫 Skipping blocked sender: ' + fromEmail + ' (thread ' + threadId + ')');
        // Still mark as processed for blocked senders to avoid reprocessing
        try {
          processedLabel.addToThread(thread);
          logEntries.push('✅ Labeled blocked thread ' + threadId);
        } catch (labelErr) {
          logEntries.push('❌ Failed to label blocked thread ' + threadId + ': ' + labelErr);
        }
        return;
      }
      
      // Get HTML body
      let htmlBody = '';
      try {
        htmlBody = lastMsg.getBody ? (lastMsg.getBody() || '') : '';
      } catch (e) {
        errorMessage = 'Error getting HTML body: ' + e.toString();
        logEntries.push('⚠ Thread ' + threadId + ': ' + errorMessage);
        throw new Error(errorMessage);
      }
      
      const plain   = htmlToPlainText_(htmlBody);
      const snippet = plain ? plain.substring(0, 200) : '';
      
      // Get message ID
      let msgId = '';
      try {
        msgId = lastMsg.getId ? lastMsg.getId() : '';
      } catch (e) {
        errorMessage = 'Error getting message ID: ' + e.toString();
        logEntries.push('⚠ Thread ' + threadId + ': ' + errorMessage);
        throw new Error(errorMessage);
      }
      
      // Store HTML in Drive
      let htmlFileId = '';
      let htmlFileUrl = '';
      if (HTML_EMAIL_FOLDER_ID) {
        try {
          const htmlFolder = DriveApp.getFolderById(HTML_EMAIL_FOLDER_ID);
          const fileName = 'email_' + (threadId || 'thread') + '_' + (msgId || new Date().getTime()) + '.html';
          const file = htmlFolder.createFile(fileName, htmlBody, MimeType.HTML);
          htmlFileId = file.getId();
          htmlFileUrl = file.getUrl();
          logEntries.push('✅ Saved HTML to Drive for thread ' + threadId + ' (file: ' + htmlFileId + ')');
        } catch (e) {
          errorMessage = 'Error saving HTML to Drive: ' + e.toString();
          logEntries.push('⚠ Thread ' + threadId + ': ' + errorMessage);
          // Don't throw - HTML storage failure shouldn't block ticket creation
        }
      }
      
      // Determine if new or existing ticket
      const isNewTicket = !ticketsMap[threadId];
      let ticketId;
      let ticketRow;
      
      // CRITICAL: Write to Tickets sheet FIRST and verify success
      try {
        if (isNewTicket) {
          ticketId  = generateTicketId_();
          ticketRow = appendNewTicketRow_(
            ticketsSh,
            ticketId,
            threadId,
            fromEmail,
            subject,
            'Open',
            snippet,
            rawFrom,
            date
          );
          
          // VERIFY the write succeeded by reading back
          const verifyTicketId = ticketsSh.getRange(ticketRow, getHeaderMap_(ticketsSh)['ticket id']).getValue();
          if (!verifyTicketId || String(verifyTicketId).trim() !== String(ticketId).trim()) {
            throw new Error('Ticket write verification failed: Expected ' + ticketId + ', got ' + verifyTicketId);
          }
          
          ticketsMap[threadId] = { ticketId: ticketId, row: ticketRow };
          logEntries.push('🆕 Created new ticket ' + ticketId + ' for thread ' + threadId + ' (row ' + ticketRow + ')');
        } else {
          ticketId  = ticketsMap[threadId].ticketId;
          ticketRow = ticketsMap[threadId].row;
          updateExistingTicketRow_(ticketsSh, ticketRow, snippet, rawFrom, date);
          
          // VERIFY the update succeeded
          const verifySnippet = ticketsSh.getRange(ticketRow, getHeaderMap_(ticketsSh)['last message snippet']).getValue();
          if (!verifySnippet) {
            // Snippet might be empty, so check updated_at instead
            const verifyUpdated = ticketsSh.getRange(ticketRow, getHeaderMap_(ticketsSh)['updated at']).getValue();
            if (!verifyUpdated) {
              throw new Error('Ticket update verification failed for row ' + ticketRow);
            }
          }
          
          logEntries.push('♻ Updated ticket ' + ticketId + ' for thread ' + threadId + ' (row ' + ticketRow + ')');
        }
      } catch (sheetError) {
        errorMessage = 'CRITICAL: Failed to write ticket to sheet: ' + sheetError.toString();
        logEntries.push('❌ Thread ' + threadId + ': ' + errorMessage);
        errorDetails.push({ threadId: threadId, error: errorMessage });
        errorCount++;
        // DO NOT apply label - ticket was not saved
        return;
      }
      
      // Handle attachments
      let attachmentsMeta = [];
      try {
        attachmentsMeta = handleAttachments_(lastMsg);
        if (attachmentsMeta.length > 0) {
          logEntries.push('📎 Saved ' + attachmentsMeta.length + ' attachments for thread ' + threadId);
        }
      } catch (attError) {
        errorMessage = 'Error handling attachments: ' + attError.toString();
        logEntries.push('⚠ Thread ' + threadId + ': ' + errorMessage);
        // Don't throw - attachment failure shouldn't block message logging
      }
      
      // CRITICAL: Write to Messages sheet and verify success
      try {
        const headerMap = getHeaderMap_(messagesSh);
        const rowIndex  = messagesSh.getLastRow() + 1;
        if (rowIndex === 1) messagesSh.insertRowAfter(1);
        
        function setMsg(colName, value) {
          const c = headerMap[colName.toLowerCase()];
          if (c) messagesSh.getRange(rowIndex, c).setValue(value);
        }
        
        const urls      = attachmentsMeta.map(a => a.url || '').filter(Boolean).join('\n');
        const ids       = attachmentsMeta.map(a => a.id  || '').filter(Boolean).join(',');
        const names     = attachmentsMeta.map(a => a.name || '').filter(Boolean).join('\n');
        const mimeTypes = attachmentsMeta.map(a => a.mimeType || '').filter(Boolean).join('\n');
        
        setMsg('ticket id', ticketId);
        setMsg('thread id', threadId);
        setMsg('gmail message id', msgId);
        setMsg('direction', 'IN');
        setMsg('from', rawFrom);
        setMsg('to', to);
        setMsg('date', date);
        setMsg('body (truncated)', trim_(plain, 3000));
        setMsg('html file id', htmlFileId);
        setMsg('html file url', htmlFileUrl);
        setMsg('attachment urls', urls);
        setMsg('attachment file ids', ids);
        setMsg('attachment names', names);
        setMsg('attachment mime types', mimeTypes);
        
        // VERIFY the message write succeeded
        const verifyMsgTicketId = messagesSh.getRange(rowIndex, headerMap['ticket id']).getValue();
        if (!verifyMsgTicketId || String(verifyMsgTicketId).trim() !== String(ticketId).trim()) {
          throw new Error('Message write verification failed: Expected ' + ticketId + ', got ' + verifyMsgTicketId);
        }
        
        logEntries.push('✅ Saved message for thread ' + threadId + ' (row ' + rowIndex + ')');
      } catch (msgError) {
        errorMessage = 'CRITICAL: Failed to write message to sheet: ' + msgError.toString();
        logEntries.push('❌ Thread ' + threadId + ': ' + errorMessage);
        errorDetails.push({ threadId: threadId, error: errorMessage });
        errorCount++;
        // DO NOT apply label - message was not saved
        // Also, try to rollback ticket if it was new
        if (isNewTicket && ticketRow) {
          try {
            ticketsSh.deleteRow(ticketRow);
            logEntries.push('🔄 Rolled back ticket ' + ticketId + ' due to message write failure');
          } catch (rollbackError) {
            logEntries.push('⚠ Failed to rollback ticket ' + ticketId + ': ' + rollbackError);
          }
        }
        return;
      }
      
      // ONLY apply label AFTER both ticket and message are successfully saved
      try {
        processedLabel.addToThread(thread);
        threadProcessed = true;
        successCount++;
        logEntries.push('✅ Successfully processed and labeled thread ' + threadId + ' (ticket ' + ticketId + ')');
      } catch (labelError) {
        errorMessage = 'Failed to apply label (but data was saved): ' + labelError.toString();
        logEntries.push('⚠ Thread ' + threadId + ': ' + errorMessage);
        // Data is saved, so count as success but log the label error
        successCount++;
        errorDetails.push({ threadId: threadId, error: errorMessage, dataSaved: true });
      }
      
    } catch (unexpectedError) {
      errorMessage = 'Unexpected error processing thread ' + threadId + ': ' + unexpectedError.toString();
      logEntries.push('❌ ' + errorMessage);
      errorDetails.push({ 
        threadId: threadId, 
        error: errorMessage,
        stack: unexpectedError.stack 
      });
      errorCount++;
      // DO NOT apply label - processing failed
    }
  });
  
  // Final summary
  logEntries.push('');
  logEntries.push('📊 SUMMARY:');
  logEntries.push('   ✅ Successfully processed: ' + successCount);
  logEntries.push('   ❌ Errors: ' + errorCount);
  logEntries.push('   📧 Total threads: ' + threads.length);
  
  if (errorDetails.length > 0) {
    logEntries.push('');
    logEntries.push('❌ ERROR DETAILS:');
    errorDetails.forEach(function(detail, idx) {
      logEntries.push('   ' + (idx + 1) + '. Thread ' + detail.threadId + ': ' + detail.error);
      if (detail.stack) {
        logEntries.push('      Stack: ' + detail.stack.substring(0, 200));
      }
    });
  }
  
  logEntries.push('');
  logEntries.push('🏁 syncIncomingEmails() completed at ' + new Date().toISOString());
  
  // Log everything
  const fullLog = logEntries.join('\n');
  Logger.log(fullLog);
  
  // Also send email notification if there were errors (optional)
  if (errorCount > 0 && errorCount >= threads.length * 0.5) {
    // More than 50% failed - send alert
    try {
      MailApp.sendEmail({
        to: Session.getActiveUser().getEmail(),
        subject: '⚠️ Email Sync Errors: ' + errorCount + ' failures',
        body: fullLog
      });
    } catch (emailError) {
      Logger.log('Failed to send error notification email: ' + emailError);
    }
  }
}
```

---

## Key Improvements

1. **Label Only After Success**: Label is applied ONLY after both ticket and message are successfully written and verified
2. **Write Verification**: After each sheet write, we read back the data to confirm it was saved
3. **Rollback on Failure**: If message write fails after ticket was created, we try to delete the ticket row
4. **Comprehensive Logging**: Every step is logged with clear success/error indicators
5. **Error Tracking**: All errors are collected and summarized at the end
6. **Email Alerts**: If >50% of threads fail, sends an email alert
7. **Try-Catch Per Thread**: Each thread is processed in its own try-catch so one failure doesn't stop others

---

## Additional Helper Function (if needed)

If you want even more robust error handling, add this function to check sheet permissions:

```javascript
/******************** PERMISSION CHECK ********************/

function checkSheetPermissions_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.getSheets()[0];
    if (!testSheet) {
      throw new Error('No sheets found in spreadsheet');
    }
    
    // Try to write and read
    const testRange = testSheet.getRange(1, 1);
    const originalValue = testRange.getValue();
    testRange.setValue('PERMISSION_TEST_' + Date.now());
    const writtenValue = testRange.getValue();
    testRange.setValue(originalValue); // Restore
    
    if (!writtenValue || !writtenValue.toString().includes('PERMISSION_TEST')) {
      throw new Error('Sheet write/read verification failed');
    }
    
    Logger.log('✅ Sheet permissions verified');
    return true;
  } catch (e) {
    Logger.log('❌ Sheet permission check failed: ' + e.toString());
    throw new Error('CRITICAL: Cannot write to sheets. Check script permissions.');
  }
}
```

Then call it at the start of `syncIncomingEmails()`:

```javascript
function syncIncomingEmails() {
  // Check permissions first
  checkSheetPermissions_();
  
  // ... rest of function
}
```

---

## Testing Steps

1. **Manual Test**: Run `syncIncomingEmails()` manually from the script editor and check logs
2. **Trigger Test**: Set up a test trigger and monitor execution logs
3. **Verify Data**: Check that all processed threads have corresponding rows in both Tickets and Messages sheets
4. **Check Labels**: Verify that only successfully saved threads have the "ticket-logged" label

---

## Monitoring

After deploying, monitor the execution logs:
1. Go to **Executions** in Apps Script
2. Check each run for the summary log
3. Look for any "CRITICAL" errors
4. Verify success count matches labeled emails

---

## Rollback Plan

If you need to reprocess emails that were incorrectly labeled:
1. Remove the "ticket-logged" label from those threads
2. They will be picked up in the next sync run
3. The script will update existing tickets instead of creating duplicates

