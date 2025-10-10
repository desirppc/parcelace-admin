import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import tracking test utilities for development
import './utils/testTrackingIntegration'

// Import session expiry test utilities for development
import './utils/testSessionExpiry'

// Import smart caching test utilities for development
import './utils/testSmartCaching'

createRoot(document.getElementById("root")!).render(<App />);
