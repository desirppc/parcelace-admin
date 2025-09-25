# Shipping Label API Integration

## Overview
This document describes the API integration for the customise-shipping-label feature in the ParcelAce React application.

## Features Implemented

### 1. Label Type Selection
- **A6 Format**: Standard A6 size labels
- **Thermal Print**: Thermal printer compatible labels
- **Removed**: Custom Size option (as per requirements)

### 2. Brand Logo Integration
- Toggle to show/hide brand logo on shipping labels
- File upload functionality for brand logo
- Support for image files (JPEG, PNG, etc.)
- File size validation (max 5MB)
- Logo removal capability

## API Endpoints

### Base URL
The API endpoints are configured in `src/config/api.ts`:

```typescript
// Shipping Label Settings
SHIPPING_LABEL_SETTINGS: 'api/shipping-label-settings',
SHIPPING_LABEL_SETTINGS_UPDATE: 'api/shipping-label-settings/update',
SHIPPING_LABEL_BRAND_LOGO: 'api/shipping-label-settings/brand-logo',
```

### Endpoint Details

#### 1. Get Settings
- **Endpoint**: `GET /api/shipping-label-settings`
- **Purpose**: Retrieve current shipping label settings
- **Response**: `ShippingLabelSettingsResponse`

#### 2. Update Settings
- **Endpoint**: `PUT /api/shipping-label-settings/update`
- **Purpose**: Update shipping label settings
- **Request Body**: `Partial<ShippingLabelSettings>`
- **Response**: `ShippingLabelSettingsResponse`

#### 3. Upload Brand Logo
- **Endpoint**: `POST /api/shipping-label-settings/brand-logo`
- **Purpose**: Upload brand logo for shipping labels
- **Request**: FormData with `brand_logo` file
- **Response**: `BrandLogoUploadResponse`

#### 4. Remove Brand Logo
- **Endpoint**: `DELETE /api/shipping-label-settings/brand-logo`
- **Purpose**: Remove brand logo from shipping labels
- **Response**: `ShippingLabelSettingsResponse`

## Data Types

### ShippingLabelSettings
```typescript
interface ShippingLabelSettings {
  label_type: 'A6' | 'Thermal';
  show_sender_address: boolean;
  show_sender_number: boolean;
  show_custom_address: boolean;
  custom_address?: string;
  show_order_total: boolean;
  show_product_name: boolean;
  show_receiver_number: boolean;
  show_brand_logo: boolean;
  brand_logo_url?: string;
}
```

### API Responses
```typescript
interface ShippingLabelSettingsResponse {
  success: boolean;
  data?: ShippingLabelSettings;
  message?: string;
  error?: string;
}

interface BrandLogoUploadResponse {
  success: boolean;
  data?: {
    logo_url: string;
    message: string;
  };
  message?: string;
  error?: string;
}
```

## Service Layer

The API integration is handled by `src/services/shippingLabelSettingsService.ts` which provides:

- `getSettings()`: Fetch current settings
- `updateSettings(settings)`: Update settings
- `uploadBrandLogo(file)`: Upload brand logo
- `removeBrandLogo()`: Remove brand logo

## Component Integration

The main component `src/components/ShippingLabelSettings.tsx` integrates with the API service to provide:

- Real-time settings management
- File upload with validation
- Loading states and error handling
- Toast notifications for user feedback

## File Structure

```
src/
├── components/
│   └── ShippingLabelSettings.tsx          # Main component
├── services/
│   └── shippingLabelSettingsService.ts    # API service
├── config/
│   └── api.ts                            # API endpoints
└── index.css                             # Custom animations
```

## Usage

### Accessing the Feature
Navigate to: `/dashboard/settings/customise-shipping-label`

### Setting Up Brand Logo
1. Toggle "Show Brand Logo" to enabled
2. Click "Upload Logo" button
3. Select image file (max 5MB)
4. Logo will be displayed and saved

### Saving Settings
1. Configure all desired settings
2. Click "Save Settings" button
3. Settings will be persisted via API

## Error Handling

The integration includes comprehensive error handling:

- Network errors
- File validation errors
- API response errors
- User-friendly error messages via toast notifications

## Validation

### File Upload Validation
- File type: Must be image (JPEG, PNG, etc.)
- File size: Maximum 5MB
- User feedback for invalid files

### Form Validation
- All required fields validated before submission
- Loading states during API calls
- Success/error feedback for all operations

## Future Enhancements

Potential improvements for future iterations:

1. **Logo Preview**: Real-time preview of logo on label
2. **Multiple Logo Support**: Support for different logo variants
3. **Logo Positioning**: Customizable logo placement on labels
4. **Bulk Operations**: Batch update multiple settings
5. **Template System**: Pre-defined label templates

## Testing

To test the API integration:

1. Start the development server: `npm run dev`
2. Navigate to the shipping label settings page
3. Test each feature:
   - Change label type
   - Toggle various settings
   - Upload a brand logo
   - Save settings
   - Verify API calls in browser dev tools

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Radix UI components
- Custom API service layer
