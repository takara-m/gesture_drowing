import { useState, useEffect } from 'react';

interface DrawingSettings {
  brushSize: number;
  brushColor: string;
  showGrid: boolean;
  gridSize: number;
  gridOpacity: number;
  currentStep: 1 | 2;
}

const STORAGE_KEY = 'gesdro_drawing_settings';

const DEFAULT_SETTINGS: DrawingSettings = {
  brushSize: 3,
  brushColor: '#000000',
  showGrid: false,
  gridSize: 3,
  gridOpacity: 0.3,
  currentStep: 1,
};

export const useDrawingSettings = () => {
  const [settings, setSettingsState] = useState<DrawingSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage から設定を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // デフォルト値とマージ（新しい設定が追加された場合の互換性対応）
        setSettingsState({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      }
    } catch (error) {
      console.warn('Failed to load drawing settings from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // 設定が変更されるたびに localStorage に保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.warn('Failed to save drawing settings to localStorage:', error);
      }
    }
  }, [settings, isLoaded]);

  const setSettings = (updater: Partial<DrawingSettings>) => {
    setSettingsState(prev => ({
      ...prev,
      ...updater,
    }));
  };

  const setBrushSize = (size: number) => setSettings({ brushSize: size });
  const setBrushColor = (color: string) => setSettings({ brushColor: color });
  const setShowGrid = (show: boolean) => setSettings({ showGrid: show });
  const setGridSize = (size: number) => setSettings({ gridSize: size });
  const setGridOpacity = (opacity: number) => setSettings({ gridOpacity: opacity });
  const setCurrentStep = (step: 1 | 2) => setSettings({ currentStep: step });

  return {
    // 設定値
    brushSize: settings.brushSize,
    brushColor: settings.brushColor,
    showGrid: settings.showGrid,
    gridSize: settings.gridSize,
    gridOpacity: settings.gridOpacity,
    currentStep: settings.currentStep,
    isLoaded,
    // セッター関数
    setBrushSize,
    setBrushColor,
    setShowGrid,
    setGridSize,
    setGridOpacity,
    setCurrentStep,
    // 一括設定（高度な用途用）
    setSettings,
  };
};
