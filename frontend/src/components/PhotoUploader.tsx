import React, { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { addPhoto } from '../services/photoService';
import { getAllFolders } from '../services/folderService';
import type { Folder } from '../services/db';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoUploaderProps {
  onUploadComplete?: (photoId: string) => void;
  onClose?: () => void;
  initialFolderId?: string | null;  // 初期選択フォルダ（nullは「全て」）
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUploadComplete, onClose, initialFolderId = null }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId);

  // フォルダリストを読み込み
  useEffect(() => {
    const loadFolders = async () => {
      const folderList = await getAllFolders();
      setFolders(folderList);
    };
    loadFolders();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // セキュリティ強化: ファイル検証関数
  const validateImageFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // 1. ファイルサイズチェック (10MB制限)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `ファイルサイズが10MBを超えています` };
    }

    // 2. MIMEタイプホワイトリスト
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      if (file.type === 'image/heic' || file.type === 'image/heif' ||
          file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        return { valid: false, error: 'HEIC形式は対応していません' };
      }
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        return { valid: false, error: 'SVG形式はセキュリティ上サポートされていません' };
      }
      return { valid: false, error: '対応していないファイル形式です' };
    }

    // 3. マジックバイト検証（拡張子偽装対策）
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer.slice(0, 12));

      const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
      const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
      const isWebP = bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

      if ((file.type === 'image/jpeg' && !isJPEG) ||
          (file.type === 'image/png' && !isPNG) ||
          (file.type === 'image/webp' && !isWebP)) {
        return { valid: false, error: 'ファイルの内容が宣言された形式と一致しません' };
      }
    } catch (error) {
      return { valid: false, error: 'ファイルの検証に失敗しました' };
    }

    return { valid: true };
  };

  const handleFiles = async (files: File[]) => {
    console.log('[PhotoUploader] Processing files:', files.map(f => `${f.name} (${f.type})`).join(', '));

    const newWarnings: string[] = [];
    const validFiles: File[] = [];

    // 各ファイルを検証
    for (const file of files) {
      const validation = await validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newWarnings.push(`${file.name}: ${validation.error}`);
      }
    }

    console.log('[PhotoUploader] Valid image files:', validFiles.map(f => f.name).join(', '));

    if (validFiles.length === 0 && files.length > 0) {
      newWarnings.push('選択されたファイルは対応していません。JPEGまたはPNG形式の画像を選択してください。');
    }

    setWarnings(newWarnings);
    setSelectedFiles(prev => [...prev, ...validFiles]);

    // プレビュー生成
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.onerror = (e) => {
        console.error('[PhotoUploader] Failed to read file for preview:', file.name, e);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);
    setWarnings([]); // 警告をクリア

    try {
      console.log(`[PhotoUploader] Starting upload of ${selectedFiles.length} files`);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(`[PhotoUploader] Uploading file ${i + 1}/${selectedFiles.length}: ${file.name}`);

        try {
          const photoId = await addPhoto(file, selectedFolderId);
          console.log(`[PhotoUploader] Successfully uploaded: ${file.name} (ID: ${photoId}, FolderId: ${selectedFolderId})`);

          if (i === selectedFiles.length - 1 && onUploadComplete) {
            onUploadComplete(photoId);
          }

          setProgress(((i + 1) / selectedFiles.length) * 100);
        } catch (fileError) {
          console.error(`[PhotoUploader] Failed to upload file ${file.name}:`, fileError);
          // 個別のファイルエラーは続行する
          alert(`「${file.name}」のアップロードに失敗しました: ${(fileError as Error).message}`);
        }
      }

      // アップロード完了
      setSelectedFiles([]);
      setPreviews([]);
      setProgress(0);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('[PhotoUploader] Upload failed:', error);
      alert(`アップロードに失敗しました: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-procreate-card rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{t('photoUploader.title')}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-procreate-hover rounded-lg transition-colors text-white"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* フォルダ選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          {t('photoUploader.selectFolder')}
        </label>
        <select
          value={selectedFolderId || ''}
          onChange={(e) => setSelectedFolderId(e.target.value || null)}
          className="w-full px-4 py-2 bg-procreate-bg text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-procreate-accent focus:border-transparent"
        >
          <option className="bg-white text-gray-900" value="">{t('photoManager.folders.allPhotos')}</option>
          {folders.map(folder => (
            <option className="bg-white text-gray-900" key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      {/* ドラッグ&ドロップエリア */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-procreate-bg hover:border-procreate-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-white mb-2">
          クリックして写真を選択、またはドラッグ&ドロップ
        </p>
        <p className="text-sm text-gray-300">
          JPG, PNG, WEBP対応 / 複数選択可能
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 警告メッセージ */}
      {warnings.length > 0 && (
        <div className="mt-4 bg-procreate-tag border border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-400 font-semibold mb-2">⚠️ 警告</p>
          <ul className="list-disc list-inside text-sm text-yellow-300 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <p className="text-xs text-yellow-300 mt-2">
            💡 iPhoneで撮影した写真はHEIC形式の場合があります。設定アプリから「カメラ」→「フォーマット」→「互換性優先」に変更すると、JPEG形式で保存されます。
          </p>
        </div>
      )}

      {/* プレビュー */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            選択された写真 ({selectedFiles.length})
          </h3>
          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                  {selectedFiles[index].name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アップロードボタン */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-procreate-bg rounded-full h-2">
                <div
                  className="bg-procreate-accent h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-300 mt-2 text-center">
                アップロード中... {Math.round(progress)}%
              </p>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-procreate-accent text-white rounded-xl hover:bg-blue-600 hover:scale-[0.98] active:scale-[0.98] disabled:bg-gray-500 disabled:cursor-not-allowed transition-all font-semibold"
          >
            <Upload size={20} />
            {uploading ? 'アップロード中...' : `${selectedFiles.length}枚の写真をアップロード`}
          </button>
        </div>
      )}
    </div>
  );
};
