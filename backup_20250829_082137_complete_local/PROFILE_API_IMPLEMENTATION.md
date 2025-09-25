# Profile API Implementation

## Overview
This document describes the implementation of the Profile Dashboard API integration for the ParcelAce React application.

## API Endpoint
- **GET**: `{{api_url_dev}}api/profile-dashboard`
- **Response**: Profile dashboard data including profile info, legal details, business details, bank details, and brand details

## Implementation Details

### 1. Profile Service (`src/services/profileService.ts`)
A dedicated service class that handles all profile-related API calls:

- `getProfileDashboard()` - Fetches complete profile dashboard data
- `updateProfile()` - Updates profile information
- `updateBusinessDetails()` - Updates business details
- `updateBankDetails()` - Updates bank details
- `updateBrandDetails()` - Updates brand details

### 2. TypeScript Interfaces
Comprehensive type definitions for all profile data structures:

```typescript
export interface ProfileDashboardData {
  profile_info: ProfileInfo;
  legal_details: LegalDetails;
  business_details: BusinessDetails;
  bank_details: BankDetails;
  brand_details: BrandDetails;
}
```

### 3. ProfilePage Component (`src/components/ProfilePage.tsx`)
Updated component that:

- Fetches profile data from API on component mount
- Displays real-time profile information
- Provides edit functionality for various sections
- Shows loading states and error handling
- Integrates with toast notifications for user feedback

### 4. API Configuration
Added `PROFILE_DASHBOARD: 'api/profile-dashboard'` endpoint to `src/config/api.ts`

## Features

### ✅ Implemented
- **Real-time Data Fetching**: Profile data is fetched from the API when the page loads
- **Loading States**: Full-page loading overlay and button-level loading indicators
- **Error Handling**: Toast notifications for API errors
- **Data Synchronization**: Local state is updated with API data
- **Edit Functionality**: Inline editing for bank, legal, and support details
- **Auto-refresh**: Manual refresh button to fetch latest data

### 🔄 API Integration Points
- **Profile Information**: Name, email, phone, KYC status
- **Legal Details**: Legal entity, legal name, GSTIN, address
- **Business Details**: Sales platform, monthly orders, brand info
- **Bank Details**: Payee name, account number, IFSC, verification status
- **Brand Details**: Support contact, social media links, brand logo

## Usage

### Accessing the Profile Page
Navigate to `/dashboard/profile` to view the profile dashboard.

### Refreshing Data
Click the "Refresh Data" button in the header to fetch the latest profile information from the API.

### Editing Information
- Click the edit icon (✏️) on any section to modify details
- Changes are saved to the API and the page is refreshed automatically
- Loading indicators show during save operations

## API Response Structure

```json
{
  "status": true,
  "message": "Profile dashboard fetched successfully.",
  "data": {
    "profile_info": {
      "name": "Prateek Sharma",
      "email": "prateeks885@gmail.com",
      "email_verified": null,
      "phone": "8005747571",
      "phone_verified": null,
      "kyc_verified": true
    },
    "legal_details": {
      "legal_entity": "private_limited",
      "legal_name": "PARCELACE TECH SOLUTIONS PRIVATE LIMITED",
      "gstin": "Active",
      "address": "N 161 Saira Tower,Gautam Nagar, Near Green Park Metro, New Delhi, South Delhi, Delhi, 110049"
    },
    "business_details": {
      "sales_platform": "woocommerce",
      "monthly_orders": "51-200",
      "brand_name": null,
      "brand_website": null
    },
    "bank_details": {
      "payee_name": "PRATEEK SHARMA",
      "account_number": "671001501523",
      "ifsc": "ICIC0006710",
      "bank_verified": true
    },
    "brand_details": {
      "support_contact_number": null,
      "support_email": null,
      "facebook_link": null,
      "twitter_link": null,
      "linkedin_link": null,
      "instagram_link": null,
      "youtube_link": null,
      "brand_logo": null
    }
  },
  "error": null
}
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Displayed as toast notifications
2. **API Errors**: HTTP status errors are caught and displayed
3. **Loading States**: Users see loading indicators during operations
4. **Fallback Data**: Local storage data is used as fallback when API fails

## Future Enhancements

### Potential Improvements
- **Real-time Updates**: WebSocket integration for live profile updates
- **Offline Support**: Service worker for offline profile viewing
- **Data Validation**: Client-side validation before API calls
- **Bulk Updates**: Single API call for updating multiple sections
- **Audit Trail**: Track profile changes over time

### Additional Endpoints
- **Profile Picture Upload**: Image upload for profile photos
- **Document Verification**: KYC document upload and verification
- **Preferences**: User preferences and settings
- **Notifications**: Profile-related notification preferences

## Testing

### Manual Testing
1. Navigate to `/dashboard/profile`
2. Verify data loads from API
3. Test edit functionality for each section
4. Verify error handling with invalid API responses
5. Test refresh functionality

### API Testing
- Test with valid authentication tokens
- Test with expired/invalid tokens
- Test network error scenarios
- Verify response format matches expected structure

## Dependencies

- **React**: Core component framework
- **TypeScript**: Type safety and interfaces
- **Lucide React**: Icons for UI elements
- **Toast Hook**: User notification system
- **API Config**: Centralized API configuration

## Notes

- The implementation follows the existing codebase patterns
- All API calls include proper authentication headers
- Loading states provide good user experience during API operations
- Error handling ensures graceful degradation when API calls fail
- The service layer pattern makes it easy to modify API endpoints or add new functionality
