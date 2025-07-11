
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import SupportCounter from './SupportCounter';
import TicketStatusBadge from './TicketStatusBadge';
import PrioritySelector from './PrioritySelector';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupportTicket } from '@/types/support';

const SupportDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for tickets
  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-2024-001',
      category: 'Pickup & Delivery Related',
      subCategory: 'Delay in Pickup',
      priority: 'high',
      status: 'open',
      awbNumbers: ['AWB123456789', 'AWB987654321'],
      subject: 'Pickup not happening for multiple orders',
      description: 'My orders are not being picked up for the last 2 days. This is affecting my business.',
      attachments: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      expectedClosureDate: new Date('2024-01-17'),
      customerEmail: 'customer@example.com',
      messages: []
    },
    {
      id: '2',
      ticketNumber: 'TKT-2024-002',
      category: 'Finance',
      subCategory: 'Delay in COD Remittance',
      priority: 'medium',
      status: 'in-progress',
      awbNumbers: ['AWB555666777'],
      subject: 'COD payment not received',
      description: 'COD amount not credited to my account after delivery confirmation.',
      attachments: [],
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-15'),
      expectedClosureDate: new Date('2024-01-18'),
      customerEmail: 'customer@example.com',
      assignedAgent: 'Agent Smith',
      messages: []
    },
    {
      id: '3',
      ticketNumber: 'TKT-2024-003',
      category: 'Shipment NDR and RTO',
      subCategory: 'Fake NDR Remarks',
      priority: 'high',
      status: 'awaiting-response',
      awbNumbers: ['AWB111222333'],
      subject: 'False NDR marked by delivery partner',
      description: 'Customer was available but delivery partner marked as address not found.',
      attachments: [],
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-14'),
      expectedClosureDate: new Date('2024-01-16'),
      customerEmail: 'customer@example.com',
      assignedAgent: 'Agent Johnson',
      messages: []
    },
    {
      id: '4',
      ticketNumber: 'TKT-2024-004',
      category: 'Technical Support',
      subCategory: 'API Integration Issues',
      priority: 'low',
      status: 'resolved',
      awbNumbers: [],
      subject: 'API rate limiting issues',
      description: 'Getting 429 errors when trying to create bulk orders via API.',
      attachments: [],
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-14'),
      expectedClosureDate: new Date('2024-01-15'),
      customerEmail: 'customer@example.com',
      assignedAgent: 'Agent Wilson',
      messages: []
    },
    {
      id: '5',
      ticketNumber: 'TKT-2024-005',
      category: 'Claims',
      subCategory: 'Damage Claims',
      priority: 'medium',
      status: 'closed',
      awbNumbers: ['AWB444555666'],
      subject: 'Product damaged during transit',
      description: 'Customer received damaged product. Need insurance claim.',
      attachments: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-13'),
      expectedClosureDate: new Date('2024-01-15'),
      customerEmail: 'customer@example.com',
      assignedAgent: 'Agent Davis',
      messages: []
    }
  ];

  const stats = {
    open: mockTickets.filter(t => t.status === 'open').length,
    inProgress: mockTickets.filter(t => t.status === 'in-progress').length,
    awaitingResponse: mockTickets.filter(t => t.status === 'awaiting-response').length,
    overdue: mockTickets.filter(t => new Date() > t.expectedClosureDate && !['resolved', 'closed'].includes(t.status)).length,
    resolvedWithinSLA: mockTickets.filter(t => t.status === 'resolved').length
  };

  const filteredTickets = mockTickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.awbNumbers.some(awb => awb.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Support Dashboard
          </h1>
          <p className="text-muted-foreground">Manage and track your support tickets</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Statistics Cards */}
      <SupportCounter stats={stats} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket ID, AWB, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-purple-200/50 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <Button variant="outline" className="border-purple-200/50 dark:border-purple-800/50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tickets Table */}
          <div className="border rounded-lg border-purple-200/30 dark:border-purple-800/30">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-blue-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:via-blue-900/20 dark:hover:to-pink-900/20 transition-all duration-300">
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AWB Numbers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expected Closure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-blue-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:via-blue-900/20 dark:hover:to-pink-900/20 transition-all duration-300 cursor-pointer"
                  >
                    <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{ticket.category}</div>
                        <div className="text-muted-foreground text-xs">{ticket.subCategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PrioritySelector 
                        value={ticket.priority} 
                        onValueChange={() => {}} 
                        disabled 
                      />
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {ticket.awbNumbers.slice(0, 2).map((awb) => (
                          <div key={awb} className="text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                            {awb}
                          </div>
                        ))}
                        {ticket.awbNumbers.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{ticket.awbNumbers.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.expectedClosureDate.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tickets found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDashboard;
