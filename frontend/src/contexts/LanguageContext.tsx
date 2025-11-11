import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SupportedLanguage } from '../i18n';
import { getInitialLanguage, saveLanguage, createTranslator } from '../i18n';

// Context の型定義
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Context の作成
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider の Props
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider コンポーネント
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 初期言語を設定（保存済み > ブラウザ言語 > デフォルト）
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const initial = getInitialLanguage();
    console.log('[LanguageContext] Initial language:', initial);
    return initial;
  });

  // 翻訳関数を作成
  const t = createTranslator(language);

  // 言語変更ハンドラー
  const setLanguage = (newLanguage: SupportedLanguage) => {
    console.log('[LanguageContext] Changing language to:', newLanguage);
    setLanguageState(newLanguage);
    saveLanguage(newLanguage);
  };

  // 言語が変更されたことをログ出力
  useEffect(() => {
    console.log('[LanguageContext] Current language:', language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom Hook: useLanguage
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
