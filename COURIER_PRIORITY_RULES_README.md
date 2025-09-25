# Courier Priority Rules

## Overview
The Courier Priority Rules page allows users to configure the priority order in which courier partners are attempted for different order types (Prepaid, COD, Reverse). This helps optimize delivery success rates and cost management.

## Features

### Two Modes
1. **Cheapest Mode**: Automatically selects courier partners based on the lowest rates
2. **Custom Mode**: Allows manual configuration of courier priorities for each order type

### Priority Configuration
- **1st Priority**: Primary courier partner to attempt first
- **2nd Priority**: Fallback courier if 1st priority is unavailable
- **3rd Priority**: Secondary fallback courier

### Supported Courier Partners
- Delhivery
- Xpressbees
- Ecom Express
- Blue Dart
- DTDC

### Order Types
- **Prepaid**: Orders paid upfront
- **COD**: Cash on Delivery orders
- **Reverse**: Return/Reverse logistics orders

## Usage

### Accessing the Page
Navigate to: `/dashboard/settings/courier-priority-rules`

### Setting Priorities
1. Select "Custom" mode
2. For each order type, choose courier partners for 1st, 2nd, and 3rd priority
3. Ensure no duplicate courier partners within the same order type
4. Click "Save & Apply" to persist your configuration

### Validation
- The system prevents duplicate courier selections within the same order type
- Visual indicators show validation status (OK, Fix priorities, Auto)
- Error banners appear when validation fails

### Data Persistence
- All configurations are saved to localStorage
- Settings persist across browser sessions
- Timestamp tracking for configuration updates

## Technical Details

### Storage
- **Storage Key**: `courier-priority-config:v1`
- **Data Structure**: JSON with mode, rules, and timestamp
- **Versioning**: V1 schema for future compatibility

### State Management
- React hooks for local state management
- Real-time validation and UI updates
- Optimistic updates with immediate feedback

### UI Components
- Responsive grid layout for different screen sizes
- Sticky footer with action buttons
- Real-time status indicators and badges
- Scrollable summary panel

## Future Enhancements
- Weight-based routing rules
- Zone-specific configurations
- Performance analytics integration
- API integration for real-time courier availability
- Bulk import/export of configurations

## Browser Compatibility
- Modern browsers with ES6+ support
- LocalStorage enabled
- Responsive design for mobile and desktop

## Troubleshooting
- Clear browser data if configurations become corrupted
- Use "Reset" button to restore default settings
- Check browser console for validation errors
- Ensure all UI components are properly loaded
