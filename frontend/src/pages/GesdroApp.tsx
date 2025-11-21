import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, HelpCircle, Mail, Home } from 'lucide-react'
import FaceGestureDrawingTool from '../components/FaceGestureDrawingTool'
import ContactModal from '../components/ContactModal'
import { PhotoManager } from './PhotoManager'
import FAQ from './FAQ'
import { useLanguage } from '../contexts/LanguageContext'
import { useAdSenseContext } from '../contexts/AdSenseContext'
import type { Photo } from '../services/db'
import { AdSenseScript, AdInterstitial } from '../components/ads'

export default function GesdroApp() {
  const { language, setLanguage, t } = useLanguage()
  const [currentView, setCurrentView] = useState<'drawing' | 'photos' | 'faq'>('photos')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [practiceFolderId, setPracticeFolderId] = useState<string | null>(null)
  const [previousView, setPreviousView] = useState<'drawing' | 'photos' | 'faq'>('photos')
  const [viewBeforeFAQ, setViewBeforeFAQ] = useState<'drawing' | 'photos'>('photos')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // 広告管理用のContext
  const { showInterstitial, triggerInterstitial, closeInterstitial } = useAdSenseContext()

  // ビュー変更を検出してインタースティシャル広告を表示
  useEffect(() => {
    if (previousView !== currentView) {
      console.log(`[App] View changed: ${previousView} -> ${currentView}`);

      // 練習画面から戻る際は広告をスキップ
      if (previousView === 'drawing' && currentView === 'photos') {
        console.log('[App] Returning from practice screen, skipping interstitial ad');
        setPreviousView(currentView);
        return;
      }

      // FAQ関連の遷移は広告をスキップ（開く・戻る両方）
      if (currentView === 'faq' || previousView === 'faq') {
        console.log('[App] FAQ transition, skipping interstitial ad');
        setPreviousView(currentView);
        return;
      }

      // その他の遷移は広告を表示
      triggerInterstitial();
      setPreviousView(currentView);
    }
  }, [currentView, previousView, triggerInterstitial])

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
      {/* Google AdSenseスクリプト読み込み */}
      <AdSenseScript clientId={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000'} />

      {/* インタースティシャル広告 */}
      <AdInterstitial show={showInterstitial} onClose={closeInterstitial} />

      {/* ヘッダーボタン（固定位置・レスポンシブ対応） */}
      <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
        {/* ホームへ戻るボタン */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover shadow-lg transition-all hover:scale-[0.98] active:scale-[0.98] border border-gray-600"
          title={language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
        >
          <Home size={20} />
        </Link>

        {/* お問い合わせボタン */}
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover shadow-lg transition-all hover:scale-[0.98] active:scale-[0.98] border border-gray-600"
          title={t('contact.title')}
        >
          <Mail size={20} />
        </button>

        {/* ヘルプボタン */}
        <button
          onClick={() => {
            if (currentView !== 'faq') {
              setViewBeforeFAQ(currentView as 'drawing' | 'photos');
            }
            setCurrentView('faq');
          }}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover shadow-lg transition-all hover:scale-[0.98] active:scale-[0.98] border border-gray-600"
          title="FAQ"
        >
          <HelpCircle size={20} />
        </button>

        {/* 言語切り替えボタン */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover shadow-lg transition-all hover:scale-[0.98] active:scale-[0.98] border border-gray-600"
          title={t('language.select')}
        >
          <Globe size={20} />
          <span className="hidden sm:inline font-semibold">{language === 'ja' ? '日本語' : 'English'}</span>
        </button>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {currentView === 'faq' ? (
        <FAQ onBack={() => setCurrentView(viewBeforeFAQ)} />
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
