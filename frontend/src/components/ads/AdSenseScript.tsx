import { useEffect } from 'react';

interface AdSenseScriptProps {
  clientId: string;
}

/**
 * Google AdSenseスクリプトを読み込むコンポーネント
 * アプリケーション全体で一度だけ使用
 */
export const AdSenseScript: React.FC<AdSenseScriptProps> = ({ clientId }) => {
  useEffect(() => {
    // 既にスクリプトが読み込まれているかチェック
    const existingScript = document.querySelector(
      `script[src*="adsbygoogle.js"]`
    );

    if (existingScript) {
      console.log('[AdSense] Script already loaded');
      return;
    }

    // AdSenseスクリプトを動的に読み込み
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('[AdSense] Script loaded successfully');
    };

    script.onerror = () => {
      console.error('[AdSense] Failed to load script');
    };

    document.head.appendChild(script);

    return () => {
      // クリーンアップは通常不要（スクリプトは残しておく）
    };
  }, [clientId]);

  return null; // このコンポーネントは何もレンダリングしない
};
