import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import tracking test utilities for development
import './utils/testTrackingIntegration'

createRoot(document.getElementById("root")!).render(<App />);
