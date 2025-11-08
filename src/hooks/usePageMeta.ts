// Custom hook for managing page titles and meta descriptions
import { useEffect } from 'react';

interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export const usePageMeta = (meta: PageMeta) => {
  useEffect(() => {
    // Update document title
    if (meta.title) {
      document.title = meta.title;
    }

    // Update meta description
    if (meta.description) {
      updateMetaTag('name', 'description', meta.description);
    }

    // Update meta keywords
    if (meta.keywords) {
      updateMetaTag('name', 'keywords', meta.keywords);
    }

    // Update Open Graph tags
    if (meta.ogTitle) {
      updateMetaTag('property', 'og:title', meta.ogTitle);
    }
    if (meta.ogDescription) {
      updateMetaTag('property', 'og:description', meta.ogDescription);
    }
    if (meta.ogImage) {
      updateMetaTag('property', 'og:image', meta.ogImage);
    }

    // Update Twitter tags
    if (meta.twitterTitle) {
      updateMetaTag('name', 'twitter:title', meta.twitterTitle);
    }
    if (meta.twitterDescription) {
      updateMetaTag('name', 'twitter:description', meta.twitterDescription);
    }
    if (meta.twitterImage) {
      updateMetaTag('name', 'twitter:image', meta.twitterImage);
    }
  }, [meta]);
};

// Helper function to update or create meta tags
const updateMetaTag = (attribute: string, name: string, content: string) => {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
};

// Predefined meta configurations for different pages
export const PageMetaConfigs = {
  // Dashboard pages
  orders: {
    title: 'Orders Management - ParcelAce',
    description: 'Manage and track your orders efficiently with ParcelAce. View order details, update status, and streamline your order processing workflow.',
    keywords: 'order management, order tracking, order processing, order status, order details'
  },
  
  shipments: {
    title: 'Shipment Tracking - ParcelAce',
    description: 'Track your shipments in real-time with ParcelAce. Monitor delivery status, get updates, and ensure successful package delivery.',
    keywords: 'shipment tracking, package tracking, delivery status, courier tracking, logistics tracking'
  },
  
  analytics: {
    title: 'Analytics & Reports - ParcelAce',
    description: 'Get insights into your shipping operations with ParcelAce analytics. View performance metrics, generate reports, and optimize your logistics.',
    keywords: 'shipping analytics, logistics reports, performance metrics, shipping insights, data analytics'
  },
  
  users: {
    title: 'Support User Management - ParcelAce',
    description: 'Manage support users and their information with ParcelAce. View user details, contact information, and account creation dates.',
    keywords: 'user management, support users, user administration, user details, account management'
  },
  
  // Auth pages
  login: {
    title: 'Login - ParcelAce',
    description: 'Sign in to your ParcelAce account to manage your shipping operations and track your shipments.',
    keywords: 'login, sign in, parcelace login, shipping management login'
  },
  
  signup: {
    title: 'Sign Up - ParcelAce',
    description: 'Create your ParcelAce account and start managing your shipping operations efficiently.',
    keywords: 'sign up, register, create account, parcelace registration'
  },
  
  forgotPassword: {
    title: 'Reset Password - ParcelAce',
    description: 'Reset your ParcelAce account password securely and regain access to your shipping management dashboard.',
    keywords: 'reset password, forgot password, password recovery, account recovery'
  },
  
  // Public pages
  home: {
    title: 'ParcelAce - Smart Shipping & Logistics Management',
    description: 'Streamline your shipping operations with ParcelAce. Manage orders, track shipments, and optimize logistics with our comprehensive shipping management platform.',
    keywords: 'shipping management, logistics, order tracking, courier services, parcel delivery, shipment tracking, logistics software'
  },
  
  tracking: {
    title: 'Track Your Shipment - ParcelAce',
    description: 'Track your package delivery status in real-time. Enter your tracking number to get instant updates on your shipment.',
    keywords: 'package tracking, shipment tracking, delivery tracking, courier tracking, track package'
  }
};

export default usePageMeta;
