import React, { useState, useRef, useEffect } from 'react';
import { Download, Undo2, Redo2, Eraser, Pencil, Minus, Circle, RefreshCw, Eye, EyeOff, ArrowLeft, Image as ImageIcon, Grid } from 'lucide-react';
import type { Photo } from '../services/db';
import { getRandomPhotoExcept, getPhotoByOrder } from '../services/photoService';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedLogo } from './AnimatedLogo';
import { AdBanner } from './ads';
import { useAdSenseContext } from '../contexts/AdSenseContext';

interface FaceGestureDrawingToolProps {
  selectedPhoto?: Photo | null;
  practiceFolderId?: string | null;  // 練習用フォルダID（nullは全て）
  onBackToPhotos?: () => void;
}

const FaceGestureDrawingTool: React.FC<FaceGestureDrawingToolProps> = ({ selectedPhoto, practiceFolderId = null, onBackToPhotos }) => {
  const { t } = useLanguage();
  // TODO: Re-enable when needed - triggerInterstitialは広告再有効化時に使用
  const { /* triggerInterstitial */ } = useAdSenseContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(selectedPhoto || null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [photoChangeCount, setPhotoChangeCount] = useState(0); // 写真切り替え回数カウンター
  const [isEraser, setIsEraser] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'line' | 'ellipse'>('pen');
  const [showOverlay, setShowOverlay] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(3);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [imageDimensions, setImageDimensions] = useState({ width: 400, height: 500 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // イベントリスナー関数のRef（クリーンアップ用）
  const drawFuncRef = useRef<any>(null);
  const stopDrawingFuncRef = useRef<any>(null);

  // 写真URLの生成と画像サイズの取得（iOS Safari対応: Data URL形式で保存済み）
  useEffect(() => {
    if (currentPhoto && currentPhoto.dataUrl) {
      // Data URLはすでに保存されているので、そのまま使用
      setPhotoUrl(currentPhoto.dataUrl);

      // 画像を読み込んでサイズを取得
      const img = new Image();
      img.onload = () => {
        console.log('Original image size:', img.width, 'x', img.height);

        const maxWidth = 600; // 最大幅を600pxに設定
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        // 画像が大きすぎる場合は最大幅に合わせてリサイズ
        if (img.width > maxWidth) {
          const aspectRatio = img.width / img.height;
          canvasWidth = maxWidth;
          canvasHeight = maxWidth / aspectRatio;
          console.log('Aspect ratio:', aspectRatio);
          console.log('Resized - Width:', canvasWidth, 'Height:', canvasHeight);
        }

        const finalWidth = Math.round(canvasWidth);
        const finalHeight = Math.round(canvasHeight);
        console.log('Final canvas size:', finalWidth, 'x', finalHeight);

        setImageDimensions({
          width: finalWidth,
          height: finalHeight
        });
      };
      img.src = currentPhoto.dataUrl;
    }
  }, [currentPhoto]);

  // 初回読み込み時に写真がない場合はランダムに取得（フォルダフィルタリング対応）
  useEffect(() => {
    if (!selectedPhoto) {
      getPhotoByOrder('random', practiceFolderId).then(photo => {
        if (photo) {
          setCurrentPhoto(photo);
        }
      });
    }
  }, [selectedPhoto, practiceFolderId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
        saveToHistory(ctx);
      }
    }

    // クリーンアップ: コンポーネントアンマウント時にイベントリスナーを削除
    return () => {
      console.log('[FaceGestureDrawingTool] Cleaning up event listeners on unmount');

      // 描画中の場合、イベントリスナーを強制削除（メモリリーク防止）
      if (isDrawingRef.current) {
        console.warn('[FaceGestureDrawingTool] Drawing was in progress during unmount, forcing event listener cleanup');

        // Refから関数を取得してイベントリスナーを削除
        const drawFunc = drawFuncRef.current;
        const stopDrawingFunc = stopDrawingFuncRef.current;

        if (drawFunc && stopDrawingFunc) {
          document.removeEventListener('mousemove', drawFunc);
          document.removeEventListener('mouseup', stopDrawingFunc);
          document.removeEventListener('touchmove', drawFunc);
          document.removeEventListener('touchend', stopDrawingFunc);
        }

        isDrawingRef.current = false;
      }
    };
  }, []);

  // 写真一覧に戻るときにカウンターをリセット（アンマウント時）
  useEffect(() => {
    return () => {
      console.log('[FaceGestureDrawingTool] Component unmounting, resetting photo change count');
      setPhotoChangeCount(0);
    };
  }, []);

  // 写真が変更されたときにキャンバスと履歴をリセット
  useEffect(() => {
    if (context && canvasRef.current) {
      // キャンバスをクリア
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // historyをリセット（空のキャンバス状態を初期historyとして保存）
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([imageData]);
      setHistoryStep(0);
    }
  }, [imageDimensions, context]);

  const saveToHistory = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // 座標取得の統一関数（マウス・タッチ両対応）
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // タッチイベントの場合
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }

    // マウスイベントの場合
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    if (!context) return;

    // タッチイベントの場合はスクロールを防止
    if (e.type.includes('touch')) {
      e.preventDefault();
    }

    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);

    if (drawingMode === 'pen') {
      // ペンモード: 自由曲線描画
      context.beginPath();
      context.moveTo(x, y);
    } else {
      // 直線・楕円モード: 始点を記録
      startPointRef.current = { x, y };
    }

    // documentにイベントリスナーを追加（キャンバス外でも描画可能に）
    if (e.type.includes('touch')) {
      document.addEventListener('touchmove', draw, { passive: false });
      document.addEventListener('touchend', stopDrawing);
    } else {
      document.addEventListener('mousemove', draw);
      document.addEventListener('mouseup', stopDrawing);
    }
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current || !context) return;

    // タッチイベントの場合はスクロールを防止
    if (e.type.includes('touch')) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);

    if (drawingMode === 'pen') {
      // ペンモード: 自由曲線描画
      if (isEraser) {
        // 消しゴムモード: ピクセルを削除（透明化）して背景の参考写真が見えるようにする
        context.globalCompositeOperation = 'destination-out';
        context.strokeStyle = 'rgba(0,0,0,1)'; // 色は無関係（削除されるため）
        context.lineWidth = brushSize * 3;
      } else {
        // ペンモード: 通常の描画
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = brushColor;
        context.lineWidth = brushSize;
      }

      context.lineTo(x, y);
      context.stroke();
    } else if (startPointRef.current) {
      // 直線・楕円モード: プレビュー描画
      // 前回のhistoryを復元
      if (history[historyStep]) {
        context.putImageData(history[historyStep], 0, 0);
      }

      // 描画スタイルを設定
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;

      if (drawingMode === 'line') {
        // 直線のプレビュー
        context.beginPath();
        context.moveTo(startPointRef.current.x, startPointRef.current.y);
        context.lineTo(x, y);
        context.stroke();
      } else if (drawingMode === 'ellipse') {
        // 楕円のプレビュー
        const radiusX = Math.abs(x - startPointRef.current.x) / 2;
        const radiusY = Math.abs(y - startPointRef.current.y) / 2;
        const centerX = (startPointRef.current.x + x) / 2;
        const centerY = (startPointRef.current.y + y) / 2;

        context.beginPath();
        context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawingRef.current && context) {
      isDrawingRef.current = false;

      if (drawingMode === 'pen') {
        // ペンモード: 通常の終了処理
        context.closePath();
      } else if (startPointRef.current) {
        // 直線・楕円モード: 図形を確定（既にプレビューで描画済み）
        startPointRef.current = null;
      }

      saveToHistory(context);

      // documentからイベントリスナーを削除
      document.removeEventListener('mousemove', draw);
      document.removeEventListener('mouseup', stopDrawing);
      document.removeEventListener('touchmove', draw);
      document.removeEventListener('touchend', stopDrawing);
    }
  };

  // イベントリスナー関数をRefに保存（クリーンアップで使用）
  drawFuncRef.current = draw;
  stopDrawingFuncRef.current = stopDrawing;

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory(context);
    }
  };

  const undo = () => {
    if (context && historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      context.putImageData(history[newStep], 0, 0);
    }
  };

  const redo = () => {
    if (context && historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      context.putImageData(history[newStep], 0, 0);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 新しいキャンバスを作成して合成
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // 1. 白い背景を描画
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 2. 参考写真を含めるかチェック
    const shouldIncludePhoto = (currentStep === 1) || (currentStep === 2 && showOverlay);

    if (shouldIncludePhoto && photoUrl) {
      // 画像読み込みが必要なので非同期処理
      const img = new Image();
      img.onload = () => {
        // 参考写真を透明度付きで描画
        ctx.globalAlpha = overlayOpacity;
        ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
        ctx.globalAlpha = 1.0;

        // 3. 描画内容を重ねる
        ctx.drawImage(canvas, 0, 0);

        // 4. ダウンロード
        const dataURL = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `photo_${currentPhoto?.id || 'unknown'}_step${currentStep}.png`;
        link.href = dataURL;
        link.click();
      };
      img.src = photoUrl;
    } else {
      // Step 2で答え合わせOFFの場合: 描画のみ
      ctx.drawImage(canvas, 0, 0);

      // ダウンロード
      const dataURL = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `photo_${currentPhoto?.id || 'unknown'}_step${currentStep}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const changePhoto = async () => {
    console.log('[changePhoto] Button clicked, practiceFolderId:', practiceFolderId);

    let photoChanged = false;

    if (!currentPhoto || !currentPhoto.id) {
      console.warn('[changePhoto] No current photo, using getPhotoByOrder with folder:', practiceFolderId);
      const photo = await getPhotoByOrder('random', practiceFolderId);
      if (photo) {
        console.log(`[changePhoto] Selected new photo: ${photo.id}`);
        setCurrentPhoto(photo);
        clearCanvas();
        setShowOverlay(false);
        photoChanged = true;
      } else {
        console.error('[changePhoto] No photos available in folder:', practiceFolderId);
      }
    } else {
      // 現在の写真を除外して別の写真を取得（フォルダフィルタリング対応）
      console.log(`[changePhoto] Current photo ID: ${currentPhoto.id}, folder: ${practiceFolderId}, getting different photo...`);
      const photo = await getRandomPhotoExcept(currentPhoto.id, practiceFolderId);

      if (photo) {
        console.log(`[changePhoto] Successfully changed to photo: ${photo.id}`);
        setCurrentPhoto(photo);
        clearCanvas();
        setShowOverlay(false);
        photoChanged = true;
      } else {
        console.warn('[changePhoto] No other photos available in folder:', practiceFolderId);
        // 写真が1枚しかない場合でもエラーは表示せず、何もしない
      }
    }

    // TODO: Re-enable when needed - 写真が正常に変更された場合、カウンターをインクリメント
    // 現在は広告を一時無効化
    if (photoChanged) {
      const newCount = photoChangeCount + 1;
      setPhotoChangeCount(newCount);
      console.log(`[changePhoto] Photo change count: ${newCount}/20`);

      // // 20回に達したらインタースティシャル広告を表示してリセット
      // if (newCount >= 20) {
      //   console.log('[changePhoto] 20 photo changes reached, showing interstitial ad');
      //   triggerInterstitial();
      //   setPhotoChangeCount(0);
      // }
    }
  };

  return (
    <div className="min-h-screen bg-procreate-bg p-6">
      {/* ロゴセクション（最上部・中央寄せ・レスポンシブ） */}
      <div className="flex justify-center mb-6">
        <AnimatedLogo compact />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-procreate-card rounded-lg p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {onBackToPhotos && (
                <button
                  onClick={onBackToPhotos}
                  className="flex items-center gap-2 px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover transition-colors"
                >
                  <ArrowLeft size={20} />
                  {t('drawingTool.backToPhotos')}
                </button>
              )}
            </div>
            <p className="text-white text-lg">
              Step {currentStep}: {t(`drawingTool.steps.${currentStep}`)}
            </p>
          </div>

          {/* ステップ選択 */}
          <div className="mb-4 flex gap-2">
            {[1, 2].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  currentStep === step
                    ? 'bg-procreate-accent text-white shadow-lg'
                    : 'bg-procreate-tag text-white hover:bg-procreate-hover'
                }`}
              >
                Step {step}
              </button>
            ))}
          </div>

          {/* 写真切替ボタン */}
          <div className="mb-6">
            <button
              onClick={changePhoto}
              className="flex items-center gap-2 px-6 py-3 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all"
            >
              <RefreshCw size={20} />
              {t('drawingTool.changePhoto')}
            </button>
          </div>

          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 items-start">
            {/* 左側: 参考写真 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{t('drawingTool.referencePhoto')}</h2>
              <div className="relative border border-gray-600 overflow-hidden bg-procreate-bg rounded-lg">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Reference face"
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100">
                    <div className="text-center">
                      <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">写真を読み込み中...</p>
                    </div>
                  </div>
                )}

                {/* グリッド表示（参考写真） */}
                {showGrid && photoUrl && (
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                    viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                    preserveAspectRatio="none"
                  >
                    {/* 縦線 */}
                    {Array.from({ length: gridSize - 1 }).map((_, i) => {
                      const x = ((i + 1) * imageDimensions.width) / gridSize;
                      return (
                        <line
                          key={`ref-v-${i}`}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={imageDimensions.height}
                          stroke={`rgba(0,0,0,${gridOpacity})`}
                          strokeWidth="2"
                        />
                      );
                    })}
                    {/* 横線 */}
                    {Array.from({ length: gridSize - 1 }).map((_, i) => {
                      const y = ((i + 1) * imageDimensions.height) / gridSize;
                      return (
                        <line
                          key={`ref-h-${i}`}
                          x1={0}
                          y1={y}
                          x2={imageDimensions.width}
                          y2={y}
                          stroke={`rgba(0,0,0,${gridOpacity})`}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* 右側: 描画スペース */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{t('drawingTool.drawingSpace')}</h2>
              <div className="relative border border-gray-600 overflow-hidden bg-white rounded-lg">
                {/* Step1: 背景に参考写真を表示 */}
                {currentStep === 1 && photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Background reference"
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                  />
                )}

                {/* 描画キャンバス */}
                <canvas
                  ref={canvasRef}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  className="w-full h-auto cursor-crosshair relative"
                  style={{ backgroundColor: currentStep === 1 ? 'transparent' : 'white', touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onTouchStart={startDrawing}
                />

                {/* Step2: 答え合わせ用オーバーレイ */}
                {showOverlay && currentStep === 2 && photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Overlay"
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                  />
                )}

                {/* グリッド表示 */}
                {showGrid && (
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 20 }}
                    viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                    preserveAspectRatio="none"
                  >
                    {/* 縦線 */}
                    {Array.from({ length: gridSize - 1 }).map((_, i) => {
                      const x = ((i + 1) * imageDimensions.width) / gridSize;
                      return (
                        <line
                          key={`v-${i}`}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={imageDimensions.height}
                          stroke={`rgba(0,0,0,${gridOpacity})`}
                          strokeWidth="2"
                        />
                      );
                    })}
                    {/* 横線 */}
                    {Array.from({ length: gridSize - 1 }).map((_, i) => {
                      const y = ((i + 1) * imageDimensions.height) / gridSize;
                      return (
                        <line
                          key={`h-${i}`}
                          x1={0}
                          y1={y}
                          x2={imageDimensions.width}
                          y2={y}
                          stroke={`rgba(0,0,0,${gridOpacity})`}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* 透明度・答え合わせコントロール（描画スペース直下） */}
              <div className="bg-procreate-tag rounded-lg p-4">
                {/* Step1: 参考写真の透明度調整 */}
                {currentStep === 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-white">{t('drawingTool.controls.opacity')}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-300">{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <p className="text-xs text-gray-400">💡 {t('drawingTool.controls.opacityHint')}</p>
                  </div>
                )}

                {/* Step2: 答え合わせ機能 */}
                {currentStep === 2 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowOverlay(!showOverlay)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                          showOverlay
                            ? 'bg-procreate-accent text-white'
                            : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                        }`}
                      >
                        {showOverlay ? <Eye size={18} /> : <EyeOff size={18} />}
                        {t('drawingTool.controls.answerCheck')}
                      </button>
                      {showOverlay && (
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-semibold text-white">{t('drawingTool.controls.transparency')}</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={overlayOpacity}
                            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-300">{Math.round(overlayOpacity * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ツールバー */}
          <div className="bg-procreate-tag rounded-lg p-6 space-y-4">
            {/* 描画ツール */}
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-procreate-bg text-white rounded-xl hover:bg-procreate-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[0.98] active:scale-[0.98]"
              >
                <Undo2 size={18} />
                {t('drawingTool.toolbar.undo')}
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-procreate-bg text-white rounded-xl hover:bg-procreate-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[0.98] active:scale-[0.98]"
              >
                <Redo2 size={18} />
                {t('drawingTool.toolbar.redo')}
              </button>
              <button
                onClick={() => {
                  setDrawingMode('pen');
                  setIsEraser(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  drawingMode === 'pen' && !isEraser
                    ? 'bg-procreate-accent text-white shadow-md'
                    : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                }`}
              >
                <Pencil size={18} />
                {t('drawingTool.toolbar.pen')}
              </button>
              <button
                onClick={() => {
                  setDrawingMode('line');
                  setIsEraser(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  drawingMode === 'line' && !isEraser
                    ? 'bg-procreate-accent text-white shadow-md'
                    : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                }`}
              >
                <Minus size={18} />
                {t('drawingTool.toolbar.line')}
              </button>
              <button
                onClick={() => {
                  setDrawingMode('ellipse');
                  setIsEraser(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  drawingMode === 'ellipse' && !isEraser
                    ? 'bg-procreate-accent text-white shadow-md'
                    : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                }`}
              >
                <Circle size={18} />
                {t('drawingTool.toolbar.ellipse')}
              </button>
              <button
                onClick={() => {
                  setDrawingMode('pen');
                  setIsEraser(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  isEraser
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                }`}
              >
                <Eraser size={18} />
                {t('drawingTool.toolbar.eraser')}
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-[0.98] active:scale-[0.98] ${
                  showGrid
                    ? 'bg-procreate-accent text-white shadow-md'
                    : 'bg-procreate-bg text-white hover:bg-procreate-hover'
                }`}
              >
                <Grid size={18} />
                {t('drawingTool.toolbar.grid')}
              </button>
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-[0.98] active:scale-[0.98] transition-all"
              >
                {t('drawingTool.toolbar.clearAll')}
              </button>
            </div>

            {/* グリッド調整（グリッド表示中のみ） */}
            {showGrid && (
              <div className="flex flex-wrap items-center gap-6 bg-procreate-bg rounded-lg p-3">
                {/* グリッドサイズ */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-white">{t('drawingTool.toolbar.gridSize')}</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-300 font-medium w-10">{gridSize}x{gridSize}</span>
                </div>

                {/* グリッドの濃さ */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-white">{t('drawingTool.toolbar.gridOpacity')}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-300 font-medium w-10">{Math.round(gridOpacity * 100)}%</span>
                </div>
              </div>
            )}

            {/* ブラシ設定 */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-white">{t('drawingTool.toolbar.color')}</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-white">{t('drawingTool.toolbar.size')}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-300 w-8">{brushSize}</span>
              </div>
            </div>

            {/* 保存・読み込み */}
            <div className="border-t border-gray-600 pt-4 flex gap-3">
              <button
                onClick={downloadDrawing}
                className="flex items-center gap-2 px-6 py-3 bg-procreate-accent text-white rounded-xl hover:bg-blue-600 hover:scale-[0.98] active:scale-[0.98] transition-all font-semibold"
              >
                <Download size={18} />
                {t('drawingTool.toolbar.download')}
              </button>
            </div>
          </div>
        </div>

        {/* バナー広告（練習画面最下部） */}
        <AdBanner slot="1234567890" format="auto" responsive={true} />

        {/* フッター（コピーライト表記） */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-sm text-gray-400">
            © 2025 あんにゅい. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FaceGestureDrawingTool;