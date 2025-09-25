# Tracking Integration with NPS Component

## Overview

This document describes the integration of the tracking API with the NPS (Net Promoter Score) component, making it dynamic and capable of displaying real-time shipment tracking information.

## Features Implemented

### 1. Dynamic Tracking API Integration
- **Endpoint**: `GET {{api_url_dev}}/api/tracking/{awb_number}` (no token required)
- **Real-time Data**: Fetches live tracking information when AWB numbers are entered
- **Comprehensive Data**: Displays order details, customer information, product details, and tracking timeline

### 2. Enhanced Search Functionality
- **AWB Detection**: Automatically detects 12-14 digit AWB numbers
- **Smart Search**: Integrates both tracking and feedback data
- **Fallback Handling**: Gracefully handles cases where only partial data is available

### 3. Dynamic Content Display
- **Order Details**: Total amount, shipping rate, parcel type, dimensions, weight
- **Customer Information**: Name, email, phone, address details
- **Product Details**: Product names, quantities, prices, SKUs
- **Tracking Timeline**: Real-time status updates with locations and timestamps
- **Customizable Elements**: Header, footer, NPS sections from tracking page config

## API Response Mapping

### Core Data Structure
```typescript
interface TrackingResponse {
  status: boolean;
  message: string;
  data: {
    order_details: TrackingOrderDetails;
    customer_details: TrackingCustomerDetails;
    product_details: TrackingProductDetails[];
    warehouse_details: TrackingWarehouseDetails;
    trakings_details: TrackingDetails[];
    tracking_page: TrackingPageConfig;
  };
  error: string | null;
}
```

### Key Field Mappings

#### Order Details
- `awb` → AWB Number display
- `order_id` → Order ID reference
- `shipment_status` → Status badge with color coding
- `delivery_partner` → Courier partner information
- `shipment_date_time` → Formatted shipment date
- `estimated_delivery_date` → Expected delivery date

#### Customer Details
- `shipping_first_name` + `shipping_last_name` → Full customer name
- `shipping_email` → Customer email address
- `shipping_phone` → Contact phone number
- `shipping_city` + `shipping_zipcode` → Location information

#### Product Details
- `name` → Product name display
- `quantity` → Item count
- `price` → Unit price
- `total_price` → Total cost
- `sku` → Product identifier (if available)

#### Tracking Details
- `status` → Current status
- `status_code` → Status code badge
- `instructions` → Status description
- `status_time` → Timestamp
- `location` → Geographic location

## Component Architecture

### 1. TrackingService (`src/services/trackingService.ts`)
- **API Integration**: Handles all tracking API calls
- **Data Processing**: Formats and processes tracking data
- **Utility Methods**: Status colors, date formatting, partner icons

### 2. Updated NPS Component (`src/pages/NPS.tsx`)
- **Search Integration**: AWB number input with real-time tracking
- **Dynamic Display**: Shows tracking information when available
- **Error Handling**: Graceful fallbacks for missing data
- **Loading States**: User feedback during API calls

### 3. Enhanced NPSMetrics (`src/components/NPSMetrics.tsx`)
- **AWB Integration**: Displays tracking data context
- **Search Status**: Shows AWB search results
- **Data Context**: Integrates tracking with NPS metrics

### 4. Updated CustomerResponsesTable (`src/components/CustomerResponsesTable.tsx`)
- **Tracking Summary**: Shows available tracking data
- **Enhanced Search**: Better AWB search integration
- **Data Context**: Displays tracking information alongside feedback

## Usage Instructions

### For Users
1. **Enter AWB Number**: Type a 12-14 digit AWB number in the search field
2. **View Tracking**: Real-time tracking information will be displayed
3. **Access NPS Data**: View customer feedback and satisfaction metrics
4. **Navigate Sections**: Use the comprehensive tracking dashboard

### For Developers
1. **API Endpoint**: Use `TrackingService.getTrackingByAWB(awb)` for tracking data
2. **Data Integration**: Access tracking data through component state
3. **Customization**: Modify tracking page elements through API response
4. **Testing**: Use `window.testTracking.testIntegration()` for testing

## API Configuration

### Endpoint Addition
```typescript
// Added to src/config/api.ts
TRACKING: 'api/tracking',
```

### Environment Support
- **Local**: `http://localhost:8080/api/tracking/{awb}`
- **Development**: `https://staging.parcelace.io/api/tracking/{awb}`
- **Production**: `https://app.parcelace.io/api/tracking/{awb}`

## Error Handling

### Network Errors
- Connection failures are gracefully handled
- User-friendly error messages displayed
- Fallback to existing functionality

### Data Validation
- AWB number format validation (12-14 digits)
- API response structure validation
- Graceful handling of missing data fields

### User Experience
- Loading states during API calls
- Clear feedback for successful/failed searches
- Informative messages for no results

## Testing

### Development Testing
```javascript
// Test tracking integration
window.testTracking.testIntegration()

// Test utility methods
window.testTracking.testMethods()
```

### Manual Testing
1. **Valid AWB**: Enter `18045011180841` to test with sample data
2. **Invalid AWB**: Test with non-existent AWB numbers
3. **Network Issues**: Test with network interruptions
4. **Data Variations**: Test with different response structures

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live tracking
- **Map Integration**: Geographic visualization of shipment progress
- **Notification System**: Status change alerts
- **Analytics Dashboard**: Tracking performance metrics

### Potential Integrations
- **SMS Notifications**: Status updates via text messages
- **Email Tracking**: Automated tracking reports
- **Mobile App**: Native mobile tracking experience
- **API Webhooks**: Real-time status notifications

## Troubleshooting

### Common Issues
1. **API Not Responding**: Check network connectivity and API endpoint
2. **Data Not Displaying**: Verify AWB number format and API response
3. **Component Errors**: Check browser console for error messages
4. **Performance Issues**: Monitor API response times

### Debug Information
- Console logging for API calls and responses
- Network tab monitoring for API requests
- Component state inspection for data flow
- Error boundary handling for component failures

## Security Considerations

### API Access
- **No Authentication Required**: Tracking endpoint is public
- **Rate Limiting**: Consider implementing API rate limiting
- **Data Privacy**: Ensure sensitive customer data is properly handled

### Input Validation
- **AWB Format**: Strict validation for AWB number format
- **SQL Injection**: API parameters are properly sanitized
- **XSS Prevention**: Output is properly escaped in UI components

## Performance Optimization

### API Caching
- **Response Caching**: Consider caching frequently accessed tracking data
- **CDN Integration**: Use CDN for static tracking page assets
- **Lazy Loading**: Implement lazy loading for tracking components

### Data Optimization
- **Pagination**: Implement pagination for large tracking datasets
- **Compression**: Use gzip compression for API responses
- **Image Optimization**: Optimize tracking page images and assets

## Conclusion

The tracking integration successfully transforms the static NPS component into a dynamic, real-time tracking dashboard. Users can now:

- Enter AWB numbers to view live tracking information
- Access comprehensive shipment details
- View customer feedback in context
- Experience a seamless tracking and NPS workflow

This implementation provides a solid foundation for future enhancements while maintaining backward compatibility with existing NPS functionality.
