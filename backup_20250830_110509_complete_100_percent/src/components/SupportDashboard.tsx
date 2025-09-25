
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import SupportCounter from './SupportCounter';
import TicketStatusBadge from './TicketStatusBadge';
import PrioritySelector from './PrioritySelector';
import CreateTicket from './CreateTicket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupportTicket } from '@/types/support';
import supportService from '@/services/supportService';

const SupportDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, awaitingResponse: 0, overdue: 0, resolvedWithinSLA: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await supportService.getSupportTickets();
      
      // Check if response has data and tickets array
      const apiTickets = response?.data?.tickets && Array.isArray(response.data.tickets) ? response.data.tickets : [];
      
      if (apiTickets.length === 0) {
        setStats({ open: 0, inProgress: 0, awaitingResponse: 0, overdue: 0, resolvedWithinSLA: 0 });
        setTickets([]);
        return;
      }
      
      setStats(supportService.calculateStats(apiTickets));
      const transformed = apiTickets.map((t: any) => supportService.transformTicketForFrontend(t));
      setTickets(transformed);
    } catch (error) {
      // Set default stats and empty tickets on error
      setStats({ open: 0, inProgress: 0, awaitingResponse: 0, overdue: 0, resolvedWithinSLA: 0 });
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const handler = () => fetchTickets();
    window.addEventListener('supportTicketCreated', handler as EventListener);
    return () => window.removeEventListener('supportTicketCreated', handler as EventListener);
  }, []);

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.awbNumbers.some(awb => awb.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filteredTickets.slice(startIdx, startIdx + pageSize);

  const formatDate = (value: any): string => {
    if (!value) return '-';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'string') {
      // API returns formats like "08 Aug 2025 05:52 AM"; take only the date parts
      const parts = value.split(' ');
      if (parts.length >= 3) return parts.slice(0, 3).join(' ');
      // ISO fallback
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return value;
    }
    return String(value);
  };

  const [open, setOpen] = useState(false);

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <CreateTicket 
              hideHeader 
              onSuccess={() => {
                setOpen(false); // Close the popup
                fetchTickets(); // Reload tickets data
              }} 
            />
          </DialogContent>
        </Dialog>
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
                  
                  <TableHead>Status</TableHead>
                  <TableHead>AWB Numbers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expected Closure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-muted-foreground">Loading tickets...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                 ) : pageItems.map((ticket) => (
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
                    <TableCell className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(ticket.expectedClosureDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!isLoading && filteredTickets.length === 0 && (
            <div className="text-center py-8">
              {tickets.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-muted-foreground text-lg">
                    No support tickets found
                  </div>
                  <div className="text-sm text-muted-foreground">
                    You haven't created any support tickets yet. Create your first ticket to get started.
                  </div>
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:from-pink-600 hover:via-purple-600 hover:to-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  No tickets found matching your search criteria.
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && filteredTickets.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing {startIdx + 1}-{Math.min(startIdx + pageSize, totalItems)} of {totalItems}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Rows:</label>
                <select
                  className="border rounded px-2 py-1 bg-background"
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(1)}>First</Button>
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                  <div className="text-sm">Page {currentPage} of {totalPages}</div>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                  <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>Last</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDashboard;
