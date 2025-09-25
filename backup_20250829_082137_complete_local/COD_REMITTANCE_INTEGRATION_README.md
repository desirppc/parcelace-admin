# COD Remittance Integration

This document describes the integration of the COD Remittance API endpoint with the ParcelAce React application.

## Overview

The COD Remittance module allows users to:
- View all COD remittances with pagination
- Update UTR numbers for pending remittances
- Mark remittances as paid
- Export data in CSV/Excel formats
- Track payment status and due dates

## API Endpoints

### 1. List COD Remittances
**GET** `{{api_url_dev}}api/cod-remittance`

**Headers:**
- `Authorization: Bearer {auth_token}`
- `Content-Type: application/json`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 50)

### 2. Get COD Remittance Details
**GET** `{{api_url_dev}}api/cod-remittance/{id}`

**Headers:**
- `Authorization: Bearer {auth_token}`
- `Content-Type: application/json`

**Path Parameters:**
- `id`: COD remittance ID

## API Response Structure

### 1. List COD Remittances Response
```json
{
  "status": true,
  "message": "COD remittance data retrieved successfully",
  "data": {
    "cod_remittances": [
      {
        "id": 4,
        "reference_id": "ACE3020250708",
        "total_awb": 1,
        "due_date": "08 Jul 2025",
        "total_amount": "42.00",
        "utr_no": null,
        "check_payment": false,
        "utr_date": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "total_page": 1,
      "per_page": 50,
      "total": 1
    }
  },
  "error": null
}
```

### 2. COD Remittance Details Response
```json
{
  "status": true,
  "message": "COD remittance details retrieved successfully",
  "data": {
    "cod_remittance_details": [
      {
        "id": 3,
        "awb": "18045011027725",
        "due_date": "08 Jul 2025",
        "invoice_value": "42.00",
        "utr_no": null,
        "cod_remittance_id": 4,
        "remittance": {
          "id": 4,
          "reference_id": "ACE3020250708"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "total_page": 1,
      "per_page": 50,
      "total": 1
    }
  },
  "error": null
}
```

## Implementation Details

### 1. Service Layer (`src/services/codRemittanceService.ts`)

The service provides the following methods:

- `getCODRemittances(page, perPage)`: Fetch COD remittances with pagination
- `getCODRemittanceById(id)`: Get specific remittance details
- `getCODRemittanceDetails(id)`: Get detailed AWB information for a remittance
- `updateUTRNumber(id, utrNo, utrDate)`: Update UTR number for a remittance
- `markAsPaid(id)`: Mark a remittance as paid
- `exportCODRemittances(format)`: Export data in CSV/Excel format

### 2. Component (`src/components/CODRemittance.tsx`)

The main component features:

- **Real-time data fetching** from the API
- **Dynamic counters** showing total amounts, pending payments, and paid amounts
- **Interactive table** with search and pagination
- **UTR update dialog** for adding/updating UTR numbers
- **Status badges** showing payment status (Pending, UTR Added, Paid)
- **Export functionality** for CSV and Excel formats
- **View details** navigation to detailed AWB information
- **Error handling** with user-friendly error messages
- **Loading states** with spinner indicators

### 3. Enhanced FinanceTable Component

The `FinanceTable` component has been enhanced to support:
- **External pagination** from API responses
- **Custom column rendering** for complex data display
- **Action buttons** for each row
- **Responsive design** for mobile and desktop

### 4. Details Page (`src/pages/CODRemittanceDetails.tsx`)

The details page provides:
- **Comprehensive AWB information** for a specific remittance
- **Summary cards** showing totals, pending UTRs, and completed UTRs
- **Detailed table** with all AWB entries and their status
- **Export functionality** for detailed data
- **Navigation** back to the main COD remittance list
- **Real-time data** fetched from the API endpoint

## Features

### Dashboard Counters
- **Total COD Remittances**: Sum of all remittance amounts
- **Pending Payments**: Sum of unpaid remittance amounts
- **Paid Amount**: Sum of completed payment amounts
- **Total AWB Count**: Count of all AWB numbers

### Table Actions
- **Update UTR**: Add or modify UTR numbers for pending remittances
- **Mark as Paid**: Mark completed payments
- **View Details**: Navigate to detailed AWB information page

### Status Indicators
- **Pending** (Yellow): No UTR number or payment confirmation
- **UTR Added** (Blue): UTR number provided but payment not confirmed
- **Paid** (Green): Payment confirmed and completed

## Usage

### Basic Usage

```tsx
import CODRemittance from '@/components/CODRemittance';

function FinancePage() {
  return (
    <div>
      <h1>Finance Dashboard</h1>
      <CODRemittance />
    </div>
  );
}
```

### Service Usage

```tsx
import CODRemittanceService from '@/services/codRemittanceService';

// Fetch remittances
const response = await CODRemittanceService.getCODRemittances(1, 20);

// Get detailed AWB information
const detailsResponse = await CODRemittanceService.getCODRemittanceDetails(remittanceId);

// Update UTR number
const updateResponse = await CODRemittanceService.updateUTRNumber(
  remittanceId, 
  'UTR123456789', 
  '2025-07-08'
);

// Mark as paid
const paidResponse = await CODRemittanceService.markAsPaid(remittanceId);
```

## Configuration

### Environment Variables

Ensure the following environment variables are set:

```env
VITE_API_URL=http://localhost:8080/
```

### API Configuration

The endpoint is configured in `src/config/api.ts`:

```typescript
COD_REMITTANCE: 'api/cod-remittance'
```

## Testing

Use the test utility in `src/utils/testCODRemittance.ts`:

```typescript
import { testCODRemittanceService } from '@/utils/testCODRemittance';

// Test the service
testCODRemittanceService();
```

## Error Handling

The component handles various error scenarios:

- **Network errors**: Displayed with retry button
- **API errors**: Shown with specific error messages
- **Validation errors**: Form validation for UTR updates
- **Loading states**: Spinner indicators during API calls

## Future Enhancements

- **Bulk operations**: Select multiple remittances for batch updates
- **Advanced filtering**: Filter by date range, amount, status
- **Real-time updates**: WebSocket integration for live data
- **Audit trail**: Track all changes and updates
- **Notifications**: Alert users about due dates and payments
- **Mobile app**: Native mobile application support

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure `auth_token` is valid and not expired
2. **CORS Error**: Check if the API server allows requests from your domain
3. **Data Not Loading**: Verify the API endpoint is accessible and returning data
4. **Pagination Issues**: Check if the pagination parameters are correctly formatted

### Debug Mode

Enable debug logging by setting the environment to development:

```typescript
// The component automatically logs API calls in development mode
console.log('API Request:', endpoint, method, data);
```

## Dependencies

- **React**: Core framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Shadcn/ui**: UI components
- **Lucide React**: Icons
- **React Hook Form**: Form handling (if implemented)

## Support

For issues or questions regarding the COD Remittance integration:

1. Check the browser console for error messages
2. Verify API endpoint accessibility
3. Confirm authentication token validity
4. Review network tab for failed requests
5. Check server logs for backend errors

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Author**: ParcelAce Development Team
