import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Mail,
  MailOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  Tag,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  FileText,
  MessageSquare,
  Edit3,
  Trash2,
  Copy,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { MultiSelectFilter } from './MultiSelectFilter';
import { useToast } from '@/hooks/use-toast';
import { emailResponseService } from '@/services/emailResponseService';
import {
  EmailThread,
  EmailResponse,
  InternalNote,
  CannedResponse,
  EmailFilters,
  SendEmailRequest
} from '@/types/emailResponse';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import SmartCache, { CacheStrategies } from '@/utils/smartCache'; // API calls removed

const EmailResponsePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingThreadDetails, setLoadingThreadDetails] = useState(false);
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [threadResponses, setThreadResponses] = useState<EmailResponse[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_page: 1,
    per_page: 50,
    total: 0
  });
  const [filters, setFilters] = useState<EmailFilters>({
    page: 1,
    per_page: 50
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [cannedResponseDialogOpen, setCannedResponseDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isNewEmail, setIsNewEmail] = useState(false);
  
  // Reply form state
  const [replyForm, setReplyForm] = useState({
    to_email: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: [] as File[]
  });
  
  // Internal note form state
  const [noteForm, setNoteForm] = useState({
    note: ''
  });
  
  // Status update form state
  const [statusForm, setStatusForm] = useState({
    status: 'open' as 'open' | 'closed' | 'pending' | 'resolved' | 'spam' | 'answered',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    note: ''
  });
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingThreadRef = useRef<string | number | null>(null);

  // Load threads when filters change
  useEffect(() => {
    loadThreads();
    loadCannedResponses();
  }, [filters]);

  // Reload threads when multi-select status values change
  useEffect(() => {
    // Trigger a reload by updating filters (but we'll filter client-side in loadThreads)
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatuses]);

  // Load thread details when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      // Get ticket_id from thread (it's stored as an extended property)
      const ticketId = (selectedThread as any).ticket_id || selectedThread.id;
      
      // Prevent duplicate API calls
      if (loadingThreadRef.current === ticketId) {
        return;
      }
      
      loadingThreadRef.current = ticketId;
      loadThreadDetails(ticketId);
    } else {
      // Clear responses when no thread is selected
      setThreadResponses([]);
      setInternalNotes([]);
      loadingThreadRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThread?.id]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      // Build filters - if multi-select has values, filter client-side
      const baseFilters = { ...filters };
      if (selectedStatuses.length > 0) {
        // Remove status from API call, we'll filter client-side
        delete baseFilters.status;
      }
      
      const response = await emailResponseService.getEmailThreads(baseFilters);
      if (response.status) {
        let filteredThreads = response.data.threads;
        
        // Apply client-side filtering for multi-select status
        if (selectedStatuses.length > 0) {
          filteredThreads = filteredThreads.filter(thread => 
            thread.status && selectedStatuses.includes(thread.status)
          );
        }
        
        setThreads(filteredThreads);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load email threads",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: "Error",
        description: "Failed to load email threads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load thread details from API
  const loadThreadDetails = async (threadId: number | string) => {
    setLoadingThreadDetails(true);
    try {
      console.log('📧 Loading thread details for:', threadId);
      
      const response = await emailResponseService.getEmailThreadDetails(threadId);
      
      if (response.status && response.data) {
        // Update the selected thread with the latest data
        setSelectedThread(response.data.thread);
        setThreadResponses(response.data.responses);
        setInternalNotes(response.data.internal_notes);
        
        console.log('✅ Thread details loaded:', {
          thread: response.data.thread,
          responsesCount: response.data.responses.length,
          notesCount: response.data.internal_notes.length
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load thread details",
          variant: "destructive",
        });
        // Clear loading state on error
        loadingThreadRef.current = null;
      }
    } catch (error) {
      console.error('Error loading thread details:', error);
      toast({
        title: "Error",
        description: "Failed to load thread details",
        variant: "destructive",
      });
      // Clear loading state on error
      loadingThreadRef.current = null;
    } finally {
      setLoadingThreadDetails(false);
    }
  };

  // API call removed - UI only
  const loadCannedResponses = async () => {
    // API calls removed - keeping function for UI compatibility
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof EmailFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleThreadSelect = (thread: EmailThread) => {
    setSelectedThread(thread);
    // Pre-fill reply form
    setReplyForm({
      to_email: thread.from_email,
      cc: '',
      bcc: '',
      subject: thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`,
      body: '',
      attachments: []
    });
  };

  const handleReply = async () => {
    if (!isNewEmail && !selectedThread) return;
    
    if (!replyForm.to_email.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipient email",
        variant: "destructive",
      });
      return;
    }
    
    if (!replyForm.subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject",
        variant: "destructive",
      });
      return;
    }
    
    if (!replyForm.body.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    // API call removed - UI only
    // try {
    //   const emailData: SendEmailRequest = {
    //     thread_id: isNewEmail ? undefined : selectedThread?.id,
    //     to_email: replyForm.to_email,
    //     cc: replyForm.cc || undefined,
    //     bcc: replyForm.bcc || undefined,
    //     subject: replyForm.subject,
    //     body: replyForm.body,
    //     attachments: replyForm.attachments.length > 0 ? replyForm.attachments : undefined
    //   };

    //   const response = await emailResponseService.sendEmail(emailData);
      
    //   if (response.status) {
    //     toast({
    //       title: "Success",
    //       description: "Email sent successfully",
    //     });
    //     setReplyDialogOpen(false);
    //     setIsNewEmail(false);
    //     setReplyForm({
    //       to_email: '',
    //       cc: '',
    //       bcc: '',
    //       subject: '',
    //       body: '',
    //       attachments: []
    //     });
    //     // Reload thread details if it was a reply
    //     if (!isNewEmail && selectedThread) {
    //       loadThreadDetails(selectedThread.id);
    //     }
    //     loadThreads();
    //   } else {
    //     toast({
    //       title: "Error",
    //       description: response.message || "Failed to send email",
    //       variant: "destructive",
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error sending email:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to send email",
    //     variant: "destructive",
    //   });
    // }
    
    // UI only - show message that API is disabled
    toast({
      title: "Info",
      description: "Email sending is disabled (API calls removed)",
    });
  };

  const handleAddNote = async () => {
    if (!selectedThread) return;
    
    if (!noteForm.note.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    // API call removed - UI only
    // try {
    //   const response = await emailResponseService.addInternalNote({
    //     thread_id: selectedThread.id,
    //     note: noteForm.note
    //   });
      
    //   if (response.status) {
    //     toast({
    //       title: "Success",
    //       description: "Internal note added successfully",
    //     });
    //     setNoteDialogOpen(false);
    //     setNoteForm({ note: '' });
    //     // Reload thread details
    //     if (selectedThread) {
    //       loadThreadDetails(selectedThread.id);
    //     }
    //   } else {
    //     toast({
    //       title: "Error",
    //       description: response.message || "Failed to add note",
    //       variant: "destructive",
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error adding note:', error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to add note",
    //     variant: "destructive",
    //   });
    // }
    
    // UI only - show message that API is disabled
    toast({
      title: "Info",
      description: "Adding notes is disabled (API calls removed)",
    });
  };

  const handleStatusUpdate = async (newStatus?: 'open' | 'closed' | 'answered') => {
    if (!selectedThread) return;

    // If newStatus is provided, use it for quick status change
    const statusToUpdate = newStatus || statusForm.status;
    const ticketId = (selectedThread as any).ticket_id || selectedThread.id;

    try {
      const response = await emailResponseService.updateThreadStatus({
        thread_id: ticketId as any,
        status: statusToUpdate,
        priority: newStatus ? (selectedThread.priority || 'medium') : statusForm.priority,
        note: newStatus ? undefined : (statusForm.note || undefined)
      });
      
      if (response.status) {
        toast({
          title: "Success",
          description: "Thread status updated successfully",
        });
        setStatusDialogOpen(false);
        setStatusForm({
          status: selectedThread?.status || 'open',
          priority: selectedThread?.priority || 'medium',
          note: ''
        });
        // Reload threads and details
        loadThreads();
        if (selectedThread) {
          // Reload thread details to get updated thread
          const detailsResponse = await emailResponseService.getEmailThreadDetails(ticketId);
          if (detailsResponse.status) {
            setSelectedThread(detailsResponse.data.thread);
            setThreadResponses(detailsResponse.data.responses);
            setInternalNotes(detailsResponse.data.internal_notes);
          }
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleCannedResponseSelect = (canned: CannedResponse) => {
    setReplyForm(prev => ({
      ...prev,
      body: canned.content
    }));
    setCannedResponseDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setReplyForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setReplyForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'resolved':
      case 'answered':
        return 'secondary';
      case 'spam':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'closed':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'resolved':
      case 'answered':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'spam':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return '';
    }
  };

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Timestamps are already in IST, format directly without timezone conversion
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const getAttachmentPriority = (filename: string): number => {
    const lowerFilename = filename.toLowerCase();
    const extension = lowerFilename.split('.').pop() || '';
    
    // Priority order: PDF (1), CSV (2), Excel (3), PNG (last), Others (4)
    if (extension === 'pdf') return 1;
    if (extension === 'csv') return 2;
    if (extension === 'xls' || extension === 'xlsx') return 3;
    if (extension === 'png') return 5; // PNG last
    return 4; // Other files
  };

  const sortAttachmentsByPriority = (attachments: any[]) => {
    return [...attachments].sort((a, b) => {
      const priorityA = getAttachmentPriority(a.filename || '');
      const priorityB = getAttachmentPriority(b.filename || '');
      return priorityA - priorityB;
    });
  };

  const cleanEmailPreview = (html: string, maxLength: number = 100): string => {
    if (!html) return '';
    
    let text = html;
    
    // Remove style tags and their content (including all CSS inside)
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove script tags and their content
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove all HTML tags first
    text = text.replace(/<[^>]*>/g, '');
    
    // Remove CSS at-rules that might be in the text (e.g., @font-face, @media, @keyframes)
    // Handle @font-face with multiline content - match everything until closing brace
    text = text.replace(/@font-face\s*\{[^}]*\}/gis, '');
    // Handle @font-face that might span multiple lines with nested content
    text = text.replace(/@font-face[^{]*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gis, '');
    // Handle other @rules with single braces
    text = text.replace(/@[a-z-]+\s*\{[^}]*\}/gi, '');
    // Handle nested CSS rules
    text = text.replace(/@[a-z-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');
    // Handle @rules that might not have braces
    text = text.replace(/@[a-z-]+\s+[^;{]+;?/gi, '');
    // Remove any remaining @font-face patterns that might be split across lines
    text = text.replace(/@font-face[^}]*/gi, '');
    
    // Remove CSS-like patterns (e.g., "P {margin-top:0;margin-bottom:0;}")
    text = text.replace(/[A-Za-z#.][A-Za-z0-9#._-]*\s*\{[^}]*\}/g, '');
    
    // Remove any remaining CSS property patterns (property: value;)
    text = text.replace(/[a-z-]+\s*:\s*[^;]+;/gi, '');
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    
    // Remove extra whitespace, newlines, and normalize
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove any remaining CSS artifacts (like "font-family:", "src:", etc. at start)
    text = text.replace(/^(font-family|src|local|url|font-style|font-weight|font-size|color|background|margin|padding|border|display|position|width|height|line-height|text-align|vertical-align|white-space|overflow|text-decoration|text-transform|letter-spacing|word-spacing|opacity|z-index|float|clear|visibility|cursor|outline|box-shadow|text-shadow|transform|transition|animation|@import|@charset|@namespace|@page|@supports|@document|@viewport):\s*/gim, '');
    
    // Remove any text that starts with CSS keywords or @font-face
    text = text.replace(/^(Amazon|@font-face|@media|@keyframes|@import)\s+/gi, '');
    
    // Remove any remaining @ symbols followed by text (CSS at-rules) - be more aggressive
    text = text.replace(/@[a-z-]+[^@]*/gi, '');
    
    // Remove any text starting with "Amazon" followed by @font-face
    text = text.replace(/^Amazon\s+@font-face[^@]*/gi, '');
    
    // Clean up any remaining artifacts
    text = text.replace(/^\s*[{};]\s*/g, ''); // Remove leading braces/semicolons
    
    // Truncate if needed
    if (text.length > maxLength) {
      text = text.substring(0, maxLength).trim() + '...';
    }
    
    return text;
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'answered':
        return 'Answered';
      case 'closed':
        return 'Close';
      case 'pending':
        return 'Pending';
      case 'resolved':
        return 'Resolved';
      case 'spam':
        return 'Spam';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusCounts = () => {
    return {
      open: threads.filter(t => t.status === 'open').length,
      closed: threads.filter(t => t.status === 'closed').length,
      pending: threads.filter(t => t.status === 'pending').length,
      resolved: threads.filter(t => t.status === 'resolved' || t.status === 'answered').length,
      answered: threads.filter(t => t.status === 'answered').length,
      spam: threads.filter(t => t.status === 'spam').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4 flex-1">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
                Email Responses
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage and respond to customer emails</p>
            </div>
            {/* Search Bar */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              onClick={() => {
                setIsNewEmail(true);
                setReplyForm({
                  to_email: '',
                  cc: '',
                  bcc: '',
                  subject: '',
                  body: '',
                  attachments: []
                });
                setReplyDialogOpen(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 h-9"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Email
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Email List */}
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Filter:</span>
              </div>
              
              <MultiSelectFilter
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'answered', label: 'Answered' },
                  { value: 'closed', label: 'Close' }
                ]}
                selectedValues={selectedStatuses}
                onValueChange={setSelectedStatuses}
                placeholder="All Status"
                className="w-32"
              />

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {threads.length} email{threads.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Status Counts */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Open: {statusCounts.open}</span>
              <span>Answered: {statusCounts.answered}</span>
              <span>Closed: {statusCounts.closed}</span>
            </div>
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            {loading && !isRefreshing ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No emails found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {isRefreshing && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                    <span className="text-xs text-blue-600">Syncing emails in background...</span>
                  </div>
                )}
                {threads.map((thread) => {
                  // Get Last Message Date from extended thread properties
                  const lastMessageDate = (thread as any).last_message_date || thread.updated_at || thread.created_at;
                  
                  return (
                    <div
                      key={thread.id}
                      onClick={() => handleThreadSelect(thread)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {thread.from_name || thread.from_email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{thread.from_email}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                          <Badge
                            variant={getStatusBadgeVariant(thread.status)}
                            className={getStatusBadgeColor(thread.status)}
                          >
                            {formatStatusLabel(thread.status)}
                          </Badge>
                          <span className="text-xs text-gray-500 mt-1">
                            Last Message: {formatDate(lastMessageDate)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {thread.subject}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {cleanEmailPreview(thread.body_html || thread.body, 100)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="text-gray-400">Created: {formatDate(thread.created_at)}</span>
                        {thread.priority && (
                          <Badge className={getPriorityBadgeColor(thread.priority)} variant="outline">
                            {thread.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.last_page}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Email View */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedThread ? (
            <>
              {loadingThreadDetails ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-600">Loading thread details...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Email Header */}
                  <div className="border-b border-gray-200 bg-white">
                    <div className="p-6">
                      {/* Subject and Actions Row */}
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                          {selectedThread.subject}
                        </h2>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={selectedThread.status}
                            onValueChange={(value: 'open' | 'closed' | 'answered') => {
                              handleStatusUpdate(value);
                            }}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="answered">Answered</SelectItem>
                              <SelectItem value="closed">Close</SelectItem>
                            </SelectContent>
                          </Select>
                          {selectedThread.priority && (
                            <Badge className={getPriorityBadgeColor(selectedThread.priority)} variant="outline">
                              {selectedThread.priority}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setStatusForm({
                                  status: selectedThread.status,
                                  priority: selectedThread.priority || 'medium',
                                  note: ''
                                });
                                setStatusDialogOpen(true);
                              }}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Change Status & Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setNoteDialogOpen(true)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Internal Note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Email Metadata */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-16">From:</span>
                          <span className="text-gray-900">{selectedThread.from_name || selectedThread.from_email}</span>
                          <span className="text-gray-500 ml-1">&lt;{selectedThread.from_email}&gt;</span>
                        </div>
                        {selectedThread.to_email && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-16">To:</span>
                            <span className="text-gray-900">{selectedThread.to_email}</span>
                          </div>
                        )}
                        {selectedThread.cc && (
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 w-16">CC:</span>
                            <span className="text-gray-900">{selectedThread.cc}</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(selectedThread.created_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                        <Button
                          onClick={() => {
                            setIsNewEmail(false);
                            setReplyDialogOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setNoteDialogOpen(true)}
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCannedResponseDialogOpen(true)}
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Canned Response
                        </Button>
                      </div>
                    </div>
                  </div>

              {/* Email Content */}
              <ScrollArea className="flex-1 bg-gray-50">
                <div className="p-6 space-y-4">
                  {/* Show all messages including the first one */}
                  {threadResponses.length > 0 ? (
                    threadResponses.map((response, index) => (
                      <div
                        key={response.id}
                        className={`bg-white rounded-lg border ${
                          response.is_internal
                            ? 'border-yellow-200 bg-yellow-50'
                            : index === 0
                            ? 'border-blue-200 border-2'
                            : 'border-gray-200'
                        } overflow-hidden`}
                      >
                        {/* Email Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {response.is_internal ? (
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm font-semibold text-gray-900">Internal Note</span>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-700">From: </span>
                                    <span className="text-gray-900">{response.from_name || response.from_email}</span>
                                    {response.from_email && (
                                      <span className="text-gray-500"> &lt;{response.from_email}&gt;</span>
                                    )}
                                  </div>
                                  {response.to_email && (
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">To: </span>
                                      <span className="text-gray-900">{response.to_email}</span>
                                    </div>
                                  )}
                                  {response.cc && (
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">CC: </span>
                                      <span className="text-gray-900">{response.cc}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(response.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {index === 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Original
                                </Badge>
                              )}
                              {response.is_internal && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Internal
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="px-6 py-4">
                          <div
                            className="email-content prose prose-sm max-w-none"
                            style={{
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              color: '#374151'
                            }}
                            dangerouslySetInnerHTML={{ __html: response.body_html || response.body }}
                          />
                          
                          {/* Attachments */}
                          {response.attachments && response.attachments.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                <div className="flex items-center space-x-1">
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Attachments:</span>
                                </div>
                                {sortAttachmentsByPriority(response.attachments).map((attachment, idx, sortedAttachments) => (
                                  <React.Fragment key={attachment.id}>
                                    <a
                                      href={attachment.file_path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                      {attachment.filename}
                                    </a>
                                    {idx < sortedAttachments.length - 1 && (
                                      <span className="text-gray-400">,</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback to selectedThread if no responses loaded yet
                    <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                      {/* Email Header */}
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">From: </span>
                                <span className="text-gray-900">{selectedThread.from_name || selectedThread.from_email}</span>
                                <span className="text-gray-500"> &lt;{selectedThread.from_email}&gt;</span>
                              </div>
                              {selectedThread.to_email && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">To: </span>
                                  <span className="text-gray-900">{selectedThread.to_email}</span>
                                </div>
                              )}
                              {selectedThread.cc && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">CC: </span>
                                  <span className="text-gray-900">{selectedThread.cc}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(selectedThread.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Original
                          </Badge>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="px-6 py-4">
                        <div
                          className="email-content prose prose-sm max-w-none"
                          style={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            color: '#374151'
                          }}
                          dangerouslySetInnerHTML={{ __html: selectedThread.body_html || selectedThread.body }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Internal Notes */}
                  {internalNotes.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">Internal Notes</h3>
                      </div>
                      <div className="space-y-3">
                        {internalNotes.map((note) => (
                          <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-yellow-200 bg-yellow-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-yellow-700" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {note.user?.name || 'Unknown User'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {formatDate(note.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="px-4 py-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an email to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={(open) => {
        setReplyDialogOpen(open);
        if (!open) {
          setIsNewEmail(false);
          setReplyForm({
            to_email: '',
            cc: '',
            bcc: '',
            subject: '',
            body: '',
            attachments: []
          });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewEmail ? 'Compose New Email' : 'Reply to Email'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input
                value={replyForm.to_email}
                onChange={(e) => setReplyForm(prev => ({ ...prev, to_email: e.target.value }))}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">CC (optional)</label>
              <Input
                value={replyForm.cc}
                onChange={(e) => setReplyForm(prev => ({ ...prev, cc: e.target.value }))}
                placeholder="cc@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">BCC (optional)</label>
              <Input
                value={replyForm.bcc}
                onChange={(e) => setReplyForm(prev => ({ ...prev, bcc: e.target.value }))}
                placeholder="bcc@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                value={replyForm.subject}
                onChange={(e) => setReplyForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={replyForm.body}
                onChange={(e) => setReplyForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Type your message here..."
                rows={10}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Attachments</label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add Attachment
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {replyForm.attachments.length > 0 && (
                  <div className="space-y-2">
                    {replyForm.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply} className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Internal Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                value={noteForm.note}
                onChange={(e) => setNoteForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Enter internal note..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Thread Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={statusForm.status}
                onValueChange={(value: any) => setStatusForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="closed">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={statusForm.priority}
                onValueChange={(value: any) => setStatusForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Note (optional)</label>
              <Textarea
                value={statusForm.note}
                onChange={(e) => setStatusForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Add a note about this status change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canned Response Dialog */}
      <Dialog open={cannedResponseDialogOpen} onOpenChange={setCannedResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Canned Response</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {cannedResponses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No canned responses available</p>
            ) : (
              <div className="space-y-2">
                {cannedResponses.map((canned) => (
                  <Card
                    key={canned.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleCannedResponseSelect(canned)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{canned.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {canned.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCannedResponseDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailResponsePage;

