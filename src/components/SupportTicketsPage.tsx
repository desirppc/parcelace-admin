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
  ChevronRight
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
  const { toast } = useToast();
  const { user } = useUser();

  // Check if user is superadmin (only superadmin can assign tickets)
  const isSuperAdmin = user ? hasRole(user, 'superadmin') : false;

  // Fallback check - also check user_role field if roles array is not available
  const isSuperAdminFallback = user?.user_role === 'superadmin' || user?.roles?.some(role => role.name === 'superadmin');

  // Use the more comprehensive check
  const finalIsSuperAdmin = isSuperAdmin || isSuperAdminFallback;

  // Debug logging
  console.log('🔍 SupportTicketsPage Debug:', {
    user: user,
    userRoles: user?.roles,
    userRole: user?.user_role,
    isSuperAdmin: isSuperAdmin,
    isSuperAdminFallback: isSuperAdminFallback,
    finalIsSuperAdmin: finalIsSuperAdmin,
    hasRoleCheck: user ? hasRole(user, 'superadmin') : false
  });

  // Load tickets and counts on component mount
  useEffect(() => {
    loadTickets();
    loadTicketCounts();
  }, []);

  // Load tickets when filters change
  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await supportTicketService.getSupportTickets(filters);
      if (response.status) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            Support Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage and track your support tickets</p>
          {/* Debug info - remove this after testing */}
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 shadow-sm">
            <div className="font-semibold text-amber-900 mb-1">Debug Information:</div>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">User:</span> {user?.name || 'Not loaded'}</div>
              <div><span className="font-medium">Roles:</span> {user?.roles?.map(r => r.name).join(', ') || 'No roles'}</div>
              <div><span className="font-medium">User Role:</span> {user?.user_role || 'None'}</div>
              <div><span className="font-medium">Is SuperAdmin:</span> <span className={`font-bold ${finalIsSuperAdmin ? 'text-green-600' : 'text-red-600'}`}>{finalIsSuperAdmin ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleCreateTicket}
            className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
          {/* Debug button - remove after testing */}
          <Button 
            onClick={() => {
              console.log('🔍 Manual Role Check:', {
                user: user,
                roles: user?.roles,
                userRole: user?.user_role,
                finalIsSuperAdmin: finalIsSuperAdmin
              });
              toast({
                title: "Role Check",
                description: `Is SuperAdmin: ${finalIsSuperAdmin ? 'Yes' : 'No'}`,
              });
            }}
            variant="outline"
            className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300"
          >
            Test Role
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
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Tickets</h2>
        
        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by ticket ID, AWB, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Filter Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-2 block">Status</label>
                  <select 
                    className="w-full p-2 border border-blue-300 rounded-md bg-white"
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="awaiting-response">Awaiting Response</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-2 block">Category</label>
                  <select 
                    className="w-full p-2 border border-blue-300 rounded-md bg-white"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Billing">Billing</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-2 block">Priority</label>
                  <select 
                    className="w-full p-2 border border-blue-300 rounded-md bg-white"
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AWB Numbers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expected Closure</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Loading tickets...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="space-y-4">
                      <div className="text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets found</h3>
                        <p className="text-gray-600 mb-6">
                          You haven't created any support tickets yet. Create your first ticket to get started.
                        </p>
                        <Button 
                          onClick={handleCreateTicket}
                          size="lg"
                          className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white shadow-lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Ticket
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">#{ticket.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.user.name}</div>
                        <div className="text-sm text-gray-500">{ticket.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.sub_category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(ticket.status)}
                        className={getStatusBadgeColor(ticket.status)}
                      >
                        {ticket.status || 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {ticket.details.map((detail, index) => (
                          <div key={index} className="text-sm font-mono">
                            {detail.awb}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.created_at}</TableCell>
                    <TableCell>{ticket.expected_closure_date || 'Not set'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* Only superadmin can assign tickets */}
                        {finalIsSuperAdmin && (
                          <AssignTicketDialog
                            ticketId={ticket.id}
                            onAssignmentComplete={handleAssignmentComplete}
                          />
                        )}
                        {/* Both superadmin and support can update status */}
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
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {pagination.total > 0 && (
          <Card>
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
