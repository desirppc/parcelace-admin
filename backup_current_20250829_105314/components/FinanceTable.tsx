
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface FinanceTableProps {
  title: string;
  data: any[];
  columns: Column[];
  searchPlaceholder?: string;
  showDateFilter?: boolean;
  showExport?: boolean;
  itemsPerPage?: number;
  pagination?: {
    current_page: number;
    last_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  useExternalPagination?: boolean;
}

const FinanceTable = ({ 
  title, 
  data, 
  columns, 
  searchPlaceholder = "Search...", 
  showDateFilter = true,
  showExport = true,
  itemsPerPage = 10,
  pagination,
  onPageChange,
  useExternalPagination = false
}: FinanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = useExternalPagination && pagination ? pagination.last_page : Math.ceil(filteredData.length / itemsPerPageState);
  const startIndex = useExternalPagination && pagination ? (pagination.current_page - 1) * pagination.per_page : (currentPage - 1) * itemsPerPageState;
  const paginatedData = useExternalPagination ? data : filteredData.slice(startIndex, startIndex + itemsPerPageState);
  
  // Use external pagination values when available
  const currentPageValue = useExternalPagination && pagination ? pagination.current_page : currentPage;
  const totalEntries = useExternalPagination && pagination ? pagination.total : filteredData.length;
  const showingFrom = startIndex + 1;
  const showingTo = useExternalPagination && pagination 
    ? Math.min(startIndex + pagination.per_page, pagination.total)
    : Math.min(startIndex + itemsPerPageState, filteredData.length);

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting data:', filteredData);
    // In real implementation, you would generate CSV/Excel file
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            {/* Date Filter */}
            {showDateFilter && (
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Date Filter
              </Button>
            )}
            
            {/* Export */}
            {showExport && (
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Items per page selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={itemsPerPageState}
              onChange={(e) => {
                setItemsPerPageState(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-input bg-background rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {showingFrom} to {showingTo} of {totalEntries} entries
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow 
                  key={index}
                  className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (useExternalPagination && onPageChange) {
                  onPageChange(currentPageValue - 1);
                } else {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }
              }}
              disabled={currentPageValue === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPageValue <= 3 ? i + 1 : currentPageValue - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPageValue === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (useExternalPagination && onPageChange) {
                        onPageChange(pageNum);
                      } else {
                        setCurrentPage(pageNum);
                      }
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (useExternalPagination && onPageChange) {
                  onPageChange(currentPageValue + 1);
                } else {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }
              }}
              disabled={currentPageValue === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceTable;
