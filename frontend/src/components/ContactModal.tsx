import { useState, FormEvent } from 'react'
import { X, Mail, User, MessageSquare, Tag, CheckCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.emailRequired')
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.emailInvalid')
    }

    if (!formData.subject) {
      newErrors.subject = t('contact.subjectRequired')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.messageRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('https://formspree.io/f/xwpakjlj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-procreate-card rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-procreate-card border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">{t('contact.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-procreate-hover rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle size={64} className="text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t('contact.successTitle')}</h3>
              <p className="text-gray-300">{t('contact.successMessage')}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-6">{t('contact.description')}</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <User size={16} />
                    {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={t('contact.namePlaceholder')}
                    className={`w-full px-4 py-3 bg-procreate-bg text-white rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Mail size={16} />
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('contact.emailPlaceholder')}
                    className={`w-full px-4 py-3 bg-procreate-bg text-white rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <Tag size={16} />
                    {t('contact.subject')}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={`w-full px-4 py-3 bg-procreate-bg text-white rounded-lg border ${
                      errors.subject ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  >
                    <option value="">{t('contact.subjectPlaceholder')}</option>
                    <option value="question">{t('contact.subjectOptions.question')}</option>
                    <option value="bug">{t('contact.subjectOptions.bug')}</option>
                    <option value="feature">{t('contact.subjectOptions.feature')}</option>
                    <option value="other">{t('contact.subjectOptions.other')}</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                    <MessageSquare size={16} />
                    {t('contact.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={6}
                    className={`w-full px-4 py-3 bg-procreate-bg text-white rounded-lg border ${
                      errors.message ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-400">{t('contact.errorTitle')}</p>
                      <p className="text-sm text-red-300 mt-1">{t('contact.errorMessage')}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      {t('contact.submit')}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
