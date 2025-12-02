import API_CONFIG from '@/config/api';
import { apiRequest, getApiUrl, getAuthHeaders } from '@/config/api';
import {
  EmailThreadsResponse,
  EmailThreadDetailsResponse,
  EmailFilters,
  SendEmailRequest,
  SendEmailResponse,
  UpdateThreadStatusRequest,
  AddInternalNoteRequest,
  CannedResponsesResponse,
  CannedResponse,
  EmailThread,
  EmailResponse,
  EmailAttachment
} from '@/types/emailResponse';
import SmartCache, { CacheStrategies } from '@/utils/smartCache';

// Email Response Service - Uses Google Apps Script for ticket listing
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWTdOSCuNksS4JRwxs2bDrYs7Azq-2UWlX2Ik58U4EoXtfDue-TUVaNzLCBg6aNvjNTQ/exec';
const GOOGLE_APPS_SCRIPT_TOKEN = 'abc_hssas_1212_jsha@1@23_sanbhx22';

/**
 * Parse date string - timestamps are already in IST, no conversion needed
 */
const parseDateString = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  // If it's already ISO format, return as is
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return dateStr;
  }
  // Parse "2/12/2025 11:45:26" format and convert to ISO
  try {
    const parts = dateStr.split(' ');
    const datePart = parts[0].split('/');
    const timePart = parts[1] ? parts[1].split(':') : ['0', '0', '0'];
    const date = new Date(
      parseInt(datePart[2]), // year
      parseInt(datePart[1]) - 1, // month (0-indexed)
      parseInt(datePart[0]), // day
      parseInt(timePart[0]), // hour
      parseInt(timePart[1]), // minute
      parseInt(timePart[2] || '0') // second
    );
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

type AttachmentLike = Partial<EmailAttachment> & {
  name?: string;
  url?: string;
  mimeType?: string;
  contentId?: string;
};

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>'
};

const decodeHtmlEntities = (value: string): string => {
  if (!value) return '';
  let decoded = value.replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, (match) => {
    const key = match.toLowerCase();
    return HTML_ENTITY_MAP[key] ?? match;
  });

  decoded = decoded
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    });

  return decoded;
};

const CLEANUP_PATTERNS: RegExp[] = [
  /v\\:\* \{[^}]+\}/gi,
  /o\\:\* \{[^}]+\}/gi,
  /w\\:\* \{[^}]+\}/gi,
  /\.shape \{[^}]+\}/gi,
  /behavior:url\([^)]+\);?/gi,
  /mso-[^:]+:[^;]+;?/gi,
  /Description automatically generated/gi,
  /A picture containing[^.]+generated\./gi,
  /\s+/g
];

const cleanSnippetText = (value: string): string => {
  if (!value) return '';
  let cleaned = decodeHtmlEntities(value)
    .replace(/(&nbsp;|&#160;)/gi, ' ')
    .replace(/\s*\u00a0\s*/g, ' ');

  CLEANUP_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, ' ');
  });

  return cleaned.replace(/\s{2,}/g, ' ').trim();
};

const EMAIL_VIEWER_BASE_STYLE = `<style data-email-viewer-style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; line-height: 1.6; color: #111827; padding: 0; margin: 0; background: #fff; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; border-collapse: collapse; border-spacing: 0; }
  table td, table th { border: 1px solid rgba(0,0,0,0.08); padding: 0.5rem; vertical-align: top; }
  a { color: #2563eb; word-break: break-word; }
  pre { white-space: pre-wrap; }
</style>`;

const normalizeValue = (value: string): string =>
  value.replace(/^<|>$/g, '').trim().toLowerCase();

const resolveCidToAttachmentUrl = (
  cid: string,
  attachments?: AttachmentLike[]
): string | null => {
  if (!cid || !attachments || attachments.length === 0) return null;
  const normalizedCid = normalizeValue(cid).split('@')[0];
  if (!normalizedCid) return null;

  for (const attachment of attachments) {
    const rawName =
      attachment.filename || attachment.name || attachment.file_path || '';
    const normalizedName = normalizeValue(rawName);
    if (!normalizedName) continue;
    const simplifiedName = normalizedName.replace(/[^a-z0-9]/gi, '');
    const simplifiedCid = normalizedCid.replace(/[^a-z0-9]/gi, '');

    if (
      normalizedCid === normalizedName ||
      simplifiedCid === simplifiedName ||
      normalizedCid.includes(simplifiedName) ||
      simplifiedName.includes(simplifiedCid)
    ) {
      const url = attachment.file_path || attachment.url;
      if (url) return url;
    }
  }

  return null;
};

