# Courier Priority API Integration

## Overview
This document describes the complete integration of the Courier Priority API with the React application. The integration includes both GET and POST endpoints for managing courier priority settings.

## API Endpoints

### 1. GET /api/courier-priority
**Purpose**: Fetch current courier priority settings

**Response Format**:
```json
{
  "status": true,
  "message": "success",
  "data": {
    "order_types": [
      { "value": "prepaid", "label": "Prepaid" },
      { "value": "cod", "label": "COD" },
      { "value": "reverse", "label": "Reverse" }
    ],
    "courier_partners": [
      { "value": 3, "label": "bluedart" },
      { "value": 1, "label": "delhivery" },
      { "value": 2, "label": "xbee" }
    ],
    "courier_priorities": {
      "prepaid": [
        { "courier_partner_id": 3, "priority_id": 1 },
        { "courier_partner_id": 2, "priority_id": 2 },
        { "courier_partner_id": 1, "priority_id": 3 }
      ],
      "cod": [...],
      "reverse": [...]
    }
  }
}
```

### 2. POST /api/courier-priority
**Purpose**: Update courier priority settings

**Request Format**:
```json
{
  "priority": [
    {
      "order_type": "prepaid",
      "courier_partner_id": ["3", "2", "1"]
    },
    {
      "order_type": "cod",
      "courier_partner_id": ["3", "2", "1"]
    },
    {
      "order_type": "reverse",
      "courier_partner_id": ["3", "2", "1"]
    }
  ]
}
```

**Response Format**:
```json
{
  "status": true,
  "message": "Your courier priority set successfully",
  "data": { ... },
  "error": null
}
```

## Implementation Details

### 1. Type Definitions (`src/types/courierPriority.ts`)
- **OrderType**: Interface for order type data
- **CourierPartner**: Interface for courier partner data
- **CourierPriority**: Interface for priority configuration
- **PriorityUpdateRequest**: Interface for POST API requests
- **LocalCourierPriority**: Local state interface for component usage

### 2. Service Layer (`src/services/courierPriorityService.ts`)
- **getCourierPrioritySettings()**: Fetches data from GET endpoint
- **updateCourierPrioritySettings()**: Sends data to POST endpoint
- **transformApiDataToLocal()**: Converts API format to component format
- **validatePriorities()**: Validates priority configuration

### 3. Component Integration (`src/pages/CourierPriorityRules.tsx`)
- **API Data Loading**: Automatically fetches data on component mount
- **Dynamic UI**: Order types and courier partners loaded from API
- **Real-time Updates**: Saves changes back to the API
- **Error Handling**: Loading states, error messages, and retry functionality
- **Success Feedback**: Success messages after successful API operations
- **Reset Functionality**: Resets to API default values



## Key Features

✅ **GET Integration**: Fetches courier priority settings from API  
✅ **POST Integration**: Updates courier priority settings via API  
✅ **Dynamic UI**: Order types and courier partners loaded from API  
✅ **Data Transformation**: Converts between API and component formats  
✅ **Validation**: Prevents duplicate courier selections  
✅ **Error Handling**: Graceful fallbacks and user feedback  
✅ **Loading States**: Visual feedback during API operations  
✅ **Success Feedback**: Success messages after successful operations  
✅ **Reset Functionality**: Restore API default values  

## Usage Instructions

### 1. Navigate to the Page
```
http://localhost:8084/dashboard/settings/courier-priority-rules
```

### 2. View Current Settings
- The page automatically loads current settings from the API
- Order types and courier partners are displayed dynamically
- Priority configurations are shown for each order type

### 3. Modify Priorities
- Select "Custom" mode to enable editing
- Choose courier partners for 1st, 2nd, and 3rd priority levels
- Ensure no duplicate courier partners within the same order type

### 4. Save Changes
- Click "Apply Rule" to save changes to the API
- Success message will be displayed upon successful save
- Changes are also saved to local storage for mode preferences

### 5. Reset to Defaults
- Click "Reset to Default" to restore API default values
- This fetches fresh data from the API



## Data Flow

1. **Component Mount** → Fetches data from GET `/api/courier-priority`
2. **User Interaction** → Modifies priority selections in local state
3. **Save Operation** → Transforms local data to API format and sends POST request
4. **API Response** → Shows success/error message to user
5. **Local Storage** → Saves mode preferences locally

## Error Handling

- **Network Errors**: Displayed with retry button
- **API Errors**: Error messages from API responses
- **Validation Errors**: Prevents saving invalid configurations
- **Loading States**: Visual feedback during operations



## Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **Bulk Operations**: Support for bulk priority updates
- **Audit Trail**: Track priority change history
- **Advanced Validation**: More sophisticated validation rules
- **Performance Optimization**: Caching and request optimization

## Troubleshooting

### Common Issues
1. **API Not Responding**: Check network connectivity and API endpoint
2. **Data Not Loading**: Verify API response format matches expected structure
3. **Save Failures**: Check console for API error details
4. **Validation Errors**: Ensure no duplicate courier partners within order types

### Debug Steps
1. Check browser console for error messages
2. Verify API endpoint configuration in `src/config/api.ts`
3. Check network tab for API request/response details
