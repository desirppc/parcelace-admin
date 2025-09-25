# API Migration Guide - Fix Inconsistent Base URL Usage

## 🚨 **Current Problem**

The project has **TWO different approaches** for API calls, causing inconsistency and environment management issues:

### ❌ **Bad Pattern (Found in 15+ components):**
```typescript
// Hardcoded fallback - BAD!
const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/import-bulk-order`);
```

### ✅ **Good Pattern (Found in services):**
```typescript
// Centralized config - GOOD!
const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`);
```

## 🔧 **Solution: Centralized Environment Configuration**

### 1. **New Environment System**
```typescript
// src/config/environment.ts
export const ENVIRONMENT = {
  API_URLS: {
    development: 'https://staging.parcelace.io/',
    staging: 'https://staging.parcelace.io/',
    production: 'https://app.parcelace.io/',
  },
  
  getCurrentApiUrl(): string {
    // Priority: 1. .env file, 2. environment-specific, 3. fallback
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    const env = this.NODE_ENV;
    return this.API_URLS[env] || this.API_URLS.production;
  }
};
```

### 2. **Updated API Config**
```typescript
// src/config/api.ts
import { ENVIRONMENT } from './environment';

const API_CONFIG = {
  BASE_URL: ENVIRONMENT.getCurrentApiUrl(), // Dynamic based on environment
  ENDPOINTS: {
    ORDER_IMPORT: 'api/order/import-bulk-order',
    // ... other endpoints
  }
};
```

## 📋 **Migration Steps**

### **Step 1: Update Environment Files**

#### `.env` (Production)
```bash
VITE_API_URL=https://app.parcelace.io/
```

#### `.env.development` (Development/Staging)
```bash
VITE_API_URL=https://staging.parcelace.io/
```

#### `.env.staging` (Staging)
```bash
VITE_API_URL=https://staging.parcelace.io/
```

### **Step 2: Update Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "dev:staging": "vite --mode staging",
    "dev:production": "vite --mode production",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production"
  }
}
```

### **Step 3: Fix Components (Priority Order)**

#### **High Priority - Import/Export Functions:**
1. `OrdersPage.tsx` - ✅ **FIXED**
2. `AddOrder.tsx` - ⚠️ **NEEDS FIX**
3. `ShipmentPage.tsx` - ⚠️ **NEEDS FIX**

#### **Medium Priority - Core Components:**
4. `LoginScreen.tsx` - ⚠️ **NEEDS FIX**
5. `ViewOrderDetails.tsx` - ⚠️ **NEEDS FIX**
6. `WarehouseScreen.tsx` - ⚠️ **NEEDS FIX**

#### **Low Priority - Other Components:**
7. `ForgotPasswordScreen.tsx` - ⚠️ **NEEDS FIX**
8. `ResetPasswordScreen.tsx` - ⚠️ **NEEDS FIX**
9. `CourierPartnerSelection.tsx` - ⚠️ **NEEDS FIX**

## 🔄 **Migration Pattern**

### **Before (BAD):**
```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://app.parcelace.io/'}api/order/import-bulk-order`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
  body: formData,
});
```

### **After (GOOD):**
```typescript
import { getApiUrl, getAuthHeaders } from '@/config/api';
import API_CONFIG from '@/config/api';

const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ORDER_IMPORT), {
  method: 'POST',
  headers: getAuthHeaders(authToken),
  body: formData,
});
```

## 🧪 **Testing Different Environments**

### **Development (Staging API):**
```bash
npm run dev
# Uses: https://staging.parcelace.io/
```

### **Staging:**
```bash
npm run dev:staging
# Uses: https://staging.parcelace.io/
```

### **Production:**
```bash
npm run dev:production
# Uses: https://app.parcelace.io/
```

## 📊 **Current Status**

### ✅ **Already Fixed:**
- `src/config/api.ts` - Added ORDER_IMPORT endpoint
- `src/components/OrdersPage.tsx` - Import function updated
- `src/config/environment.ts` - New environment system

### ⚠️ **Needs Migration:**
- `AddOrder.tsx` - Line 188
- `ShipmentPage.tsx` - Line 187
- `LoginScreen.tsx` - Line 23
- `ViewOrderDetails.tsx` - Lines 104, 168, 306, 478
- `WarehouseScreen.tsx` - Line 64
- `ForgotPasswordScreen.tsx` - Line 20
- `ResetPasswordScreen.tsx` - Line 48
- `CourierPartnerSelection.tsx` - Lines 172, 179, 412, 415, 427, 793

## 🚀 **Benefits After Migration**

1. **✅ Environment Management**: Easy switch between staging/production
2. **✅ Consistency**: All API calls use the same base URL
3. **✅ Maintainability**: Single place to change API configuration
4. **✅ Debugging**: Better logging and error tracking
5. **✅ Scalability**: Easy to add new environments

## 🔍 **Verification Steps**

### **1. Check Environment Detection**
```javascript
// In browser console
import { ENVIRONMENT } from '@/config/environment';
console.log(ENVIRONMENT.getInfo());
```

### **2. Verify API URLs**
```javascript
// Should show correct URL for current environment
import { getApiUrl } from '@/config/api';
console.log(getApiUrl('api/order'));
```

### **3. Test Import Function**
- Use the "Test API" button in development mode
- Check console for environment info
- Verify correct base URL is used

## 📞 **Next Steps**

1. **Create environment files** (`.env.development`, `.env.staging`)
2. **Migrate high-priority components** first
3. **Test in different environments**
4. **Update deployment scripts** to use correct modes
5. **Remove hardcoded URLs** from all components

---

**Status**: 🚧 **In Progress** - Environment system created, migration needed
**Priority**: 🔴 **High** - Import functionality depends on this
**Estimated Time**: 2-3 hours for complete migration
