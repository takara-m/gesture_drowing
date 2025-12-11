import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdSenseProvider } from './contexts/AdSenseContext'
import GesdroApp from './pages/GesdroApp'
import { TemplateStore } from './pages/TemplateStore'
import { TemplateStoreSuccess } from './pages/TemplateStoreSuccess'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AdSenseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GesdroApp />} />
            <Route path="/templates" element={<TemplateStore />} />
            <Route path="/templates/success" element={<TemplateStoreSuccess />} />
          </Routes>
        </BrowserRouter>
      </AdSenseProvider>
    </LanguageProvider>
  )
}

export default App
