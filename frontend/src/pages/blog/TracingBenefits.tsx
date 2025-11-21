import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { ArrowLeft, Globe } from 'lucide-react'

export default function TracingBenefits() {
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

      {/* 記事コンテンツ */}
      <article className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <header className="mb-12">
          <p className="text-orange-400 mb-2">
            {language === 'ja' ? '練習法' : 'Practice Method'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ja'
              ? 'トレース練習が上達に効果的な理由'
              : 'Why Tracing Practice is Effective for Improvement'}
          </h1>
          <p className="text-gray-400">
            {language === 'ja' ? '2025年1月 公開' : 'Published January 2025'}
          </p>
        </header>

        {language === 'ja' ? (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">トレースは「ズル」ではない</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              「トレースは絵の練習にならない」「ズルだ」という意見を聞いたことがあるかもしれません。しかし、これは大きな誤解です。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              トレース練習は、多くのプロのイラストレーターや美術教育者が推奨する、効果的な練習方法のひとつです。特に初心者にとって、正しいプロポーションや線の引き方を学ぶ上で非常に有効です。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">なぜトレースが効果的なのか</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">1. 正しいプロポーションを体で覚える</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              トレースを繰り返すことで、顔のパーツの正しい位置関係が手に染み付きます。これは「筋肉記憶」と呼ばれ、意識しなくても自然に正しい比率で描けるようになる効果があります。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">2. 線の引き方が上達する</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              何を描くか考えながら線を引くのは、実は同時に二つのことをしている状態です。トレースでは「何を描くか」を考える必要がないため、線の引き方に集中できます。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">3. 観察力が養われる</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              トレースするためには、元の絵や写真をよく観察する必要があります。「ここはこういうカーブになっているのか」「この線はここから始まっているのか」という発見が、観察力を高めます。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">効果的なトレース練習のコツ</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>ただなぞるだけでなく、なぜその位置にあるのかを考える</li>
              <li>同じ写真を何度もトレースして、変化を確認する</li>
              <li>トレース後に、何も見ずに同じものを描いてみる</li>
              <li>様々なタイプの顔でトレースを練習する</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">トレースから独立描画へ</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              トレース練習で基礎を固めたら、次のステップとして独立描画に挑戦しましょう。参考写真を見ながら、自分の力で描く練習です。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              最初は難しく感じるかもしれませんが、トレースで培った筋肉記憶と観察力が必ず活きてきます。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">2ステップ学習法</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Gesdro!では、この「トレース → 独立描画」の流れを2ステップシステムとして実装しています。
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li><strong>ステップ1（トレースモード）</strong>：写真の上に直接描画して、基本を学ぶ</li>
              <li><strong>ステップ2（独立描画モード）</strong>：写真を参考にしながら、自分の力で描く</li>
            </ul>

            <div className="bg-gray-800 rounded-xl p-6 mt-8 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Gesdro!で2ステップ練習を始めよう</h3>
              <p className="text-gray-300 mb-4">
                トレースモードと独立描画モードを使い分けて、効率的に上達しましょう。
              </p>
              <Link
                to="/gesdro"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Gesdro!を使ってみる
              </Link>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">Tracing is NOT "Cheating"</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may have heard opinions like "tracing doesn't count as practice" or "it's cheating." However, this is a big misunderstanding.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Tracing practice is one of the effective methods recommended by many professional illustrators and art educators. It's particularly useful for beginners to learn correct proportions and line techniques.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">Why Tracing is Effective</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">1. Learning Correct Proportions Through Muscle Memory</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              By repeatedly tracing, the correct positioning of facial features becomes ingrained in your hands. This is called "muscle memory," which allows you to naturally draw with correct proportions without conscious effort.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">2. Improving Line Drawing Skills</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Drawing while thinking about what to draw is actually doing two things at once. With tracing, you don't need to think about "what to draw," allowing you to focus on how to draw lines.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-200">3. Developing Observation Skills</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Tracing requires careful observation of the original image or photo. Discoveries like "so this curves this way" or "this line starts from here" enhance your observation skills.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">Tips for Effective Tracing Practice</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Don't just trace—think about why elements are positioned where they are</li>
              <li>Trace the same photo multiple times and observe your improvement</li>
              <li>After tracing, try drawing the same thing without looking</li>
              <li>Practice tracing various types of faces</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">From Tracing to Independent Drawing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Once you've built a foundation through tracing practice, challenge yourself with independent drawing. This means drawing with your own abilities while using reference photos.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              It may feel difficult at first, but the muscle memory and observation skills you've developed through tracing will definitely help.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">2-Step Learning Method</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Gesdro! implements this "Tracing → Independent Drawing" flow as a 2-step system.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li><strong>Step 1 (Tracing Mode)</strong>: Draw directly over photos to learn the basics</li>
              <li><strong>Step 2 (Independent Drawing Mode)</strong>: Draw with your own abilities while using photos as reference</li>
            </ul>

            <div className="bg-gray-800 rounded-xl p-6 mt-8 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Start 2-Step Practice with Gesdro!</h3>
              <p className="text-gray-300 mb-4">
                Use tracing mode and independent drawing mode to improve efficiently.
              </p>
              <Link
                to="/gesdro"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Gesdro!
              </Link>
            </div>
          </div>
        )}
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
