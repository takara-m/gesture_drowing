import { useState } from 'react'
import { Globe, HelpCircle } from 'lucide-react'
import FaceGestureDrawingTool from './components/FaceGestureDrawingTool'
import { PhotoManager } from './pages/PhotoManager'
import FAQ from './pages/FAQ'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import type { Photo } from './services/db'
import './App.css'

function AppContent() {
  const { language, setLanguage, t } = useLanguage()
  const [currentView, setCurrentView] = useState<'drawing' | 'photos' | 'faq'>('photos')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [practiceFolderId, setPracticeFolderId] = useState<string | null>(null)

  const handlePhotoSelect = (photo: Photo, folderId: string | null = null) => {
    setSelectedPhoto(photo)
    setPracticeFolderId(folderId)
    setCurrentView('drawing')
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja')
  }

  return (
    <>
      {/* ヘッダーボタン（固定位置） */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* ヘルプボタン */}
        <button
          onClick={() => setCurrentView('faq')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow-lg transition-colors border border-gray-300"
          title="FAQ"
        >
          <HelpCircle size={20} />
        </button>

        {/* 言語切り替えボタン */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow-lg transition-colors border border-gray-300"
          title={t('language.select')}
        >
          <Globe size={20} />
          <span className="font-semibold">{language === 'ja' ? '日本語' : 'English'}</span>
        </button>
      </div>

      {currentView === 'faq' ? (
        <FAQ onBack={() => setCurrentView('photos')} />
      ) : currentView === 'photos' ? (
        <PhotoManager onPhotoSelect={handlePhotoSelect} />
      ) : (
        <FaceGestureDrawingTool
          selectedPhoto={selectedPhoto}
          practiceFolderId={practiceFolderId}
          onBackToPhotos={() => setCurrentView('photos')}
        />
      )}
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
