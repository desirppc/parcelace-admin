# Shipment Cancel API Implementation

This document describes the implementation of the shipment cancel API for both single and bulk AWB cancellation in the ParcelAce React application.

## 🚀 Features

- **Single Shipment Cancellation**: Cancel individual shipments by AWB number
- **Bulk Shipment Cancellation**: Cancel multiple shipments at once
- **Confirmation Dialogs**: User-friendly confirmation before cancellation
- **Real-time Updates**: Immediate UI updates after successful cancellation
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Visual feedback during API calls

## 🔗 API Endpoints

### Single Shipment Cancel
```
POST {{api_url_dev}}/api/shipments/cancel
```

**Request Body:**
```json
{
  "awb": "18045011180841"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipment cancelled successfully",
  "data": { ... }
}
```

### Bulk Shipment Cancel
```
POST {{api_url_dev}}/api/shipments/cancel
```

**Request Body:**
```json
{
  "awb": ["18045011180841", "18045011180842", "18045011180843"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Shipments cancelled successfully",
  "data": { ... },
  "failed_awbs": []
}
```

## 🏗️ Implementation Details

### 1. API Configuration
- **File**: `src/config/api.ts`
- **Endpoint**: `SHIPMENT_CANCEL: 'api/shipments/cancel'`

### 2. Service Layer
- **File**: `src/services/shipmentService.ts`
- **Methods**:
  - `cancelShipment(awb: string)`: Single shipment cancellation
  - `cancelBulkShipments(awbs: string[])`: Bulk shipment cancellation

### 3. UI Components
- **File**: `src/components/ShipmentPage.tsx`
- **Features**:
  - Individual cancel button in actions column
  - Bulk cancel button in bulk actions section
  - Confirmation dialogs for both single and bulk operations
  - Loading states and error handling

## 📱 User Interface

### Single Shipment Cancellation
1. User clicks the cancel button (X icon) in the actions column
2. Confirmation dialog appears with AWB number
3. User confirms cancellation
4. Loading state shows during API call
5. Success/error toast notification appears
6. Shipment status updates to "cancelled" in the table

### Bulk Shipment Cancellation
1. User selects multiple shipments using checkboxes
2. User clicks the "Cancel" button in bulk actions section
3. Confirmation dialog appears with count of selected shipments
4. User confirms bulk cancellation
5. Loading state shows during API call
6. Success/error toast notification appears
7. All selected shipment statuses update to "cancelled"
8. Selections are cleared

## 🔧 Technical Implementation

### State Management
```typescript
const [showCancelConfirm, setShowCancelConfirm] = useState(false);
const [showBulkCancelConfirm, setShowBulkCancelConfirm] = useState(false);
const [selectedShipmentForCancel, setSelectedShipmentForCancel] = useState<ShipmentItem | null>(null);
const [cancellingShipment, setCancellingShipment] = useState(false);
const [cancellingBulk, setCancellingBulk] = useState(false);
```

### API Integration
```typescript
// Single cancellation
const result = await shipmentService.cancelShipment(selectedShipmentForCancel.awb);

// Bulk cancellation
const result = await shipmentService.cancelBulkShipments(selectedAwbs);
```

### Error Handling
- Network errors
- Authentication failures
- API response errors
- Invalid AWB numbers
- User-friendly error messages

## 🧪 Testing

### Test File
- **Location**: `src/utils/testShipmentCancelAPI.ts`
- **Functions**:
  - `testSingleShipmentCancel(awb)`: Test single cancellation
  - `testBulkShipmentCancel(awbs)`: Test bulk cancellation
  - `testExampleSingleCancel()`: Test with example AWB
  - `testExampleBulkCancel()`: Test with example AWBs

### Usage
```typescript
import { testExampleSingleCancel, testExampleBulkCancel } from '@/utils/testShipmentCancelAPI';

// Test single cancellation
await testExampleSingleCancel();

// Test bulk cancellation
await testExampleBulkCancel();
```

## 🎯 Usage Examples

### Frontend Integration
```typescript
import { shipmentService } from '@/services/shipmentService';

// Cancel single shipment
const result = await shipmentService.cancelShipment('18045011180841');

// Cancel multiple shipments
const result = await shipmentService.cancelBulkShipments([
  '18045011180841',
  '18045011180842'
]);
```

### API Testing
```bash
# Single shipment cancel
curl -X POST "http://localhost:8080/api/shipments/cancel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"awb": "18045011180841"}'

# Bulk shipment cancel
curl -X POST "http://localhost:8080/api/shipments/cancel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"awb": ["18045011180841", "18045011180842"]}'
```

## 🔒 Security Features

- **Authentication Required**: Bearer token authentication
- **Input Validation**: AWB number validation
- **Error Sanitization**: Safe error messages
- **Rate Limiting**: API-level rate limiting (if configured)

## 📊 Response Handling

### Success Response
- Update local state immediately
- Show success toast notification
- Refresh shipment data if needed
- Clear user selections

### Error Response
- Show error toast notification
- Maintain current state
- Log detailed error information
- Provide user-friendly error messages

## 🚨 Error Scenarios

1. **Invalid AWB**: AWB number doesn't exist or is malformed
2. **Authentication Failure**: Token expired or invalid
3. **Network Error**: Connection issues or timeout
4. **Server Error**: API server errors (5xx)
5. **Business Logic Error**: Shipment cannot be cancelled (e.g., already delivered)

## 🔄 State Updates

After successful cancellation:
1. Update shipment status to "cancelled"
2. Refresh filtered shipments list
3. Clear any selections
4. Update UI to reflect changes
5. Maintain data consistency

## 📝 Future Enhancements

- **Webhook Support**: Real-time notifications for cancellation events
- **Audit Trail**: Track cancellation history and reasons
- **Batch Processing**: Handle large numbers of shipments efficiently
- **Rollback Support**: Ability to reverse cancellations under certain conditions
- **Analytics**: Track cancellation patterns and reasons

## 🐛 Troubleshooting

### Common Issues
1. **AWB Not Found**: Verify AWB exists in the system
2. **Authentication Errors**: Check token validity and expiration
3. **Network Timeouts**: Verify API endpoint accessibility
4. **Status Conflicts**: Ensure shipment can be cancelled

### Debug Information
- Check browser console for detailed error logs
- Verify API endpoint configuration
- Confirm authentication token is valid
- Check network tab for API request/response details

## 📚 Related Documentation

- [API Configuration Guide](../src/config/api.ts)
- [Shipment Service Documentation](../src/services/shipmentService.ts)
- [Shipment Page Component](../src/components/ShipmentPage.tsx)
- [Authentication Guide](./AUTHENTICATION_README.md)
- [API Migration Guide](./API_MIGRATION_GUIDE.md)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Implemented and Tested
