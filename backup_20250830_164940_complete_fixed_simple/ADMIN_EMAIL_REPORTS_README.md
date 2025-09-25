# Admin Email Reports Feature

## Overview
The Admin Email Reports feature allows administrators to configure automated delivery of reports via email and WhatsApp. This feature provides a comprehensive interface for setting up automated report generation and delivery schedules.

## Features

### Email Reports
- **Recipient Configuration**: Choose between sending all reports to the same email or different emails for each report
- **Global Email Settings**: Set a default email address for all reports
- **Frequency Control**: Configure daily, weekly, or monthly report delivery
- **Time Configuration**: Set same time for all reports or different times for each report
- **Report Format**: Choose between Excel, PDF, or CSV formats
- **Report Types Available**:
  - Pickup Report: AWB confirmation data
  - Financial Report: COD remittance data
  - Customer Report: Transaction details
  - Performance Report: Template delivery status

### WhatsApp Reports
- **Recipient Configuration**: Choose between sending all reports to the same number or different numbers for each report
- **Global WhatsApp Settings**: Set a default WhatsApp number for all reports
- **Frequency Control**: Configure daily, weekly, or monthly report delivery
- **Time Configuration**: Set same time for all reports or different times for each report
- **Message Preview**: Preview how WhatsApp messages will appear
- **Report Types Available**:
  - Pickup Report: Daily pickup statistics
  - Financial Report: Daily financial summary

### Past Reports
- View and download previously generated reports
- See delivery method (Email/WhatsApp)
- Access report metadata (date, format, size)

## How to Access

1. Navigate to the dashboard
2. Go to **Reports** section in the sidebar
3. Click on **Admin Email Reports**

## URL
```
/dashboard/reports/admin-email
```

## Technical Implementation

### Components
- `AdminEmailReports.tsx`: Main component with all functionality
- `AdminEmailReportsPage.tsx`: Page wrapper for routing

### API Integration
- **Reports Endpoint**: `{{api_url_dev}}api/report`
  - **Method**: GET
  - **Purpose**: Fetch available report types
  - **Response**: List of available reports with IDs, titles, and descriptions
  
- **Past Reports Endpoint**: `{{api_url_dev}}api/report/user-log`
  - **Method**: GET
  - **Purpose**: Fetch user's past report generation logs
  - **Response**: Report generation history with delivery details
  
- **Report Settings Endpoint**: `{{api_url_dev}}api/report/setting`
  - **Method**: GET
  - **Purpose**: Fetch user's current report automation settings
  - **Response**: Current configuration for all report types and delivery methods
  
- **Authentication**: Bearer token required for all endpoints
- **Dynamic Loading**: Reports, past reports, and settings are fetched from API on component mount

### State Management
- Uses React hooks for local state management
- Tracks email and WhatsApp configurations separately
- Manages report selection and settings
- Handles loading states and error handling

### UI Components Used
- Tabs for Email/WhatsApp separation
- Cards for configuration sections
- Switches for enabling/disabling reports
- Radio groups for configuration options
- Select dropdowns for time and frequency
- Input fields for recipient information
- Modal for WhatsApp message preview

### Styling
- Tailwind CSS for responsive design
- Gradient backgrounds and modern UI elements
- Hover effects and smooth transitions
- Responsive grid layout

## Configuration Options

### Email Configuration
- **Recipient Mode**: Same email for all vs. different emails
- **Global Email**: Default email address
- **Frequency**: Daily/Weekly/Monthly
- **Time Mode**: Same time vs. different times
- **Global Time**: Default delivery time (24-hour format)
- **Format**: Excel/PDF/CSV

### WhatsApp Configuration
- **Recipient Mode**: Same number for all vs. different numbers
- **Global Number**: Default WhatsApp number
- **Frequency**: Daily/Weekly/Monthly
- **Time Mode**: Same time vs. different times
- **Global Time**: Default delivery time (24-hour format)

## Usage Examples

### Setting up Daily Email Reports
1. Go to Email Reports tab
2. Select "Send all reports to same email"
3. Enter admin@company.com in Global Email
4. Set Frequency to "Daily"
5. Select "Same time for all reports"
6. Set Global Time to "9:00 AM"
7. Choose Excel format
8. Enable desired reports
9. Click "Save Configuration"

### Setting up WhatsApp Notifications
1. Go to WhatsApp Reports tab
2. Select "Send all reports to same number"
3. Enter +91-9876543210 in Global Number
4. Set Frequency to "Daily"
5. Select "Same time for all reports"
6. Set Global Time to "6:00 PM"
7. Enable desired reports
8. Preview messages using "Preview Message" button
9. Click "Save Configuration"

## Smart Features