const sanitizeHtmlContent = (
  html: string,
  attachments?: AttachmentLike[]
): string => {
  if (!html) return '';
  let sanitized = html;

  sanitized = sanitized
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
    .replace(/<style[^>]*mso-[\s\S]*?<\/style>/gi, '')
    .replace(/<(?:o|w|v):[^>]+>/gi, '')
    .replace(/<\/(?:o|w|v):[^>]+>/gi, '')
    .replace(/\s?xmlns(:\w+)?="[^"]*microsoft[^"]*"/gi, '')
    .replace(/<img[^>]+alt="[^"]*Description automatically generated[^"]*"[^>]*>/gi, '');

  sanitized = sanitized.replace(
    /(<img[^>]+src=["'])cid:([^"']+)(["'][^>]*>)/gi,
    (_, prefix: string, cid: string, suffix: string) => {
      const resolved = resolveCidToAttachmentUrl(cid, attachments);
      if (!resolved) {
        return '';
      }
      const cleanedSuffix = suffix.replace(/\s?(data|aria)-[^=]+="[^"]*"/gi, '');
      return `${prefix}${resolved}${cleanedSuffix}`;
    }
  );

  sanitized = sanitized.replace(/\sstyle="[^"]*"/gi, (match) => {
    const inlineStyle = match
      .replace(/mso-[^:]+:[^;"]+;?/gi, '')
      .replace(/behavior:[^;"]+;?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return inlineStyle && inlineStyle !== 'style=""' ? ` ${inlineStyle}` : '';
  });

  sanitized = sanitized.replace(/(&nbsp;|&#160;)/gi, ' ');

  const wrapWithContainer = (markup: string): string => {
    if (/<body[^>]*>/i.test(markup)) {
      return markup
        .replace(/<body([^>]*)>/i, `<div$1>`)
        .replace(/<\/body>/gi, '</div>');
    }
    return `<div class="email-html">${markup}</div>`;
  };

  let hydrated = wrapWithContainer(sanitized);

  if (!/data-email-viewer-style/.test(hydrated)) {
    hydrated = `${EMAIL_VIEWER_BASE_STYLE}${hydrated}`;
  }

  return hydrated;
};

const htmlToCleanPlainText = (html: string): string => {
  if (!html) return '';
  let text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  text = cleanSnippetText(text);
  return text;
};

/**
 * Transform backend API response to EmailThread format
 */
const transformEmailThreadsResponse = (rawData: any[]): EmailThread[] => {
  return rawData.map((item, index) => {
    // Extract name and email from "Last Message From" field
    // Format: "Name <email@example.com>" or just "email@example.com"
    let fromName = '';
    let fromEmail = item['Customer Email'] || '';
    
    if (item['Last Message From']) {
      const fromMatch = item['Last Message From'].match(/^(.+?)\s*<(.+?)>$/);
      if (fromMatch) {
        fromName = fromMatch[1].trim();
        fromEmail = fromMatch[2].trim();
      } else {
        fromEmail = item['Last Message From'].trim();
      }
    }

    // Convert status to lowercase for consistency and map common variations
    const statusRaw = (item['Status'] || 'open').toLowerCase().trim();
    let status: 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered' = 'open';
    
    // Map status values
    if (statusRaw === 'open' || statusRaw === 'new' || statusRaw === 'active') {
      status = 'open';
    } else if (statusRaw === 'closed' || statusRaw === 'close') {
      status = 'closed';
    } else if (statusRaw === 'pending' || statusRaw === 'in progress' || statusRaw === 'in-progress') {
      status = 'pending';
    } else if (statusRaw === 'resolved' || statusRaw === 'resolve' || statusRaw === 'completed' || statusRaw === 'answered') {
      // Map both 'resolved' and 'answered' to 'answered' for consistency
      status = 'answered';
    } else if (statusRaw === 'spam') {
      status = 'spam';
    } else {
      // Default to open for unknown statuses
      status = 'open';
    }
    
    // Parse timestamps (already in IST, no conversion needed)
    const createdAt = parseDateString(item['Created At'] || new Date().toISOString());
    const updatedAt = parseDateString(item['Updated At'] || createdAt);
    const lastMessageDate = item['Last Message Date'] ? parseDateString(item['Last Message Date']) : updatedAt;

    // Generate a numeric ID from Thread ID or Ticket ID
    const threadIdStr = item['Thread ID'] || item['Ticket ID'] || '';
    let emailThreadId = index + 1;
    if (threadIdStr) {
      // Try to extract numeric part, or use hash of string
      const numericPart = threadIdStr.replace(/[^0-9]/g, '');
      if (numericPart) {
        emailThreadId = parseInt(numericPart.slice(-10)) || index + 1; // Use last 10 digits to avoid overflow
      } else {
        // Use hash of string as fallback
        emailThreadId = Math.abs(threadIdStr.split('').reduce((acc: number, char: string) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0)) || index + 1;
      }
    }

    const snippet = cleanSnippetText(item['Last Message Snippet'] || '');

    return {
      id: index + 1, // Use index as ID since we don't have a numeric ID
      email_thread_id: emailThreadId,
      subject: item['Subject'] || '',
      from_email: fromEmail,
      from_name: fromName,
      to_email: item['Customer Email'] || '',
      body: snippet,
      body_html: snippet,
      status: status,
      created_at: createdAt,
      updated_at: updatedAt,
      // Store additional fields for reference
      last_message_date: lastMessageDate,
      ticket_id: item['Ticket ID'] || '',
      thread_id: item['Thread ID'] || '',
      reply_body: item['Reply Body'] || '',
      send_reply: item['Send Reply?'] || '',
      attachment_file_ids: item['Attachment File IDs (optional)'] || '',
      canned_key: item['Canned Key'] || ''
    } as EmailThread & {
      last_message_date: string;
      ticket_id: string;
      thread_id: string;
      reply_body: string;
      send_reply: string;
      attachment_file_ids: string;
      canned_key: string;
    };
  });
};

class EmailResponseService {

  /**
   * Fetch email threads list with pagination and filters
   * @param filters - Optional filters for the threads
   * @returns Promise<EmailThreadsResponse>
   */
  async getEmailThreads(filters?: EmailFilters): Promise<EmailThreadsResponse> {
    try {
      // Build query parameters for Google Apps Script
      const queryParams = new URLSearchParams({
        token: GOOGLE_APPS_SCRIPT_TOKEN,
        resource: 'tickets'
      });
      
      // Add status filter only if provided (by default status is blank)
      const statusFilter = filters?.status;
      if (statusFilter && statusFilter.length > 0 && statusFilter !== '') {
        queryParams.append('status', statusFilter);
      }
      
      // Build the full URL
      const url = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
      
      console.log('📧 EmailResponseService: Fetching tickets from Google Apps Script:', url);
      
      // Make API call to Google Apps Script
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
        });
      } catch (fetchError: any) {
        // Handle CORS and network errors
        if (fetchError.name === 'TypeError' || fetchError.message?.includes('CORS') || fetchError.message?.includes('Failed to fetch')) {
          console.error('❌ CORS Error: Google Apps Script endpoint is blocking cross-origin requests');
          throw new Error('CORS Error: Unable to fetch from Google Apps Script. Please configure the script for web access.');
        }
        throw fetchError;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log('📧 EmailResponseService: Raw API response:', rawData);
      
      // Handle response format: { success: true, page: 1, per_page: 50, total: 24, has_next: false, data: [...] }
      let emailData: any[] = [];
      let totalCount = 0;
      let hasNext = false;
      
      if (rawData.success && Array.isArray(rawData.data)) {
        emailData = rawData.data;
        totalCount = rawData.total || 0;
        hasNext = rawData.has_next || false;
        console.log(`✅ EmailResponseService: API returned ${emailData.length} tickets, total: ${totalCount}, has_next: ${hasNext}`);
      } else if (rawData.success && !rawData.data) {
        // API returned success but no data array
        console.warn('⚠️ EmailResponseService: API returned success but no data array:', rawData);
        emailData = [];
      } else if (Array.isArray(rawData)) {
        emailData = rawData;
        console.log('📧 EmailResponseService: Response is direct array, length:', emailData.length);
      } else if (rawData.data && Array.isArray(rawData.data)) {
        emailData = rawData.data;
        totalCount = rawData.total || 0;
        hasNext = rawData.has_next || false;
        console.log(`📧 EmailResponseService: Found data array, length: ${emailData.length}, total: ${totalCount}`);
      } else if (rawData.tickets && Array.isArray(rawData.tickets)) {
        emailData = rawData.tickets;
        console.log('📧 EmailResponseService: Found tickets array, length:', emailData.length);
      } else {
        console.error('❌ EmailResponseService: Unexpected response format:', rawData);
        console.error('❌ EmailResponseService: Response keys:', Object.keys(rawData));
        emailData = [];
      }
      
      if (emailData.length === 0 && rawData.success) {
        console.warn('⚠️ EmailResponseService: No tickets returned despite success response');
      }
      
      // Transform the data
      let threads = transformEmailThreadsResponse(emailData);
      
      // Apply client-side filters (only if API didn't already filter)
      if (filters) {
        // Only apply status filter if API didn't handle it (when status is not null/empty)
        const statusFilter = filters.status;
        if (statusFilter && statusFilter.length > 0) {
          threads = threads.filter(t => t.status === statusFilter);
        }
        // Always apply search filter client-side if provided
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          threads = threads.filter(t => 
            t.subject.toLowerCase().includes(searchLower) ||
            t.from_email.toLowerCase().includes(searchLower) ||
            t.from_name?.toLowerCase().includes(searchLower) ||
            t.body.toLowerCase().includes(searchLower)
          );
        }
      }
      
      // Sort by "Last Message Date" descending (latest first)
      threads = threads.sort((a, b) => {
        const dateA = (a as any).last_message_date || a.updated_at || a.created_at;
        const dateB = (b as any).last_message_date || b.updated_at || b.created_at;
        
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        
        return timeB - timeA;
      });
      
      console.log('✅ Sorted threads by Last Message Date (latest first)');
      
      // Use pagination from API response if available, otherwise calculate from filtered results
      const page = filters?.page || rawData.page || 1;
      const perPage = filters?.per_page || rawData.per_page || 50;
      const apiPage = rawData.page || page;
      const apiPerPage = rawData.per_page || perPage;
      const total = totalCount > 0 ? totalCount : threads.length;
      const totalPages = Math.ceil(total / apiPerPage);
      
      // If API provided paginated data, use it directly; otherwise paginate client-side
      const paginatedThreads = totalCount > 0 ? threads : threads.slice(0, apiPerPage);
      
      console.log('✅ EmailResponseService: Success response, threads:', paginatedThreads.length);
      
      return {
        status: true,
        message: 'Email threads fetched successfully',
        data: {
          threads: paginatedThreads,
          pagination: {
            current_page: apiPage,
            last_page: totalPages,
            total_page: totalPages,
            per_page: apiPerPage,
            total: total
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching email threads:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: {
          threads: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            total_page: 1,
            per_page: 50,
            total: 0
          }
        },
        error: null
      };
    }
  }


  /**
   * Get email thread details with responses and internal notes
   * Uses caching to avoid redundant API calls
   * @param threadId - The Ticket ID (e.g., "T-1764656126754") or thread ID
   * @returns Promise<EmailThreadDetailsResponse>
   */
  async getEmailThreadDetails(threadId: number | string): Promise<EmailThreadDetailsResponse> {
    // Convert threadId to string and ensure it's a ticket ID format
    const ticketId = typeof threadId === 'string' ? threadId : `T-${threadId}`;
    
    // If it doesn't start with 'T-', try to find the ticket_id from the thread
    let actualTicketId = ticketId;
    if (!ticketId.startsWith('T-')) {
      actualTicketId = ticketId;
    }

    // Create cache key based on ticket ID
    const cacheKey = `email_thread_details:${actualTicketId}`;

    // Define cache strategy for email thread details
    const cacheStrategy = {
      showCachedFirst: true,
      backgroundRefresh: false, // Don't refresh in background for details (user explicitly requested)
      ttlMs: 10 * 60 * 1000, // 10 minutes cache
    };

    // Fetch function that makes the actual API call
    const fetchTicketDetails = async (): Promise<EmailThreadDetailsResponse> => {
      console.log('📧 EmailResponseService: Fetching ticket details for:', actualTicketId);

      // Build query parameters for Google Apps Script
      const queryParams = new URLSearchParams({
        token: GOOGLE_APPS_SCRIPT_TOKEN,
        resource: 'email_detail',
        ticket_id: actualTicketId,
        include_html: '1',
        page: '1',
        per_page: '20'
      });
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?${queryParams.toString()}`;
      
      console.log('📧 EmailResponseService: Fetching ticket details from Google Apps Script:', url);
      
      // Make API call to Google Apps Script
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
        });
      } catch (fetchError: any) {
        // Handle CORS and network errors
        if (fetchError.name === 'TypeError' || fetchError.message?.includes('CORS') || fetchError.message?.includes('Failed to fetch')) {
          console.error('❌ CORS Error: Google Apps Script endpoint is blocking cross-origin requests');
          throw new Error('CORS Error: Unable to fetch ticket details from Google Apps Script.');
        }
        throw fetchError;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log('📧 EmailResponseService: Raw ticket details response:', rawData);

      // Transform the response
      return this.transformTicketDetailsResponse(rawData, actualTicketId);
    };

    try {
      // Use SmartCache to get data (returns cached if available, otherwise fetches)
      const result = await SmartCache.getData(
        cacheKey,
        fetchTicketDetails,
        cacheStrategy
      );

      if (result) {
        return result;
      }

      // If cache returned null, return error response
      return {
        status: false,
        message: 'Failed to fetch ticket details',
        data: {
          thread: {} as any,
          responses: [],
          internal_notes: []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching email thread details:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: {
          thread: {} as any,
          responses: [],
          internal_notes: []
        },
        error: null
      };
    }
  }

  /**
   * Transform ticket details response to EmailThreadDetailsResponse format
   */
  private transformTicketDetailsResponse(rawData: any, ticketId: string): EmailThreadDetailsResponse {
    if (!rawData.success || !rawData.ticket) {
      throw new Error('Invalid ticket details response');
    }

    const ticket = rawData.ticket;
    const messages = rawData.messages || [];

    // Extract name and email from "Customer Email" and "Last Message From"
    let fromName = '';
    let fromEmail = ticket['Customer Email'] || '';
    
    if (ticket['Last Message From']) {
      const fromMatch = ticket['Last Message From'].match(/^(.+?)\s*<(.+?)>$/);
      if (fromMatch) {
        fromName = fromMatch[1].trim();
        fromEmail = fromMatch[2].trim();
      } else {
        fromEmail = ticket['Last Message From'].trim();
      }
    }

    // Convert status to lowercase for consistency
    const statusRaw = (ticket['Status'] || 'open').toLowerCase().trim();
    let status: 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered' = 'open';
    
    if (statusRaw === 'open' || statusRaw === 'new' || statusRaw === 'active') {
      status = 'open';
    } else if (statusRaw === 'closed' || statusRaw === 'close') {
      status = 'closed';
    } else if (statusRaw === 'pending' || statusRaw === 'in progress' || statusRaw === 'in-progress') {
      status = 'pending';
    } else if (statusRaw === 'resolved' || statusRaw === 'resolve' || statusRaw === 'completed' || statusRaw === 'answered') {
      // Map both 'resolved' and 'answered' to 'answered' for consistency
      status = 'answered';
    } else if (statusRaw === 'spam') {
      status = 'spam';
    }

    // Parse timestamps
    const createdAt = parseDateString(ticket['Created At'] || new Date().toISOString());
    const updatedAt = parseDateString(ticket['Updated At'] || createdAt);
    const lastMessageDate = ticket['Last Message Date'] ? parseDateString(ticket['Last Message Date']) : updatedAt;

    // Generate numeric ID from Thread ID or Ticket ID
    const threadIdStr = ticket['Thread ID'] || ticket['Ticket ID'] || '';
    let emailThreadId = 1;
    if (threadIdStr) {
      const numericPart = threadIdStr.replace(/[^0-9]/g, '');
      if (numericPart) {
        emailThreadId = parseInt(numericPart.slice(-10)) || 1;
      } else {
        emailThreadId = Math.abs(threadIdStr.split('').reduce((acc: number, char: string) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0)) || 1;
      }
    }

    // Extract "To" email from the first message (original message)
    let toEmail = '';
    if (messages.length > 0 && messages[0]['To']) {
      const toField = messages[0]['To'];
      const emailMatches = toField.match(/<([^>]+)>/g);
      if (emailMatches && emailMatches.length > 0) {
        toEmail = emailMatches[0].replace(/[<>]/g, '');
      } else {
        const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/;
        const match = toField.match(emailPattern);
        if (match) {
          toEmail = match[0];
        } else {
          toEmail = toField.trim();
        }
      }
    }

    // Transform ticket to EmailThread
    const threadSnippet = cleanSnippetText(ticket['Last Message Snippet'] || '');

    const thread: EmailThread = {
      id: 1,
      email_thread_id: emailThreadId,
      subject: ticket['Subject'] || '',
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail || ticket['Customer Email'] || '',
      body: threadSnippet,
      body_html: threadSnippet,
      status: status,
      created_at: createdAt,
      updated_at: updatedAt,
      ticket_id: ticket['Ticket ID'] || '',
      thread_id: ticket['Thread ID'] || '',
      reply_body: ticket['Reply Body'] || '',
      send_reply: ticket['Send Reply?'] || '',
      attachment_file_ids: ticket['Attachment File IDs (optional)'] || '',
      canned_key: ticket['Canned Key'] || ''
    } as EmailThread & {
      ticket_id: string;
      thread_id: string;
      reply_body: string;
      send_reply: string;
      attachment_file_ids: string;
      canned_key: string;
    };

    // Transform messages to EmailResponse[]
    const responses: EmailResponse[] = messages.map((message: any, index: number) => {
      // Extract name and email from "From" field
      let msgFromName = '';
      let msgFromEmail = '';
      
      if (message['From']) {
        const fromMatch = message['From'].match(/^(.+?)\s*<(.+?)>$/);
        if (fromMatch) {
          msgFromName = fromMatch[1].trim();
          msgFromEmail = fromMatch[2].trim();
        } else {
          msgFromEmail = message['From'].trim();
        }
      }

      // Extract "To" field
      let toEmails = '';
      if (message['To']) {
        const toField = message['To'];
        const emailMatches = toField.match(/<([^>]+)>/g);
        if (emailMatches && emailMatches.length > 0) {
          toEmails = emailMatches.map((match: string) => match.replace(/[<>]/g, '')).join(', ');
        } else {
          const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
          const matches = toField.match(emailPattern);
          if (matches && matches.length > 0) {
            toEmails = matches.join(', ');
          } else {
            toEmails = toField.trim();
          }
        }
      }

      // Parse message date
      const messageDate = parseDateString(message['Date'] || createdAt);

      // Transform attachments from the attachments array
      const attachments: EmailAttachment[] = [];
      if (message.attachments && Array.isArray(message.attachments)) {
        message.attachments.forEach((att: any, attIndex: number) => {
          attachments.push({
            id: attIndex + 1,
            filename: att.name || `attachment-${attIndex + 1}`,
            file_path: att.url || '',
            file_size: 0, // Not provided in API
            mime_type: att.mimeType || 'application/octet-stream',
            created_at: messageDate
          });
        });
      }

      // Get HTML body directly from the response (no need to fetch separately)
      const htmlBody = message['html_body'] || '';
      const rawBody = message['Body (truncated)'] || '';
      
      // Sanitize HTML if available, otherwise format the plain text body
      let bodyHtml = '';
      let cleanBodyText = '';
      
      if (htmlBody) {
        // Use the HTML body directly
        const attachmentSources: AttachmentLike[] = Array.isArray(message.attachments)
          ? message.attachments
          : attachments;
        
        bodyHtml = sanitizeHtmlContent(htmlBody, attachmentSources);
        cleanBodyText = htmlToCleanPlainText(bodyHtml);
      } else if (rawBody) {
        // Fallback to formatting plain text body
        bodyHtml = this.formatEmailBodyWithTables(rawBody);
        cleanBodyText = cleanSnippetText(rawBody);
      }

      return {
        id: index + 1,
        thread_id: emailThreadId,
        from_email: msgFromEmail,
        from_name: msgFromName,
        to_email: toEmails,
        subject: ticket['Subject'] || '',
        body: cleanBodyText,
        body_html: bodyHtml || rawBody,
        created_at: messageDate,
        updated_at: messageDate,
        attachments: attachments.length > 0 ? attachments : undefined,
        is_internal: message['Direction'] === 'OUT',
        is_reply: message['Direction'] === 'OUT'
      } as EmailResponse;
    });

    return {
      status: true,
      message: 'Ticket details fetched successfully',
      data: {
        thread,
        responses,
        internal_notes: [] // Not provided by API
      },
      error: null
    };
  }

  /**
   * Format email body to detect and convert tabular data to HTML tables
   * Handles both horizontal (tab/space separated) and vertical (line-by-line) formats
   */
  private formatEmailBodyWithTables(body: string): string {
    if (!body) return '';
    
    // Normalize line breaks
    let normalizedBody = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedBody.split('\n');
    
    // Try to detect vertical table format (column names on separate lines)
    const headerKeywords = ['sender name', 'sender address', 'sender pincode', 'sender city', 'sender state', 
                           'receiver name', 'receiver address', 'receiver pincode', 'receiver city', 'receiver state',
                           'current status', 'tracking url', 'expected pickup date', 'expected delivery date'];
    
    // Look for vertical table format: header keywords appearing on consecutive lines
    let verticalTableStart = -1;
    let headerCols: string[] = [];
    
    // Find consecutive lines that match header keywords
    for (let i = 0; i < lines.length - 5; i++) {
      const potentialHeaders: string[] = [];
      let matchCount = 0;
      
      // Check next 20 lines for header keywords (allow for some spacing)
      for (let j = i; j < Math.min(i + 20, lines.length); j++) {
        const line = lines[j].trim();
        if (!line) {
          // Empty line - if we have matches, might be end of header
          if (matchCount > 0 && matchCount >= 3) {
            break;
          }
          continue;
        }
        
        const lineLower = line.toLowerCase();
        const matchedKeyword = headerKeywords.find(keyword => {
          // Exact match or contains the keyword
          return lineLower === keyword || 
                 lineLower.includes(keyword) ||
                 keyword.includes(lineLower);
        });
        
        if (matchedKeyword) {
          potentialHeaders.push(line); // Keep original case
          matchCount++;
        } else if (matchCount > 0 && matchCount >= 5) {
          // We have enough matches, stop here
          break;
        }
      }
      
      // If we found at least 5 matching headers, it's likely a vertical table
      if (matchCount >= 5) {
        verticalTableStart = i;
        headerCols = potentialHeaders;
        console.log('📧 Found vertical table format starting at line', i);
        console.log('📧 Header columns:', headerCols);
        break;
      }
    }
    
    // Handle vertical table format
    if (verticalTableStart >= 0 && headerCols.length > 0) {
      const headerEndIndex = verticalTableStart + headerCols.length;
      const dataStartIndex = headerEndIndex;
      
      // Find data rows - each row has the same number of values as headers
      const numCols = headerCols.length;
      const dataRows: string[][] = [];
      let currentRow: string[] = [];
      let lineIndex = dataStartIndex;
      let consecutiveEmptyLines = 0;
      
      console.log('📧 Starting data collection at line', dataStartIndex, 'with', numCols, 'columns');
      
      while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        
        if (!line) {
          consecutiveEmptyLines++;
          
          // If we have a partial row and hit empty lines, check if we should save it
          if (currentRow.length > 0) {
            // If we have at least 70% of columns, save the row (might be end of table)
            if (currentRow.length >= numCols * 0.7) {
              // Pad to full length
              while (currentRow.length < numCols) {
                currentRow.push('');
              }
              dataRows.push(currentRow.slice(0, numCols));
              console.log('📧 Saved partial row with', currentRow.length, 'columns');
            }
            currentRow = [];
          }
          
          // If we hit 3+ consecutive empty lines and have data rows, we're done
          if (consecutiveEmptyLines >= 3 && dataRows.length > 0) {
            console.log('📧 Stopping at', consecutiveEmptyLines, 'consecutive empty lines');
            break;
          }
          
          lineIndex++;
          continue;
        }
        
        // Reset empty line counter when we find content
        consecutiveEmptyLines = 0;
        
        // Clean up the value (remove backticks, extra spaces)
        const cleanValue = line.replace(/`/g, '').trim();
        
        // Skip if this looks like a header keyword (we're past headers)
        const isHeaderKeyword = headerKeywords.some(keyword => 
          cleanValue.toLowerCase() === keyword || cleanValue.toLowerCase().includes(keyword)
        );
        
        if (isHeaderKeyword && currentRow.length === 0) {
          // Might be start of another table, skip for now
          lineIndex++;
          continue;
        }
        
        currentRow.push(cleanValue);
        
        // If we've collected enough values for a row, save it
        if (currentRow.length >= numCols) {
          dataRows.push(currentRow.slice(0, numCols));
          console.log('📧 Saved complete row', dataRows.length, ':', currentRow.slice(0, 3).join(', '), '...');
          currentRow = currentRow.slice(numCols); // Keep any extra values for next row
        }
        
        lineIndex++;
      }
      
      // If we have a partial row at the end, add it if it has enough values
      if (currentRow.length >= numCols * 0.7) {
        while (currentRow.length < numCols) {
          currentRow.push(''); // Pad with empty strings
        }
        dataRows.push(currentRow.slice(0, numCols));
        console.log('📧 Saved final partial row');
      }
      
      console.log('📧 Found', dataRows.length, 'data rows in vertical format');
      
      if (dataRows.length > 0) {
        // Build HTML table
        let tableHtml = '<div style="overflow-x: auto; margin: 1.5rem 0; border: 1px solid #e5e5e5; border-radius: 0.5rem; background: white;"><table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;"><thead><tr style="background: #f8f9fa;">';
        
        headerCols.forEach(col => {
          tableHtml += `<th style="padding: 0.75rem 1rem; text-align: left; border-bottom: 2px solid #e5e5e5; font-weight: 600; color: #374151; white-space: nowrap;">${this.escapeHtml(col)}</th>`;
        });
        
        tableHtml += '</tr></thead><tbody>';
        
        // Add data rows
        dataRows.forEach((row, rowIdx) => {
          tableHtml += `<tr style="${rowIdx % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">`;
          row.forEach((cell, colIdx) => {
            // Check if cell contains a URL
            const isUrl = /^https?:\/\//.test(cell);
            const cellContent = isUrl 
              ? `<a href="${this.escapeHtml(cell)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${this.escapeHtml(cell)}</a>`
              : this.escapeHtml(cell);
            
            tableHtml += `<td style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e5e5; word-break: break-word; vertical-align: top;">${cellContent}</td>`;
          });
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table></div>';
        
        // Replace the table section in the body
        const beforeTable = lines.slice(0, verticalTableStart).join('\n');
        const afterTableIndex = lineIndex;
        const afterTable = lines.slice(afterTableIndex).join('\n');
        
        // Format non-table parts
        const formatText = (text: string) => {
          if (!text.trim()) return '';
          return text.split('\n').map(line => {
            if (!line.trim()) return '<br>';
            // Check for URLs and make them clickable
            const urlPattern = /(https?:\/\/[^\s]+)/g;
            let formattedLine = this.escapeHtml(line);
            formattedLine = formattedLine.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');
            return `<div style="padding: 0.5rem 0; line-height: 1.6; color: #374151;">${formattedLine}</div>`;
          }).join('');
        };
        
        return formatText(beforeTable) + tableHtml + formatText(afterTable);
      }
    }
    
    // Fallback: Try horizontal table format (original logic)
    let tableStartIndex = -1;
    let headerLineIndex = -1;
    
    // Find potential header row - don't trim yet, we need original spacing
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const keywordMatches = headerKeywords.filter(keyword => line.includes(keyword));
      if (keywordMatches.length >= 3) {
        // Found header row
        headerLineIndex = i;
        tableStartIndex = i + 1;
        console.log('📧 Found horizontal table header at line', i, ':', lines[i].substring(0, 200));
        break;
      }
    }
    
    if (headerLineIndex >= 0 && tableStartIndex < lines.length) {
      // Found table, parse it
      const headerLine = lines[headerLineIndex];
      const dataLines: string[] = [];
      
      console.log('📧 Parsing table. Header line:', headerLine.substring(0, 300));
      
      // Parse header - try tab first, then multiple spaces
      let headerCols: string[] = [];
      if (headerLine.includes('\t')) {
        headerCols = headerLine.split('\t').map(col => col.trim()).filter(col => col);
        console.log('📧 Header columns (tab-separated):', headerCols);
      } else {
        // Try to split by common patterns
        // Look for patterns like "Sender Name", "Sender Address", etc.
        const colPatterns = [
          /sender\s+name/i,
          /sender\s+address/i,
          /sender\s+pincode/i,
          /sender\s+city/i,
          /sender\s+state/i,
          /receiver\s+name/i,
          /receiver\s+address/i,
          /receiver\s+pincode/i,
          /receiver\s+city/i,
          /receiver\s+state/i,
          /current\s+status/i,
          /tracking\s+url/i,
          /expected\s+pickup\s+date/i,
          /expected\s+delivery\s+date/i
        ];
        
        // Extract column positions
        const colPositions: number[] = [];
        colPatterns.forEach(pattern => {
          const match = headerLine.match(pattern);
          if (match && match.index !== undefined) {
            colPositions.push(match.index);
          }
        });
        colPositions.sort((a, b) => a - b);
        
        // Extract columns based on positions
        headerCols = [];
        for (let i = 0; i < colPositions.length; i++) {
          const start = colPositions[i];
          const end = i < colPositions.length - 1 ? colPositions[i + 1] : headerLine.length;
          headerCols.push(headerLine.substring(start, end).trim());
        }
      }
      
      if (headerCols.length === 0) {
        // Fallback: split by multiple spaces or tabs
        headerCols = headerLine.split(/\s{2,}|\t/).map(col => col.trim()).filter(col => col);
        console.log('📧 Header columns (fallback):', headerCols);
      }
      
      // Collect data rows - look for lines with similar structure to header
      for (let i = tableStartIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line || line.trim() === '') {
          // Empty line might indicate end of table, but continue if we have data
          if (dataLines.length > 0) {
            console.log('📧 Stopping at empty line after', dataLines.length, 'data rows');
            break;
          }
          continue;
        }
        
        // Check if line looks like data (has multiple values)
        // For tab-separated
        const tabCols = line.split('\t').length;
        // For space-separated (2+ spaces)
        const spaceCols = line.split(/\s{2,}/).length;
        // Also check for consistent pattern with header
        const hasMultipleValues = tabCols > 3 || spaceCols > 3;
        
        // Additional check: line should not look like regular text (too many short words)
        const wordCount = line.trim().split(/\s+/).length;
        const isLikelyDataRow = hasMultipleValues || (wordCount > 5 && line.length > 50);
        
        if (isLikelyDataRow) {
          dataLines.push(line);
        } else if (dataLines.length > 0) {
          // Pattern broke, stop collecting
          console.log('📧 Pattern broke at line', i, 'after', dataLines.length, 'rows');
          break;
        }
      }
      
      console.log('📧 Collected', dataLines.length, 'data rows');
      
      if (dataLines.length > 0 && headerCols.length > 0) {
        // Build HTML table
        let tableHtml = '<div style="overflow-x: auto; margin: 1.5rem 0; border: 1px solid #e5e5e5; border-radius: 0.5rem;"><table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; background: white;"><thead><tr style="background: #f8f9fa;">';
        
        headerCols.forEach(col => {
          tableHtml += `<th style="padding: 0.75rem 1rem; text-align: left; border-bottom: 2px solid #e5e5e5; font-weight: 600; color: #374151;">${this.escapeHtml(col)}</th>`;
        });
        
        tableHtml += '</tr></thead><tbody>';
        
        // Parse and add data rows
        dataLines.forEach((dataLine, rowIdx) => {
          let dataCols: string[] = [];
          
          if (dataLine.includes('\t')) {
            dataCols = dataLine.split('\t').map(col => col.trim());
          } else {
            // Try to split by consistent spacing
            // Use the header column positions as guide
            const parts = dataLine.split(/\s{2,}/);
            if (parts.length >= headerCols.length) {
              dataCols = parts.slice(0, headerCols.length);
            } else {
              // Fallback: split by any whitespace and take first N columns
              dataCols = dataLine.split(/\s+/).slice(0, headerCols.length);
            }
          }
          
          // Align columns with header
          const alignedCols = headerCols.map((_, idx) => {
            const col = dataCols[idx] || '';
            // Clean up common formatting issues
            return col.replace(/`/g, '').trim();
          });
          
          tableHtml += `<tr style="${rowIdx % 2 === 0 ? 'background: #ffffff;' : 'background: #f9fafb;'}">`;
          alignedCols.forEach(col => {
            // Check if column contains a URL
            const isUrl = /^https?:\/\//.test(col);
            const cellContent = isUrl 
              ? `<a href="${this.escapeHtml(col)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${this.escapeHtml(col)}</a>`
              : this.escapeHtml(col);
            
            tableHtml += `<td style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e5e5; word-break: break-word; max-width: 200px;">${cellContent}</td>`;
          });
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table></div>';
        
        // Replace the table section in the body
        const beforeTable = lines.slice(0, headerLineIndex).join('\n');
        const afterTableIndex = tableStartIndex + dataLines.length;
        const afterTable = lines.slice(afterTableIndex).join('\n');
        
        // Format non-table parts
        const formatText = (text: string) => {
          if (!text.trim()) return '';
          return text.split('\n').map(line => {
            if (!line.trim()) return '<br>';
            return `<div style="padding: 0.5rem 0; line-height: 1.6; color: #374151;">${this.escapeHtml(line)}</div>`;
          }).join('');
        };
        
        return formatText(beforeTable) + tableHtml + formatText(afterTable);
      }
    }
    
    // No table detected, format as regular text
    return normalizedBody.split('\n').map(line => {
      if (!line.trim()) return '<br>';
      // Check for URLs and make them clickable
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      let formattedLine = this.escapeHtml(line);
      formattedLine = formattedLine.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');
      return `<div style="padding: 0.5rem 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${formattedLine}</div>`;
    }).join('');
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    if (typeof window === 'undefined') {
      // Server-side or service context - use string replacement
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Send an email (reply or new email)
   * @param emailData - Email data including thread_id (for replies) or new email details
   * @returns Promise<SendEmailResponse>
   */
  async sendEmail(emailData: SendEmailRequest): Promise<SendEmailResponse> {
    // API removed - email sending not supported
    console.log('📧 EmailResponseService: Send email API removed');
    return {
      status: false,
      message: 'Send email API is not available',
      data: {} as any,
      error: 'API removed'
    };
  }

  /**
   * Update email thread status
   * @param updateData - Update data including thread_id, status, priority, and optional note
   * @returns Promise<{status: boolean, message: string, data: any, error: any}>
   */
  async updateThreadStatus(updateData: UpdateThreadStatusRequest): Promise<{
    status: boolean;
    message: string;
    data: any;
    error: any;
  }> {
    // API removed - status updates not supported
    console.log('📧 EmailResponseService: Status update API removed');
    return {
      status: false,
      message: 'Status update API is not available',
      data: null,
      error: 'API removed'
    };
  }

  /**
   * Add internal note to email thread
   * @param noteData - Note data including thread_id and note
   * @returns Promise<{status: boolean, message: string, data: any, error: any}>
   */
  async addInternalNote(noteData: AddInternalNoteRequest): Promise<{
    status: boolean;
    message: string;
    data: any;
    error: any;
  }> {
    // API calls removed - returning mock success
    console.log('📧 EmailResponseService: API calls disabled - internal note skipped');
    return {
      status: false,
      message: 'Email API calls are disabled',
      data: null,
      error: 'API calls disabled'
    };
  }

  /**
   * Get canned responses
   * @returns Promise<CannedResponsesResponse>
   */
  async getCannedResponses(): Promise<CannedResponsesResponse> {
    // API calls removed - returning empty data
    console.log('📧 EmailResponseService: API calls disabled - returning empty canned responses');
    return {
      status: true,
      message: 'Canned responses API disabled',
      data: [],
      error: null
    };
  }
}

export const emailResponseService = new EmailResponseService();

