import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import BulkVCard from './BulkVCard.tsx'
import PrivacyPolicy from './PrivacyPolicy.tsx'
import TermsOfService from './TermsOfService.tsx'
import McpDocs from './McpDocs.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/vcard/bulk" element={<BulkVCard />} />
        <Route path="/policies/privacy" element={<PrivacyPolicy />} />
        <Route path="/policies/tos" element={<TermsOfService />} />
        <Route path="/privacy" element={<Navigate to="/policies/privacy" replace />} />
        <Route path="/docs/mcp" element={<McpDocs />} />
        <Route path="/:type" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
