# Brand Details Page

## Overview
The Brand Details page is a new settings page that allows users to manage their brand information, including logo upload, contact details, and social media links.

## Features

### 1. Brand Logo Management
- Drag and drop logo upload interface
- Support for PNG, JPG, and GIF formats
- Real-time logo preview
- File size limit: 10MB

### 2. Contact Information
- Support contact number input
- Support email address input
- Form validation for proper formats

### 3. Social Media Links
- Facebook profile URL
- Twitter profile URL
- LinkedIn company URL
- Instagram profile URL
- YouTube channel URL
- Each field includes appropriate social media icons with brand colors

### 4. User Experience
- Modern, responsive design with gradient backgrounds
- Card-based layout for organized information
- Hover effects and smooth transitions
- Toast notifications for successful saves
- Mobile-friendly responsive design

## Technical Implementation

### File Location
- **Component**: `src/pages/BrandDetails.tsx`
- **Route**: `/dashboard/settings/brand-details`
- **Onboarding Route**: `/onboarding/settings/brand-details`

### Dependencies
- React hooks (useState)
- UI components from shadcn/ui
- Lucide React icons
- Custom toast hook

### State Management
- Local state for logo file and preview
- Form data state for all input fields
- Controlled inputs with proper change handlers

### Navigation
- Added to Settings dropdown in AppHeader
- Integrated with existing routing structure
- Protected by authentication and onboarding requirements

## Usage

### Accessing the Page
1. Click on the Settings icon (gear) in the header
2. Select "Brand Details" from the dropdown menu
3. Or navigate directly to `/dashboard/settings/brand-details`

### Managing Brand Information
1. **Upload Logo**: Click the upload area or drag and drop an image file
2. **Update Contact Info**: Modify support phone and email
3. **Edit Social Links**: Update your social media profile URLs
4. **Save Changes**: Click the "Save Brand Details" button

## Future Enhancements
- Backend integration for data persistence
- Image optimization and compression
- Logo cropping and editing tools
- Social media preview cards
- Brand color scheme customization
- Multiple logo variants (light/dark themes)

## Integration Notes
- The page follows the existing design system and color scheme
- Uses the same authentication and routing patterns as other settings pages
- Toast notifications are integrated with the existing notification system
- Responsive design matches the overall application layout
