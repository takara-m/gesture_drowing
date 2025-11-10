import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AdSenseContextType {
  showInterstitial: boolean;
  isInterstitialActive: boolean;
  triggerInterstitial: () => void;
  closeInterstitial: () => void;
}

const AdSenseContext = createContext<AdSenseContextType | undefined>(undefined);

/**
 * AdSense広告の状態を管理するContextプロバイダー
 * アプリ全体で広告状態を共有
 */
export const AdSenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isInterstitialActive, setIsInterstitialActive] = useState(false);

  /**
   * インタースティシャル広告を表示
   * 既に表示中の場合は無視（重複防止）
   */
  const triggerInterstitial = useCallback(() => {
    if (isInterstitialActive) {
      console.log('[AdSense] Interstitial already active, skipping');
      return;
    }

    console.log('[AdSense] Triggering interstitial ad');
    setShowInterstitial(true);
    setIsInterstitialActive(true);
  }, [isInterstitialActive]);

  /**
   * インタースティシャル広告を閉じる
   */
  const closeInterstitial = useCallback(() => {
    console.log('[AdSense] Closing interstitial ad');
    setShowInterstitial(false);

    // 少し遅延させて次の広告を表示可能にする
    setTimeout(() => {
      setIsInterstitialActive(false);
    }, 1000);
  }, []);

  return (
    <AdSenseContext.Provider
      value={{
        showInterstitial,
        isInterstitialActive,
        triggerInterstitial,
        closeInterstitial,
      }}
    >
      {children}
    </AdSenseContext.Provider>
  );
};

/**
 * AdSenseContextを使用するカスタムフック
 */
export const useAdSenseContext = () => {
  const context = useContext(AdSenseContext);
  if (context === undefined) {
    throw new Error('useAdSenseContext must be used within an AdSenseProvider');
  }
  return context;
};
