import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supportTicketService } from '@/services/supportTicketService';
import { 
  SupportTicket, 
  SupportTicketPagination, 
  SupportTicketFilters 
} from '@/types/supportTicket';
import { useUser } from '@/contexts/UserContext';
import { hasRole } from '@/utils/roleUtils';
import AssignTicketDialog from './AssignTicketDialog';
import UpdateStatusDialog from './UpdateStatusDialog';
import { MultiSelectFilter } from './MultiSelectFilter';

const SupportTicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState<SupportTicketPagination>({
    current_page: 1,
    last_page: 1,
    total_page: 1,
    per_page: 50,
    total: 0
  });
  const [ticketCounts, setTicketCounts] = useState({
    open: 0,
    inProgress: 0,
    awaitingResponse: 0,
    overdue: 0,
    resolvedWithinSLA: 0
  });
  const [filters, setFilters] = useState<SupportTicketFilters>({
    page: 1,
    per_page: 50
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const { toast } = useToast();
  const { user } = useUser();

  // Check if user is superadmin (only superadmin can assign tickets)
  const isSuperAdmin = user ? hasRole(user, 'superadmin') : false;

  // Fallback check - also check user_role field if roles array is not available
  const isSuperAdminFallback = user?.user_role === 'superadmin' || user?.roles?.some(role => role.name === 'superadmin');

  // Use the more comprehensive check
  const finalIsSuperAdmin = isSuperAdmin || isSuperAdminFallback;

  // Load tickets and counts on component mount
  useEffect(() => {
    loadTickets();
    loadTicketCounts();
  }, []);

  // Load tickets when filters change
  useEffect(() => {
    loadTickets();
  }, [filters]);

  // Reload tickets when multi-select values change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
    // loadTickets will be called by the filters useEffect
  }, [selectedStatuses, selectedPriorities]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      // Load all tickets first (or use current filters if API supports it)
      const baseFilters = { ...filters };
      // Remove status and priority from base filters as we'll filter client-side
      delete baseFilters.status;
      delete baseFilters.priority;
      
      const response = await supportTicketService.getSupportTickets({ ...baseFilters, per_page: 1000 });
      if (response.status) {
        let filteredTickets = response.data.tickets;
        
        // Apply client-side filtering for multi-select
        if (selectedStatuses.length > 0) {
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.status && selectedStatuses.includes(ticket.status)
          );
        }
        
        if (selectedPriorities.length > 0) {
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.priority && selectedPriorities.includes(ticket.priority)
          );
        }
        
        // Apply other filters (search, category) if they exist
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTickets = filteredTickets.filter(ticket =>
            ticket.id.toString().includes(searchLower) ||
            ticket.user.name.toLowerCase().includes(searchLower) ||
            ticket.user.email.toLowerCase().includes(searchLower) ||
            ticket.remark.toLowerCase().includes(searchLower) ||
            ticket.details.some(detail => detail.awb.toLowerCase().includes(searchLower))
          );
        }
        
        if (filters.category) {
          filteredTickets = filteredTickets.filter(ticket => ticket.category === filters.category);
        }
        
        // Update pagination based on filtered results
        const total = filteredTickets.length;
        const perPage = filters.per_page || 50;
        const currentPage = filters.page || 1;
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
        
        setAllTickets(filteredTickets);
        setTickets(paginatedTickets);
        setPagination({
          current_page: currentPage,
          last_page: Math.ceil(total / perPage),
          total_page: Math.ceil(total / perPage),
          per_page: perPage,
          total: total
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load support tickets",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentComplete = () => {
    // Reload tickets after assignment
    loadTickets();
  };

  const handleStatusUpdate = () => {
    // Reload tickets after status update
    loadTickets();
  };

  const loadTicketCounts = async () => {
    try {
      const counts = await supportTicketService.getSupportTicketCounts();
      setTicketCounts(counts);
    } catch (error) {
      console.error('Error loading ticket counts:', error);
    }
  };

  const handleCreateTicket = () => {
    toast({
      title: "Create Ticket",
      description: "Ticket creation functionality will be implemented soon.",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1 // Reset to first page when searching
    }));
  };

  const handleFilter = () => {
    setShowFilters(!showFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleFilterChange = (key: keyof SupportTicketFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1 // Reset to first page when filtering
    }));
  };

  const applyFilters = () => {
    toast({
      title: "Filters Applied",
      description: "Ticket filters have been applied successfully.",
    });
    setShowFilters(false);
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'awaiting-response':
        return 'outline';
      case 'resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'in-progress':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'awaiting-response':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'resolved':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return '';
    }
  };

  const getPriorityBadgeColor = (priority: string | null) => {
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

  const getPriorityBarColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gradient-to-b from-red-500 to-red-600';
      case 'high':
        return 'bg-gradient-to-b from-orange-500 to-orange-600';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `almost ${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch {
      return dateString;
    }
  };

  const formatDateAbsolute = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatStatusLabel = (status: string | null) => {
    if (!status) return 'Open';
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            Support Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage and track your support tickets</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleCreateTicket}
            className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Open Tickets */}
        <Card className="relative overflow-hidden bg-blue-50 border-blue-200">
          <div className="absolute top-4 right-4">
            <MessageCircle className="w-6 h-6 text-blue-500" />
          </div>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{ticketCounts.open}</div>
            <p className="text-sm text-gray-600">Open Tickets</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="relative overflow-hidden bg-orange-50 border-orange-200">
          <div className="absolute top-4 right-4">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">{ticketCounts.inProgress}</div>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>

        {/* Awaiting Response */}
        <Card className="relative overflow-hidden bg-purple-50 border-purple-200">
          <div className="absolute top-4 right-4">
            <MessageCircle className="w-6 h-6 text-purple-500" />
          </div>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">{ticketCounts.awaitingResponse}</div>
            <p className="text-sm text-gray-600">Awaiting Response</p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="relative overflow-hidden bg-red-50 border-red-200">
          <div className="absolute top-4 right-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{ticketCounts.overdue}</div>
            <p className="text-sm text-gray-600">Overdue</p>
          </CardContent>
        </Card>

        {/* Resolved within SLA */}
        <Card className="relative overflow-hidden bg-green-50 border-green-200">
          <div className="absolute top-4 right-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{ticketCounts.resolvedWithinSLA}</div>
            <p className="text-sm text-gray-600">Resolved within SLA</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets Section */}
      <div className="flex flex-col border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden flex-1 min-h-0">
        {/* Section Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tickets</h2>
          
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ticket ID, AWB, or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleFilter}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Panel (shown when showFilters is true) */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Filter:</span>
              </div>
              
              <MultiSelectFilter
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'awaiting-response', label: 'Awaiting Response' },
                  { value: 'resolved', label: 'Resolved' }
                ]}
                selectedValues={selectedStatuses}
                onValueChange={setSelectedStatuses}
                placeholder="All Status"
                className="w-32"
              />

              <MultiSelectFilter
                options={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
                selectedValues={selectedPriorities}
                onValueChange={setSelectedPriorities}
                placeholder="All Priority"
                className="w-32"
              />
            </div>
          </div>
        )}

        {/* Ticket List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="text-gray-600">Loading tickets...</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No support tickets found</h3>
              <p className="text-sm text-gray-600 mb-6">
                You haven't created any support tickets yet. Create your first ticket to get started.
              </p>
              <Button
                onClick={handleCreateTicket}
                className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="w-full p-6">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AWB Numbers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expected Closure</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const ticketSubject = ticket.remark || `${ticket.category} - ${ticket.sub_category}`;
                  const awbNumbers = ticket.details?.map(d => d.awb).join(', ') || 'N/A';
                  
                  return (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold">TKT-{String(ticket.id).padStart(3, '0')}</TableCell>
                      <TableCell className="max-w-xs truncate" title={ticketSubject}>
                        {ticketSubject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(ticket.status)}
                          className={`${getStatusBadgeColor(ticket.status)} text-xs`}
                        >
                          {formatStatusLabel(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-gray-600" title={awbNumbers}>
                        {awbNumbers}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateAbsolute(ticket.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateAbsolute(ticket.expected_closure_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {finalIsSuperAdmin && (
                            <AssignTicketDialog
                              ticketId={ticket.id}
                              onAssignmentComplete={handleAssignmentComplete}
                            />
                          )}
                          <UpdateStatusDialog
                            ticketId={ticket.id}
                            currentStatus={ticket.status}
                            currentPriority={ticket.priority}
                            currentExpectedClosureDate={ticket.expected_closure_date}
                            currentCloseDate={ticket.close_date}
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} tickets
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.current_page - 2) + i;
                    if (pageNum > pagination.last_page) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pageNum === pagination.current_page ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
