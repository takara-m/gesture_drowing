import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { ArrowLeft, Globe } from 'lucide-react'

export default function DrawingTips() {
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
            {language === 'ja' ? 'チュートリアル' : 'Tutorial'}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ja'
              ? '顔の描き方のコツ：初心者向けガイド'
              : 'Tips for Drawing Faces: A Beginner\'s Guide'}
          </h1>
          <p className="text-gray-400">
            {language === 'ja' ? '2025年1月 公開' : 'Published January 2025'}
          </p>
        </header>

        {language === 'ja' ? (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">1. 顔の基本的なプロポーション</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              顔を描くときに最も重要なのは、各パーツの位置関係を理解することです。多くの初心者が陥りがちな間違いは、目を顔の上の方に描きすぎることです。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              実際には、目は顔の縦方向のほぼ中央に位置しています。これを意識するだけで、顔のバランスが大きく改善されます。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">2. 目の位置と間隔</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              目と目の間隔は、およそ「目ひとつ分」です。この法則を覚えておくと、顔の横幅のバランスが取りやすくなります。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              また、目の外側から顔の輪郭までの距離も、だいたい目ひとつ分になっています。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">3. 鼻と口の位置</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              鼻の位置は、目と顎のちょうど中間あたりです。口は鼻と顎の間の、やや上寄りに位置します。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              これらの比率を意識しながら描くことで、自然なバランスの顔が描けるようになります。
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">4. よくある間違いと対策</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>目が高すぎる → 顔の中央に目を配置することを意識する</li>
              <li>顔が平面的になる → 顔の丸みを意識して、影をつける</li>
              <li>左右非対称になる → 補助線を引いて位置を確認する</li>
              <li>表情が硬い → 眉の角度や口の形を少し変えてみる</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">5. 練習方法</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              最も効果的な練習方法のひとつは、写真の上からトレースすることです。これにより、正しいプロポーションを体で覚えることができます。
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Gesdro!を使えば、2ステップで段階的に練習できます。まずトレースモードで基本を掴み、その後独立描画モードで実力を試してみましょう。
            </p>

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
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">1. Basic Facial Proportions</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The most important thing when drawing faces is understanding the positional relationship of each feature. A common mistake beginners make is drawing the eyes too high on the face.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              In reality, the eyes are positioned roughly in the vertical center of the face. Just being aware of this can greatly improve your facial balance.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">2. Eye Position and Spacing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The space between the eyes is approximately "one eye width." Remembering this rule makes it easier to balance the width of the face.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Additionally, the distance from the outer edge of the eye to the face outline is also about one eye width.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">3. Nose and Mouth Position</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The nose is positioned roughly halfway between the eyes and chin. The mouth is located slightly above the midpoint between the nose and chin.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              By being aware of these proportions while drawing, you can create naturally balanced faces.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">4. Common Mistakes and Solutions</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Eyes too high → Focus on placing eyes at the center of the face</li>
              <li>Face looks flat → Be aware of facial roundness and add shadows</li>
              <li>Asymmetrical → Draw guide lines to check positions</li>
              <li>Expression looks stiff → Try adjusting eyebrow angles or mouth shape</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-400">5. Practice Methods</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              One of the most effective practice methods is tracing over photos. This helps you internalize correct proportions through muscle memory.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              With Gesdro!, you can practice progressively in 2 steps. First grasp the basics in tracing mode, then test your skills in independent drawing mode.
            </p>

            <div className="bg-gray-800 rounded-xl p-6 mt-8 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Practice with Gesdro!</h3>
              <p className="text-gray-300 mb-4">
                Want to practice the techniques introduced in this article?
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
