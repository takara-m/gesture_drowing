import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { Pencil, BookOpen, Mail, Globe } from 'lucide-react'
import { AnimatedLogo } from '../components/AnimatedLogo'

interface ArticleMeta {
  slug: string
  title: string
  category: string
  date: string
  excerpt: string
}

export default function Home() {
  const { language, setLanguage, t } = useLanguage()
  const [articles, setArticles] = useState<ArticleMeta[]>([])

  useEffect(() => {
    fetch('/blog/index.json')
      .then(res => res.json())
      .then(data => setArticles(data.articles))
      .catch(() => setArticles([]))
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-400">ennui-lab</h1>
          <div className="flex gap-2">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Mail size={18} />
              <span className="hidden sm:inline">{t('contact.title')}</span>
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{language === 'ja' ? '日本語' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="pt-20">
        {/* ヒーローセクション */}
        <section className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ja' ? 'クリエイティブツールを作っています' : 'Building Creative Tools'}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {language === 'ja'
              ? '絵を描くことをもっと楽しく、もっと上達しやすく。シンプルで使いやすいツールを提供しています。'
              : 'Making drawing more fun and easier to improve. We provide simple and easy-to-use tools.'}
          </p>
        </section>

        {/* アプリ紹介セクション */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {language === 'ja' ? 'アプリケーション' : 'Applications'}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gesdro!カード */}
            <Link
              to="/gesdro"
              className="group bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-all hover:scale-[1.02] hover:shadow-xl border border-gray-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <AnimatedLogo compact />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-orange-400">Gesdro!</h4>
                  <p className="text-sm text-gray-400">
                    {language === 'ja' ? '顔描き練習ツール' : 'Face Drawing Practice'}
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                {language === 'ja'
                  ? '2ステップで顔の描き方を学べる練習ツール。トレースモードと独立描画モードで段階的にスキルアップ。'
                  : 'A practice tool to learn face drawing in 2 steps. Improve your skills progressively with tracing and independent drawing modes.'}
              </p>
              <div className="flex items-center text-orange-400 group-hover:translate-x-2 transition-transform">
                <span>{language === 'ja' ? '使ってみる' : 'Try it'}</span>
                <Pencil size={16} className="ml-2" />
              </div>
            </Link>

            {/* 今後のアプリ（プレースホルダー） */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 border-dashed opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">?</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-500">Coming Soon</h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '準備中' : 'In Development'}
                  </p>
                </div>
              </div>
              <p className="text-gray-500">
                {language === 'ja'
                  ? '新しいクリエイティブツールを開発中です。お楽しみに！'
                  : 'New creative tools are in development. Stay tuned!'}
              </p>
            </div>
          </div>
        </section>

        {/* ブログセクション */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {language === 'ja' ? 'ブログ' : 'Blog'}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="group bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-all hover:scale-[1.02] border border-gray-700"
              >
                <div className="flex items-center gap-2 text-orange-400 mb-3">
                  <BookOpen size={18} />
                  <span className="text-sm">{article.category}</span>
                </div>
                <h4 className="text-lg font-bold mb-2">{article.title}</h4>
                <p className="text-gray-400 text-sm">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* プロフィールセクション */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {language === 'ja' ? '開発者について' : 'About the Developer'}
          </h3>

          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl mx-auto border border-gray-700">
            <p className="text-gray-300 leading-relaxed">
              {language === 'ja'
                ? 'ennui-labは、クリエイティブな活動をサポートするツールを開発しています。「もっと簡単に、もっと楽しく」をモットーに、誰でも使えるシンプルなアプリケーションを目指しています。'
                : 'ennui-lab develops tools to support creative activities. With the motto "simpler and more fun," we aim to create applications that anyone can use.'}
            </p>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 ennui-lab. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">
              {language === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
            </Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">
              {language === 'ja' ? 'お問い合わせ' : 'Contact'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
