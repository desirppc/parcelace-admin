import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: any[];
  includeHeaders?: boolean;
}

export class ExcelExportService {
  /**
   * Export data to Excel file
   */
  static exportToExcel(options: ExportOptions): void {
    try {
      // Transform data according to columns
      const exportData = options.data.map(row => {
        const transformedRow: any = {};
        options.columns.forEach(column => {
          let value = row[column.key];
          
          // Apply custom formatting if provided
          if (column.format && value !== undefined && value !== null) {
            value = column.format(value);
          }
          
          transformedRow[column.header] = value;
        });
        return transformedRow;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: options.columns.map(col => col.header)
      });

      // Set column widths if provided
      if (options.columns.some(col => col.width)) {
        const colWidths: XLSX.ColInfo[] = options.columns.map((col, index) => ({
          wch: col.width || 15,
          wpx: (col.width || 15) * 7
        }));
        worksheet['!cols'] = colWidths;
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download file
      saveAs(blob, `${options.filename}.xlsx`);
      
      console.log(`Excel file exported: ${options.filename}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export data to Excel');
    }
  }

  /**
   * Format currency values
   */
  static formatCurrency(value: number): string {
    return `₹${value.toLocaleString()}`;
  }

  /**
   * Format date values
   */
  static formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  }

  /**
   * Format datetime values
   */
  static formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN');
  }

  /**
   * Format status with colors (for future use)
   */
  static formatStatus(status: string): string {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || '';
  }

  /**
   * Format amount with proper decimal places
   */
  static formatAmount(amount: number): string {
    return amount?.toFixed(2) || '0.00';
  }
} 