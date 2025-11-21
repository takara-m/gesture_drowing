import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdSenseProvider } from './contexts/AdSenseContext'
import Home from './pages/Home'
import GesdroApp from './pages/GesdroApp'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import BlogArticle from './pages/blog/BlogArticle'
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
            <Route path="/blog/:slug" element={<BlogArticle />} />
          </Routes>
        </BrowserRouter>
      </AdSenseProvider>
    </LanguageProvider>
  )
}

export default App
