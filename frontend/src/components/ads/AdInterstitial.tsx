import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdInterstitialProps {
  show: boolean;
  onClose: () => void;
}

/**
 * 全画面インタースティシャル広告コンポーネント
 * 5秒後に自動で閉じる、3秒後から手動で閉じることも可能
 */
export const AdInterstitial: React.FC<AdInterstitialProps> = ({
  show,
  onClose
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (show) {
      // カウントダウンをリセット
      setCountdown(5);
      setCanClose(false);

      // 1秒ごとにカウントダウン
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // カウントダウン終了時に自動で閉じる
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 3秒後に手動で閉じられるようにする
      const closeTimer = setTimeout(() => {
        setCanClose(true);
      }, 3000);

      // クリーンアップ
      return () => {
        clearInterval(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      // 広告を初期化
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log('[AdInterstitial] Ad initialized');
        }
      } catch (error) {
        console.error('[AdInterstitial] Error initializing ad:', error);
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
      <div className="relative bg-procreate-card p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* 閉じるボタン（3秒後から表示） */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 bg-procreate-tag text-white rounded-full hover:bg-procreate-hover transition-all hover:scale-110"
            title="広告を閉じる"
          >
            <X size={20} />
          </button>
        )}

        {/* カウントダウン表示 */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-300">
            {countdown}秒後に自動で閉じます...
          </p>
        </div>

        {/* 広告コンテナ */}
        <div className="ad-interstitial-container flex justify-center bg-white rounded-lg p-2">
          <ins
            className="adsbygoogle"
            style={{
              display: 'inline-block',
              width: '300px',
              height: '250px'
            }}
            data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000'}
            data-ad-slot={import.meta.env.VITE_ADSENSE_INTERSTITIAL_SLOT || '1234567890'}
          />
        </div>

        {/* 手動で閉じるヒント（3秒後から表示） */}
        {canClose && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              右上の×ボタンで閉じることもできます
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// フェードインアニメーション用のカスタムCSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);