### Automatic Data Enhancement
The component automatically enhances API data with:
- **Report Titles**: Maps report IDs to readable titles
- **Delivery Method Detection**: Automatically determines if reports were sent via email or WhatsApp
- **File Format Detection**: Extracts file format from report paths
- **File Size Estimation**: Provides estimated file sizes based on format
- **Recipient Display**: Shows who received each report

### Intelligent Defaults
- **Default Recipients**: Automatically assigns appropriate email addresses based on report type
- **WhatsApp Previews**: Generates contextual preview content for each report type
- **Smart Icons**: Automatically assigns relevant icons based on report content

## Future Enhancements
- Integration with actual email/WhatsApp services
- Report scheduling and cron jobs
- Custom report templates
- Analytics on report delivery success
- Bulk recipient management
- Report customization options
- Actual file download functionality
- Report generation scheduling

## API Response Format

### Reports Structure
```json
{
  "status": true,
  "message": "Reports Fetched successfully!",
  "data": [
    {
      "id": 1,
      "title": "Pickup Report",
      "description": "This report provides the data for those AWBs where user can confirmed that they have received the shipment on what's app"
    },
    {
      "id": 2,
      "title": "Financial Report", 
      "description": "This report provides the COD data per AWB Basis. This report will include Remittance Code, Remittance Status, Date and other"
    },
    {
      "id": 3,
      "title": "Customer Report",
      "description": "This report provides a detailed list of all transactions (payments, refunds, and adjustments) against every settlement in selected time range"
    },
    {
      "id": 4,
      "title": "Performance Report",
      "description": "This report provides data of those AWBs along with the template name, for which template has not been delivered to users on their what's app number."
    }
  ],
  "error": null
}
```

### Past Reports Structure
```json
{
  "status": true,
  "message": "Last report log fetched successfully.",
  "data": {
    "id": 1,
    "user_id": 30,
    "report_id": 2,
    "report_setting_id": 1,
    "report_generated_time": "2025-08-01 10:30:00",
    "report_path": "/storage/reports/xyz_report.csv",
    "sent_reports": "abc@gmail.com,xyz@gmail.com",
    "deleted_at": null,
    "created_at": "2025-08-07T04:00:24.000000Z",
    "updated_at": "2025-08-07T04:00:24.000000Z"
  },
  "error": null
}
```

## Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons
- React Router DOM

## Report Settings Integration

### Automatic Configuration Loading
The component automatically loads and applies existing user configurations:
- **Settings Fetch**: Retrieves current report automation settings on component mount
- **Auto-Population**: Fills form fields with existing configurations
- **Status Mapping**: Automatically enables/disables reports based on current settings
- **Recipient Pre-filling**: Populates email addresses and phone numbers from saved settings

### Smart Settings Application
- **Report Status**: Automatically enables reports that are currently active
- **Recipient Mapping**: Maps saved recipients to appropriate report types
- **Global Settings**: Determines most common frequency, time, and format settings
- **Real-time Sync**: Settings are applied immediately after loading
- **Always Visible**: All report configuration options are always displayed, regardless of toggle status

### Configuration Persistence
- **Current State**: All form fields reflect the user's saved preferences
- **Change Tracking**: Modifications are tracked and can be saved back to the API
- **Validation**: Ensures consistency between different report types
- **User Experience**: Users see their current setup immediately upon loading

### Enhanced User Experience
- **Always Accessible**: All report configuration options are visible at all times
- **Toggle Control**: Simple on/off switches for enabling/disabling reports
- **No Hidden Fields**: Users can configure recipients, timing, and other settings regardless of toggle status
- **Better Visibility**: Clear view of all available options without needing to enable reports first

## API Call Flow

### Sequential API Execution
The component implements a **sequential API call flow** to ensure proper data synchronization:

1. **Step 1: Fetch Reports** (`fetchReports()`)
   - Calls `GET /api/report`
   - Transforms API data to component format
   - Sets `emailReports` and `whatsappReports` state
   - Provides fallback reports if API fails

2. **Step 2: Fetch Report Settings** (`fetchReportSettings()`)
   - Calls `GET /api/report/setting` 
   - Applies settings to the loaded reports
   - Updates report enabled/disabled states
   - Sets recipient information from settings

3. **Step 3: Fetch Past Reports** (`fetchPastReports()`)
   - Calls `GET /api/report/user-log`
   - Loads report history independently
   - No dependency on other API calls

### Data Synchronization
- **Reports must load first** before settings can be applied
- **Settings automatically update** report states and configurations
- **Fallback system** ensures reports are always visible even if APIs fail
- **Real-time status indicators** show loading progress for each step

### Debugging and Monitoring
- **Console Logging**: Comprehensive logging for API calls and data flow
- **Status Indicators**: Visual feedback during loading and processing
- **Error Handling**: Graceful fallbacks with user-friendly error messages
- **Progress Tracking**: Clear indication of which step is currently executing
