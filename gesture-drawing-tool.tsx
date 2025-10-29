import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Undo2, Redo2, Eraser, RefreshCw, Eye, EyeOff } from 'lucide-react';

const FaceGestureDrawingTool = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoId, setPhotoId] = useState('001');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isEraser, setIsEraser] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // サンプル顔写真（実際のプロジェクトではAPIから取得）
  const samplePhotos = {
    '001': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjZTBkN2Q3IiBzdHJva2U9IiNhYTljOWMiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjE4MCIgcj0iMTUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIyMzAiIGN5PSIxODAiIHI9IjE1IiBmaWxsPSIjMzMzIi8+PGVsbGlwc2UgY3g9IjIwMCIgY3k9IjIyMCIgcng9IjMwIiByeT0iMjAiIGZpbGw9IiNmZmM4YzgiLz48dGV4dCB4PSIyMDAiIHk9IjQ1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij7jgrXjg7Pjg5fjg6vmoanWrL+nlJnnnJ88L3RleHQ+PC9zdmc+',
    '002': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgcng9IjIwIiBmaWxsPSIjZDVjOGM4IiBzdHJva2U9IiM5OTg4ODgiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE5MCIgcj0iMTgiIGZpbGw9IiMyMjIiLz48Y2lyY2xlIGN4PSIyNDAiIGN5PSIxOTAiIHI9IjE4IiBmaWxsPSIjMjIyIi8+PHBhdGggZD0iTTE3MCAyNjAgUSAyMDAgMjgwIDIzMCAyNjAiIHN0cm9rZT0iI2NjNTU1NSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHRleHQgeD0iMjAwIiB5PSI0NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+44K144Oz44OX44Or6aGU55S344GdMjwvdGV4dD48L3N2Zz4='
  };

  const stepDescriptions = {
    1: '顔のベース形（○・□）を描く - 顔写真の上に描画',
    2: 'ベース + 目・鼻・口・耳を大まかに描く',
    3: 'ベース + パーツを写真の隣に自力で描く',
    4: 'ベース + パーツ + 髪型・眉毛などの詳細'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);
      saveToHistory(ctx);
    }
  }, []);

  const saveToHistory = (ctx) => {
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.strokeStyle = isEraser ? '#ffffff' : brushColor;
    context.lineWidth = isEraser ? brushSize * 3 : brushSize;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && context) {
      setIsDrawing(false);
      context.closePath();
      saveToHistory(context);
    }
  };

  const clearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory(context);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      context.putImageData(history[newStep], 0, 0);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      context.putImageData(history[newStep], 0, 0);
    }
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `photo_${photoId}_step${currentStep}.png`;
    link.href = dataURL;
    link.click();
  };

  const changePhoto = () => {
    const newId = photoId === '001' ? '002' : '001';
    setPhotoId(newId);
    clearCanvas();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              顔ジェスチャードローイング学習ツール
            </h1>
            <p className="text-gray-600">
              Step {currentStep}: {stepDescriptions[currentStep]}
            </p>
          </div>

          {/* ステップ選択 */}
          <div className="mb-6 flex gap-2">
            {[1, 2, 3, 4].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentStep === step
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Step {step}
              </button>
            ))}
          </div>

          {/* メインコンテンツ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* 左側: 参考写真 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">参考写真</h2>
                <button
                  onClick={changePhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw size={18} />
                  写真切替
                </button>
              </div>
              <div className="border-4 border-gray-300 rounded-lg overflow-hidden bg-white">
                <img
                  src={samplePhotos[photoId]}
                  alt="Reference face"
                  className="w-full h-auto"
                />
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">💡 描画のヒント:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Step 1-2: 写真を見ながら大まかな形を捉える</li>
                  <li>Step 3-4: 前ステップの描画を参考に自力で描く</li>
                  <li>半透明表示で答え合わせができます</li>
                </ul>
              </div>
            </div>

            {/* 右側: 描画スペース */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">描画スペース</h2>
              <div className="relative border-4 border-indigo-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={500}
                  className="w-full h-auto cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                {showOverlay && currentStep > 1 && (
                  <img
                    src={samplePhotos[photoId]}
                    alt="Overlay"
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ opacity: overlayOpacity }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ツールバー */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            {/* 描画ツール */}
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Undo2 size={18} />
                元に戻す
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Redo2 size={18} />
                やり直す
              </button>
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isEraser
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <Eraser size={18} />
                消しゴム
              </button>
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                全消去
              </button>
            </div>

            {/* ブラシ設定 */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">色:</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">サイズ:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600 w-8">{brushSize}</span>
              </div>
            </div>

            {/* 答え合わせ機能 */}
            {currentStep > 1 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showOverlay
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {showOverlay ? <Eye size={18} /> : <EyeOff size={18} />}
                    答え合わせ表示
                  </button>
                  {showOverlay && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-700">透明度:</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 保存・読み込み */}
            <div className="border-t pt-4 flex gap-3">
              <button
                onClick={downloadDrawing}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                <Download size={18} />
                画像をダウンロード
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceGestureDrawingTool;