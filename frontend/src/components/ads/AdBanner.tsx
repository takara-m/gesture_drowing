import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

/**
 * 再利用可能なAdSenseバナー広告コンポーネント
 * レスポンシブ対応で様々な画面サイズに対応
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // AdSenseが読み込まれているか確認
      if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
        // 既に広告が初期化されているか確認
        const isAlreadyInitialized = adRef.current.getAttribute('data-adsbygoogle-status');

        if (!isAlreadyInitialized) {
          // 広告を初期化
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log(`[AdBanner] Ad initialized for slot: ${slot}`);
        }
      }
    } catch (error) {
      console.error('[AdBanner] Error initializing ad:', error);
    }
  }, [slot]);

  return (
    <div className={`ad-banner-container flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

// window.adsbygoogleの型定義
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
