# Bulk Order Booking Implementation

This document describes the implementation of bulk order booking functionality in the CourierChoiceHub component.

## Overview

The bulk booking system allows users to:
1. Select multiple orders
2. Create a bulk booking request to get a UUID
3. Fetch courier rates using the UUID
4. Apply bulk courier selection to all selected orders

## API Endpoints

### 1. Create Bulk Booking Request
- **Endpoint**: `POST /api/shipments/bulk-booking-request`
- **Request Body**:
```json
{
  "warehouse_id": "17",
  "rto_id": "17",
  "order_ids": ["5890", "5891"]
}
```
- **Response**:
```json
{
  "uuId": "3823b01d-bd45-4fa2-bd2b-9c21970e06a1"
}
```

### 2. Get Bulk Booking Rates
- **Endpoint**: `POST /api/shipments/get-bulk-booking-rates`
- **Request Body**:
```json
{
  "uuId": "3823b01d-bd45-4fa2-bd2b-9c21970e06a1"
}
```
- **Response**: Courier partner rates for each order

## Implementation Details

### Files Modified

1. **`src/config/api.ts`**
   - Added new API endpoints for bulk booking

2. **`src/services/shipmentService.ts`**
   - Added `createBulkBookingRequest()` function
   - Added `getBulkBookingRates()` function

3. **`src/pages/CourierChoiceHub.tsx`**
   - Integrated real API calls with existing UI
   - Added bulk booking workflow
   - Added real-time courier rate fetching
   - Enhanced UI with process status indicators

4. **`src/utils/testBulkBooking.ts`**
   - Test utilities for development and debugging

### Key Features

#### 1. Two-Step Process
- **Step 1**: Create bulk booking request → Get UUID
- **Step 2**: Fetch rates → Apply courier selection

#### 2. Real-Time Data Integration
- Automatically fetches courier rates when bulk booking request is created
- Updates courier options based on real API data
- Falls back to mock data when real data is unavailable

#### 3. Enhanced UI
- Process status indicators showing current step
- Debug information panel (development only)
- Refresh rates functionality
- Clear visual feedback for each step

#### 4. Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages
- Graceful fallbacks to mock data

## Usage

### Basic Workflow

1. **Select Orders**: Use checkboxes to select multiple orders
2. **Create Request**: Click "Create Bulk Booking Request" button
3. **Wait for Rates**: System automatically fetches courier rates
4. **Select Courier**: Choose preferred courier partner
5. **Apply Action**: Click "Apply Bulk Action" to assign courier to all orders

### Development Testing

Use the test utilities in browser console:

```javascript
// Test complete flow
await window.testBulkBooking.testBulkBookingFlow();

// Test individual functions
await window.testBulkBooking.testCreateBulkBookingRequest();
await window.testBulkBooking.testGetBulkBookingRates("your-uuid-here");
```

## Configuration

### Warehouse and RTO IDs
- **Warehouse ID**: Currently hardcoded to "17"
- **RTO ID**: Currently hardcoded to "17"
- These can be made configurable through props or environment variables

### API Base URL
- Configured in `src/config/api.ts`
- Uses environment-based configuration

## State Management

### Key State Variables

```typescript
const [orders, setOrders] = useState<any[]>([]);
const [courierRates, setCourierRates] = useState<Record<string, CourierPartnerRate[]>>({});
const [bulkBookingUuid, setBulkBookingUuid] = useState<string>("");
const [isCreatingBulkRequest, setIsCreatingBulkRequest] = useState(false);
const [isLoadingRates, setIsLoadingRates] = useState(false);
```

### Data Flow

1. **Orders Selection** → `bulkSelectedOrderIds`
2. **Bulk Request Creation** → `bulkBookingUuid`
3. **Rates Fetching** → `courierRates`
4. **Courier Selection** → `selectedCouriers`

## Error Scenarios

### Common Issues

1. **Authentication Failure**
   - Check if auth token is valid
   - Verify token expiration

2. **API Errors**
   - Network connectivity issues
   - Server-side errors
   - Invalid request parameters

3. **Data Processing Errors**
   - Malformed API responses
   - Missing required fields

### Fallback Behavior

- Mock data used when real data unavailable
- Graceful degradation of functionality
- User notifications for errors

## Future Enhancements

### Planned Features

1. **Real Orders Integration**
   - Replace mock orders with real API data
   - Dynamic order loading and pagination

2. **Advanced Rate Processing**
   - Better handling of complex rate structures
   - Rate comparison and optimization

3. **Bulk Actions**
   - Multiple courier selection strategies
   - Cost optimization algorithms

4. **Performance Improvements**
   - Caching of courier rates
   - Optimistic updates
   - Background data refresh

## Troubleshooting

### Debug Information

In development mode, a debug panel shows:
- Selected orders count
- Warehouse and RTO IDs
- Bulk booking UUID
- Courier rates status
- Selected couriers count

### Console Logging

Comprehensive logging for:
- API requests and responses
- State changes
- Error conditions
- User interactions

### Common Fixes

1. **Rates Not Loading**
   - Check if UUID is valid
   - Verify API endpoint accessibility
   - Check authentication token

2. **UI Not Updating**
   - Verify state dependencies
   - Check useEffect dependencies
   - Verify data structure

3. **API Errors**
   - Check network connectivity
   - Verify API endpoint URLs
   - Check request payload format

## Support

For issues or questions:
1. Check console logs for error details
2. Use debug panel for state information
3. Verify API endpoint accessibility
4. Check authentication status
