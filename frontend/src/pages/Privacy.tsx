import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { ArrowLeft, Globe } from 'lucide-react'

export default function Privacy() {
  const { language, setLanguage } = useLanguage()

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
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">
          {language === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
        </h1>

        {language === 'ja' ? (
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">データの保存について</h2>
              <p className="text-gray-300 leading-relaxed">
                本アプリケーション（Gesdro!）では、ユーザーがアップロードした写真や描画データはすべてお使いのブラウザ内（IndexedDB）に保存されます。これらのデータは外部サーバーに送信されることはありません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">収集する情報</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                本サービスでは、以下の情報を収集する場合があります：
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>お問い合わせフォームから送信された情報（お名前、メールアドレス、メッセージ内容）</li>
                <li>Googleアナリティクス等の分析ツールによる匿名の利用統計情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">広告について</h2>
              <p className="text-gray-300 leading-relaxed">
                本サービスでは、第三者配信の広告サービスを利用する場合があります。これらの広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Cookieの使用</h2>
              <p className="text-gray-300 leading-relaxed">
                本サービスでは、サービス改善のためにCookieを使用する場合があります。ブラウザの設定でCookieを無効にすることも可能ですが、一部の機能が正しく動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">プライバシーポリシーの変更</h2>
              <p className="text-gray-300 leading-relaxed">
                本プライバシーポリシーは、必要に応じて変更されることがあります。変更があった場合は、本ページにて公開いたします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">お問い合わせ</h2>
              <p className="text-gray-300 leading-relaxed">
                プライバシーポリシーに関するお問い合わせは、
                <Link to="/contact" className="text-orange-400 hover:underline">お問い合わせフォーム</Link>
                よりご連絡ください。
              </p>
            </section>

            <p className="text-gray-500 text-sm mt-8">最終更新日：2025年1月</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Data Storage</h2>
              <p className="text-gray-300 leading-relaxed">
                In this application (Gesdro!), all photos uploaded by users and drawing data are stored in your browser (IndexedDB). This data is never sent to external servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                This service may collect the following information:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Information submitted through the contact form (name, email address, message content)</li>
                <li>Anonymous usage statistics through analytics tools such as Google Analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">About Advertising</h2>
              <p className="text-gray-300 leading-relaxed">
                This service may use third-party advertising services. These advertising service providers may use cookies to display ads based on user interests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Use of Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                This service may use cookies to improve service quality. You can disable cookies in your browser settings, but some features may not work correctly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Changes to Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                This privacy policy may be changed as needed. Any changes will be published on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-orange-400">Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                For inquiries regarding this privacy policy, please contact us through the
                <Link to="/contact" className="text-orange-400 hover:underline"> contact form</Link>.
              </p>
            </section>

            <p className="text-gray-500 text-sm mt-8">Last updated: January 2025</p>
          </div>
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
