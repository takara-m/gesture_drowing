import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowLeft, Globe, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function Contact() {
  const { language, setLanguage, t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('https://formspree.io/f/xwpakjlj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      })

      if (response.ok) {
        setStatus('success')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      setStatus('error')
      setErrorMessage(t('contact.error'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>{language === 'ja' ? 'ホームに戻る' : 'Back to Home'}</span>
          </Link>
          <button
            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Globe size={18} />
          </button>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">{t('contact.title')}</h1>

        {status === 'success' ? (
          <div className="bg-green-900/50 border border-green-700 rounded-xl p-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-bold mb-2">{t('contact.success')}</h2>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300">{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                placeholder={t('contact.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                placeholder={t('contact.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.subject')}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                placeholder={t('contact.subjectPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.message')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder={t('contact.messagePlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'submitting' ? (
                <span>{t('contact.sending')}</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>{t('contact.send')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 ennui-lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
