# Complete Tracking Page API Integration

## Overview

The Tracking Page Customization has been successfully integrated with the user-meta API endpoints for both Essential Settings and Advanced Features. This implementation allows users to configure all aspects of their tracking page including core elements, marketing tools, and engagement features.

## API Endpoints Used

### 1. Fetch Data: `POST /api/get-user-meta`
- **Purpose**: Retrieve existing tracking page customization data
- **Request Body**: Array of meta requests for all sections
- **Response**: Structured data for all essential and advanced sections

### 2. Update Data: `POST /api/user-meta`
- **Purpose**: Save tracking page customization changes
- **Request Body**: Array of meta updates for modified sections
- **Response**: Success/failure status

## Complete Data Structure

### Essential Settings

#### Browser Settings
```typescript
interface BrowserSettings {
  page_title: string;        // Page title for browser tab
  favicon_url: string;       // Custom favicon URL
}
```

#### Header Section
```typescript
interface HeaderSection {
  show_logo: boolean;                    // Display header logo
  menu_items: MenuItem[];               // Navigation menu items
  sticky_header: boolean;               // Enable sticky header
  sticky_header_text: string;           // Sticky header message
  button_label: string;                 // CTA button text
  button_link: string;                  // CTA button URL
  button_color: string;                 // CTA button color
  show_support_email_phone: boolean;    // Display support contact
}

interface MenuItem {
  label: string;                        // Menu item text
  url: string;                          // Menu item link
}
```

#### NPS Section
```typescript
interface NPSSection {
  show_nps_section: boolean;                    // Display NPS survey
  show_delivery_feedback_section: boolean;      // Display delivery feedback
}
```

#### Footer Section
```typescript
interface FooterSection {
  show_support_email_phone: boolean;    // Display support contact
  show_privacy_policy: boolean;         // Display privacy policy link
  show_social_icons: boolean;           // Display social media icons
  sticky_footer: boolean;               // Enable sticky footer
  sticky_footer_text: string;           // Sticky footer message
  button_label: string;                 // CTA button text
  button_link: string;                  // CTA button URL
  button_color: string;                 // CTA button color
}
```

### Advanced Features

#### Track Ace Status
```typescript
interface TrackAceStatus {
  is_active: boolean;                   // Enable/disable tracking features
}
```

#### Product Showcase
```typescript
interface ProductShowcase {
  show_products: boolean;               // Display product showcase
  products: Product[];                  // Array of products
}

interface Product {
  id: string;                           // Unique product identifier
  name: string;                         // Product name
  description: string;                  // Product description
  price: number;                        // Product price
  image_url: string;                    // Product image URL
  product_url: string;                  // Product page URL
  is_active: boolean;                   // Product visibility status
}
```

#### Banner Campaigns
```typescript
interface BannerCampaigns {
  show_banners: boolean;                // Display banner campaigns
  banners: Banner[];                    // Array of banners
}

interface Banner {
  id: string;                           // Unique banner identifier
  image_url: string;                    // Banner image URL
  title: string;                        // Banner title
  description: string;                  // Banner description
  button_text: string;                  // CTA button text
  button_url: string;                   // CTA button URL
  is_active: boolean;                   // Banner visibility status
}
```

#### Video Content
```typescript
interface VideoContent {
  show_videos: boolean;                 // Display video content
  videos: Video[];                      // Array of videos
}

interface Video {
  id: string;                           // Unique video identifier
  youtube_url: string;                  // YouTube video URL
  title: string;                        // Video title
  description: string;                  // Video description
  is_active: boolean;                   // Video visibility status
}
```

#### Rewards & Promotions
```typescript
interface RewardsPromotions {
  show_rewards: boolean;                // Display rewards section
  rewards: Reward[];                    // Array of rewards
}

interface Reward {
  id: string;                           // Unique reward identifier
  title: string;                        // Reward title
  description: string;                  // Reward description
  discount_code: string;                // Discount code
  discount_percentage: number;          // Discount percentage
  valid_until: string;                  // Expiry date
  is_active: boolean;                   // Reward visibility status
}
```

#### Support Social
```typescript
interface SupportSocial {
  support_links: SupportLink[];         // Array of support links
}

interface SupportLink {
  id: string;                           // Unique link identifier
  platform: string;                     // Social platform name
  url: string;                          // Platform URL
  is_active: boolean;                   // Link visibility status
}
```

## Complete API Request Structure

### Fetch Request (All Sections)
```json
[
  { "widget_type": "tracking_page", "meta_key": "track_ace_status" },
  { "widget_type": "tracking_page", "meta_key": "browser_settings" },
  { "widget_type": "tracking_page", "meta_key": "header_section" },
  { "widget_type": "tracking_page", "meta_key": "nps_section" },
  { "widget_type": "tracking_page", "meta_key": "footer_section" },
  { "widget_type": "tracking_page", "meta_key": "product_showcase" },
  { "widget_type": "tracking_page", "meta_key": "banner_campaigns" },
  { "widget_type": "tracking_page", "meta_key": "video_content" },
  { "widget_type": "tracking_page", "meta_key": "rewards_promotions" },
  { "widget_type": "support_social", "meta_key": "support_links" }
]
```

