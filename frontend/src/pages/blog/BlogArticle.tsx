import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface ArticleMeta {
  slug: string
  title: string
  category: string
  date: string
  excerpt: string
}

// シンプルなMarkdownパーサー
function parseMarkdown(markdown: string): string {
  let html = markdown
    // h2
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-orange-400">$1</h2>')
    // h3
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-200">$1</h3>')
    // h1 (タイトル - 非表示、メタデータから取得)
    .replace(/^# (.+)$/gm, '')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // リスト
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // 段落
    .replace(/^(?!<[hlu])(.+)$/gm, '<p class="text-gray-300 leading-relaxed mb-4">$1</p>')
    // 空のp削除
    .replace(/<p class="text-gray-300 leading-relaxed mb-4"><\/p>/g, '')
    // リストをulで囲む
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="list-disc list-inside text-gray-300 space-y-2 mb-4">${match}</ul>`)

  return html
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState<string>('')
  const [meta, setMeta] = useState<ArticleMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        // 記事一覧からメタデータを取得
        const indexRes = await fetch('/blog/index.json')
        const indexData = await indexRes.json()
        const articleMeta = indexData.articles.find((a: ArticleMeta) => a.slug === slug)

        if (!articleMeta) {
          setError('記事が見つかりません')
          setLoading(false)
          return
        }

        setMeta(articleMeta)

        // Markdownファイルを取得
        const mdRes = await fetch(`/blog/${slug}.md`)
        if (!mdRes.ok) {
          setError('記事の読み込みに失敗しました')
          setLoading(false)
          return
        }

        const mdText = await mdRes.text()
        setContent(parseMarkdown(mdText))
        setLoading(false)
      } catch {
        setError('記事の読み込みに失敗しました')
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error || !meta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || '記事が見つかりません'}</h1>
          <Link to="/" className="text-orange-400 hover:underline">ホームに戻る</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>ホームに戻る</span>
          </Link>
        </div>
      </header>

      {/* 記事コンテンツ */}
      <article className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <header className="mb-12">
          <p className="text-orange-400 mb-2">{meta.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{meta.title}</h1>
          <p className="text-gray-400">{meta.date} 公開</p>
        </header>

        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* CTA */}
        <div className="bg-gray-800 rounded-xl p-6 mt-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Gesdro!で練習してみよう</h3>
          <p className="text-gray-300 mb-4">
            この記事で紹介したテクニックを、実際に練習してみませんか？
          </p>
          <Link
            to="/gesdro"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Gesdro!を使ってみる
          </Link>
        </div>
      </article>

      {/* フッター */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 ennui-lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
