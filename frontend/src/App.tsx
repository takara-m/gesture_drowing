import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdSenseProvider } from './contexts/AdSenseContext'
import Home from './pages/Home'
import GesdroApp from './pages/GesdroApp'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import DrawingTips from './pages/blog/DrawingTips'
import TracingBenefits from './pages/blog/TracingBenefits'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AdSenseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gesdro" element={<GesdroApp />} />
            <Route path="/gesdro/*" element={<GesdroApp />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog/drawing-tips" element={<DrawingTips />} />
            <Route path="/blog/tracing-benefits" element={<TracingBenefits />} />
          </Routes>
        </BrowserRouter>
      </AdSenseProvider>
    </LanguageProvider>
  )
}

export default App