### Update Request Example
```json
[
  {
    "widget_type": "tracking_page",
    "meta_key": "product_showcase",
    "meta_value": [
      {
        "show_products": true,
        "products": [
          {
            "id": "1",
            "name": "Premium Headphones",
            "description": "High-quality wireless headphones",
            "price": 2999,
            "image_url": "uploads/products/headphones.jpg",
            "product_url": "https://example.com/headphones",
            "is_active": true
          }
        ]
      }
    ]
  }
]
```

## Component Architecture

### 1. Service Layer (`TrackingCustomizationService`)
- **Data Fetching**: Retrieves customization data for all sections
- **Data Updates**: Sends changes for any modified sections
- **Default Values**: Provides fallback data structure for all sections
- **Error Handling**: Manages API failures gracefully

### 2. Essential Settings Components
- **BrowserInfoSection**: Manages page title and favicon
- **HeaderSection**: Configures header branding and navigation
- **NPSSection**: Controls feedback collection features
- **FooterSection**: Manages footer content and legal links

### 3. Advanced Features Components
- **ProductSection**: Manages product showcase with CRUD operations
- **BannerSection**: Handles banner campaigns with image uploads
- **VideoSection**: Manages YouTube video content with previews
- **RewardSection**: Handles rewards and promotions with discount codes

### 4. Data Flow
```
API Response → Service Processing → Component State → User Input → Data Change → Save to API
```

## Key Features

### Real-time Data Sync
- All components automatically sync with API data
- Changes are tracked locally before saving
- Optimistic updates for better UX
- Support for multiple data types (strings, numbers, booleans, arrays)

### Advanced Component Features
- **Product Management**: Add/remove products, image uploads, pricing
- **Banner Campaigns**: Multiple banners with CTA buttons and links
- **Video Content**: YouTube integration with thumbnail previews
- **Rewards System**: Discount codes, percentages, expiry dates
- **Status Management**: Active/inactive toggles for all items

### Validation & Error Handling
- Input validation for required fields
- Graceful fallback to default values
- User-friendly error messages via toast notifications
- API error handling with retry mechanisms

### Responsive Design
- Collapsible sections for better organization
- Mobile-friendly form controls
- Consistent UI patterns across all sections
- Color-coded sections for easy identification

## Usage Instructions

### For Developers
1. **Import Service**: `import TrackingCustomizationService from '@/services/trackingCustomizationService'`
2. **Fetch Data**: `await TrackingCustomizationService.fetchTrackingPageCustomization()`
3. **Update Data**: `await TrackingCustomizationService.updateTrackingPageCustomization(data)`
4. **Handle Errors**: Use try-catch blocks for API operations

### For Users
1. **Navigate**: Go to Tracking Page Customization
2. **Essential Settings**: Configure core elements (browser, header, NPS, footer)
3. **Advanced Features**: Set up marketing tools (products, banners, videos, rewards)
4. **Save**: Click "Save Changes" to persist all modifications
5. **Preview**: Use "Preview" button to see changes (coming soon)

## API Integration Benefits

### Complete Coverage
- All tracking page elements are configurable
- Unified data management through single service
- Consistent API patterns across all sections

### Performance Optimization
- Batch updates for multiple sections
- Efficient data fetching with single request
- Minimal API calls during user interactions

### Scalability
- Easy to add new sections and features
- Modular component architecture
- Extensible data structures

## Future Enhancements

### Planned Features
- **Image Upload**: Direct file uploads to server
- **Preview Mode**: Real-time preview of all changes
- **Version History**: Track customization changes over time
- **Template System**: Pre-built customization templates
- **Bulk Operations**: Import/export configurations

### Technical Improvements
- **Caching**: Implement data caching for better performance
- **Offline Support**: Allow offline editing with sync on reconnection
- **Real-time Collaboration**: Multi-user editing support
- **Advanced Validation**: Form validation with custom rules

## Troubleshooting

### Common Issues
1. **Data Not Loading**: Check authentication token and API connectivity
2. **Save Failures**: Verify all required fields are filled
3. **Component Errors**: Ensure proper data structure in API response
4. **Image Upload Issues**: Check file size and format restrictions

### Debug Information
- Check browser console for API request/response logs
- Verify authentication token in localStorage/sessionStorage
- Confirm API endpoint configuration in `src/config/api.ts`
- Validate data structure matches expected interfaces

## Testing

### Manual Testing
1. Navigate to CustomiseTrackingPage
2. Test both Essential and Advanced tabs
3. Modify settings in each section
4. Save changes and verify API calls
5. Refresh page to confirm data persistence

### API Testing
1. Test with valid authentication token
2. Verify error handling with invalid data
3. Check response format matches expected structure
4. Test all CRUD operations for advanced features

## Dependencies

- **React**: Component framework
- **TypeScript**: Type safety and interfaces
- **Tailwind CSS**: Styling and responsive design
- **Shadcn/ui**: UI component library
- **Lucide React**: Icon library

## Contributing

When adding new features to the tracking page customization:
1. Update the service interfaces
2. Modify the corresponding component
3. Add proper error handling
4. Update this documentation
5. Test with the API endpoints
6. Ensure responsive design compatibility
