import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload as UploadIcon, Play, Folder as FolderIcon, Trash2 } from 'lucide-react';
import { PhotoUploader } from '../components/PhotoUploader';
import { PhotoGrid } from '../components/PhotoGrid';
import { useLanguage } from '../contexts/LanguageContext';
import type { Photo, Folder } from '../services/db';
import { getPhotoByOrder, exportPhotosToJSON, importPhotosFromJSON } from '../services/photoService';
import { getAllFolders, createFolder, deleteFolder, getPhotoCountInFolder } from '../services/folderService';

interface PhotoManagerProps {
  onPhotoSelect?: (photo: Photo, folderId?: string | null) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ onPhotoSelect }) => {
  const { t } = useLanguage();
  const [showUploader, setShowUploader] = useState(false);
  const [gridKey, setGridKey] = useState(0); // グリッドの再レンダリング用
  const [selectedOrder, setSelectedOrder] = useState<'oldest' | 'newest' | 'random'>('random');
  const [backupStatus, setBackupStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // フォルダ関連のstate
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null); // null = 「全て」
  const [practiceFolderId, setPracticeFolderId] = useState<string | null>(null); // 練習用フォルダ選択
  const [folderPhotoCounts, setFolderPhotoCounts] = useState<Map<string | null, number>>(new Map());

  // フォルダリストを読み込み
  useEffect(() => {
    loadFolders();
  }, [gridKey]); // gridKeyが変わったら再読み込み（写真追加/削除時）

  const loadFolders = async () => {
    const folderList = await getAllFolders();
    setFolders(folderList);

    // 各フォルダの写真数を取得
    const counts = new Map<string | null, number>();
    counts.set(null, await getPhotoCountInFolder(null)); // 全て
    for (const folder of folderList) {
      counts.set(folder.id, await getPhotoCountInFolder(folder.id));
    }
    setFolderPhotoCounts(counts);
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    setGridKey(prev => prev + 1); // グリッドを再レンダリング
  };

  const handlePhotosChange = () => {
    setGridKey(prev => prev + 1);
  };

  const handleStartPractice = async () => {
    const photo = await getPhotoByOrder(selectedOrder, practiceFolderId);
    if (photo && onPhotoSelect) {
      onPhotoSelect(photo, practiceFolderId);
    }
  };

  // フォルダ作成
  const handleCreateFolder = async () => {
    const folderName = prompt(t('photoManager.folders.createPrompt'));
    if (!folderName || folderName.trim() === '') {
      if (folderName !== null) {
        alert(t('photoManager.folders.createError'));
      }
      return;
    }

    await createFolder(folderName.trim());
    await loadFolders();
    setGridKey(prev => prev + 1); // PhotoGridを再マウントしてfoldersを更新
  };

  // フォルダ削除
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm(t('photoManager.folders.deleteConfirm'))) {
      return;
    }

    await deleteFolder(folderId);

    // 削除したフォルダが選択中だった場合は「全て」に戻す
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    if (practiceFolderId === folderId) {
      setPracticeFolderId(null);
    }

    await loadFolders();
    setGridKey(prev => prev + 1); // グリッドを更新
  };

  // バックアップ機能
  const handleBackup = async () => {
    try {
      setBackupStatus(t('photoManager.backupStatus.exporting'));
      const jsonString = await exportPhotosToJSON();

      // JSONファイルをダウンロード
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `face-drawing-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setBackupStatus(t('photoManager.backupStatus.exportComplete'));
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (error) {
      console.error('[handleBackup] Error:', error);
      setBackupStatus(t('photoManager.backupStatus.exportError'));
      setTimeout(() => setBackupStatus(''), 5000);
    }
  };

  // 復元機能
  const handleRestore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBackupStatus(t('photoManager.backupStatus.importing'));
      const text = await file.text();
      const result = await importPhotosFromJSON(text);

      setBackupStatus(
        t('photoManager.backupStatus.importComplete', {
          imported: String(result.imported),
          skipped: String(result.skipped),
          errors: String(result.errors)
        })
      );

      // グリッドを再読み込み
      setGridKey(prev => prev + 1);

      setTimeout(() => setBackupStatus(''), 5000);
    } catch (error) {
      console.error('[handleFileSelect] Error:', error);
      setBackupStatus(t('photoManager.backupStatus.importError'));
      setTimeout(() => setBackupStatus(''), 5000);
    }

    // ファイル入力をリセット
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ①練習開始セクション */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Play size={28} className="text-green-600" />
              {t('photoManager.practiceStart.title')}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {t('photoManager.practiceStart.description')}
            </p>

            {/* フォルダ選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('photoManager.practiceStart.folder')}
              </label>
              <select
                value={practiceFolderId || ''}
                onChange={(e) => setPracticeFolderId(e.target.value || null)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('photoManager.practiceStart.allPhotos')} ({folderPhotoCounts.get(null) || 0})</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folderPhotoCounts.get(folder.id) || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* 順序選択と開始ボタン */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedOrder('oldest')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedOrder === 'oldest'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {t('photoManager.practiceStart.oldest')}
                </button>
                <button
                  onClick={() => setSelectedOrder('newest')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedOrder === 'newest'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {t('photoManager.practiceStart.newest')}
                </button>
                <button
                  onClick={() => setSelectedOrder('random')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    selectedOrder === 'random'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {t('photoManager.practiceStart.random')}
                </button>
              </div>
              <button
                onClick={handleStartPractice}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
              >
                <Play size={24} />
                {t('photoManager.practiceStart.startButton')}
              </button>
            </div>
          </div>
        </div>

        {/* ②フォルダセクション */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FolderIcon size={28} className="text-indigo-600" />
              {t('photoManager.folders.title')}
            </h2>
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              <Plus size={20} />
              {t('photoManager.folders.createFolder')}
            </button>
          </div>

          {/* フォルダリスト（横スクロール） */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* 「全て」フォルダ */}
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                selectedFolderId === null
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
              }`}
            >
              <FolderIcon size={20} />
              {t('photoManager.folders.allPhotos')} ({folderPhotoCounts.get(null) || 0})
            </button>

            {/* ユーザー作成フォルダ */}
            {folders.map(folder => (
              <div key={folder.id} className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  <FolderIcon size={20} />
                  {folder.name} ({folderPhotoCounts.get(folder.id) || 0})
                </button>

                {/* 選択中のフォルダには削除ボタンを表示 */}
                {selectedFolderId === folder.id && (
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title={t('photoManager.folders.deleteFolder')}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ③写真管理セクション */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl font-bold text-gray-800">
                {t('photoManager.title')}
              </h1>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowUploader(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  <Plus size={20} />
                  {t('photoManager.management.addPhoto')}
                </button>

                <button
                  onClick={handleBackup}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Download size={20} />
                  {t('photoManager.management.backup')}
                </button>

                <button
                  onClick={handleRestore}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <UploadIcon size={20} />
                  {t('photoManager.management.restore')}
                </button>

                {/* 非表示のファイル入力 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* 説明 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 {t('photoManager.management.hint')}
              </p>
            </div>

            {/* バックアップ・復元のステータスメッセージ */}
            {backupStatus && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">{backupStatus}</p>
              </div>
            )}
          </div>

          {/* 区切り線 */}
          <div className="border-t border-gray-200 mb-8"></div>

          {/* 保存された写真グリッド */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t('photoManager.savedPhotos')}
              {selectedFolderId === null
                ? ` (${t('photoManager.folders.allPhotos')}: ${folderPhotoCounts.get(null) || 0})`
                : ` (${folders.find(f => f.id === selectedFolderId)?.name}: ${folderPhotoCounts.get(selectedFolderId) || 0})`
              }
            </h2>
            <PhotoGrid
              key={gridKey}
              selectedFolderId={selectedFolderId}
              onPhotoSelect={onPhotoSelect}
              onPhotosChange={handlePhotosChange}
            />
          </div>
        </div>

        {/* アップローダーモーダル */}
        {showUploader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <PhotoUploader
              initialFolderId={selectedFolderId}
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploader(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
