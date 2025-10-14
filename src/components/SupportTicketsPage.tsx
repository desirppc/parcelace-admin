import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const SupportTicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Mock data for ticket counts - these would come from API
  const ticketCounts = {
    open: 0,
    inProgress: 0,
    awaitingResponse: 0,
    overdue: 0,
    resolvedWithinSLA: 0
  };

  // Mock data for tickets - this would come from API
  const tickets: any[] = [];

  // Mock ticket data structure for future use
  const mockTicket = {
    id: 'TKT-001',
    subject: 'Shipment tracking issue',
    category: 'Technical',
    status: 'open',
    awbNumbers: 'AWB123456789',
    created: '2024-01-15',
    expectedClosure: '2024-01-17',
    priority: 'High',
    description: 'Customer unable to track their shipment',
    assignedTo: 'Support Team',
    lastUpdated: '2024-01-15 10:30 AM'
  };

  const handleCreateTicket = () => {
    toast({
      title: "Create Ticket",
      description: "Ticket creation functionality will be implemented soon.",
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implement search functionality
  };

  const handleFilter = () => {
    setShowFilters(!showFilters);
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
        </div>
        <Button 
          onClick={handleCreateTicket}
          className="bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
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
                  <select className="w-full p-2 border border-blue-300 rounded-md bg-white">
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="awaiting-response">Awaiting Response</option>
                    <option value="overdue">Overdue</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-2 block">Category</label>
                  <select className="w-full p-2 border border-blue-300 rounded-md bg-white">
                    <option value="">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="shipping">Shipping</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-2 block">Priority</label>
                  <select className="w-full p-2 border border-blue-300 rounded-md bg-white">
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
                  onClick={() => {
                    toast({
                      title: "Filters Applied",
                      description: "Ticket filters have been applied successfully.",
                    });
                    setShowFilters(false);
                  }}
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
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AWB Numbers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expected Closure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Loading tickets...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
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
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={ticket.status === 'open' ? 'default' : 'secondary'}
                        className={
                          ticket.status === 'open' 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                            : ''
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.awbNumbers}</TableCell>
                    <TableCell>{ticket.created}</TableCell>
                    <TableCell>{ticket.expectedClosure}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default SupportTicketsPage;
