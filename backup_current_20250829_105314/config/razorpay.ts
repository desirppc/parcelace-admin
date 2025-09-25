export const RAZORPAY_CONFIG = {
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || '',
  CURRENCY: 'INR',
  NAME: 'ParcelAce',
  DESCRIPTION: 'ParcelAce Wallet Recharge',
  IMAGE: 'https://app.parcelace.io/favicon.ico',
  PREFILL: {
    NAME: '',
    EMAIL: '',
    CONTACT: ''
  },
  NOTES: {
    ADDRESS: 'ParcelAce Shipping Solutions'
  },
  THEME: {
    COLOR: '#6366f1'
  }
};

export const PAYMENT_CONFIG = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 100000,
  DEFAULT_AMOUNT: 1000,
  AMOUNT_STEPS: [100, 500, 1000, 2000, 5000, 10000],
  CURRENCY: 'INR',
  COMPANY_NAME: 'ParcelAce',
  COMPANY_DESCRIPTION: 'ParcelAce Wallet Recharge',
  COMPANY_LOGO: 'https://app.parcelace.io/favicon.ico',
  THEME_COLOR: '#6366f1',
  SUCCESS_URL: `${window.location.origin}/payment/success`,
  CANCEL_URL: `${window.location.origin}/payment/cancel`,
  FAILURE_URL: `${window.location.origin}/payment/failure`
}; 