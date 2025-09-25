
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, MessageSquare, Calendar, User } from 'lucide-react';
import { SupportTicket } from '@/types/support';
import TicketStatusBadge from './TicketStatusBadge';
import PrioritySelector from './PrioritySelector';

interface TicketListProps {
  onTicketSelect: (ticket: SupportTicket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ onTicketSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    }
  ];

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.awbNumbers.some(awb => awb.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Tickets
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 cursor-pointer"
                    onClick={() => onTicketSelect(ticket)}
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
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ticket.createdAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ticket.updatedAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTicketSelect(ticket);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTicketSelect(ticket);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50" />
                <p>No tickets found matching your search criteria.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketList;
