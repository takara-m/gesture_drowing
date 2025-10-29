import jaTranslations from './locales/ja.json';
import enTranslations from './locales/en.json';

// サポートする言語（エクスポート）
export type SupportedLanguage = 'ja' | 'en';

// 翻訳データの型
type TranslationData = typeof jaTranslations;

// 翻訳マップ
const translations: Record<SupportedLanguage, TranslationData> = {
  ja: jaTranslations,
  en: enTranslations
};

// localStorageのキー
const STORAGE_KEY = 'user-language';

// ブラウザの言語を検出
export const detectBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language.toLowerCase();

  console.log('[i18n] Browser language:', browserLang);

  // 日本語の判定
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }

  // デフォルトは英語
  return 'en';
};

// localStorageから言語を読み取り
export const getSavedLanguage = (): SupportedLanguage | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ja' || saved === 'en') {
    console.log('[i18n] Saved language:', saved);
    return saved;
  }
  return null;
};

// localStorageに言語を保存
export const saveLanguage = (language: SupportedLanguage): void => {
  localStorage.setItem(STORAGE_KEY, language);
  console.log('[i18n] Language saved:', language);
};

// 初期言語を決定（保存済み > ブラウザ言語 > デフォルト）
export const getInitialLanguage = (): SupportedLanguage => {
  const saved = getSavedLanguage();
  if (saved) {
    return saved;
  }
  return detectBrowserLanguage();
};

// ネストされたオブジェクトから値を取得
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
};

// パラメータ置換（{{key}}を置き換え）
const replaceParams = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;

  let result = text;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }

  return result;
};

// 翻訳関数を作成
export const createTranslator = (language: SupportedLanguage) => {
  return (key: string, params?: Record<string, string | number>): string => {
    const translationData = translations[language];
    const value = getNestedValue(translationData, key);

    if (value === undefined) {
      console.warn(`[i18n] Translation missing: ${key} (${language})`);
      return key;
    }

    return replaceParams(value, params);
  };
};

// エクスポート
export { translations };
