import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload as UploadIcon, Play, Folder as FolderIcon, Trash2, ExternalLink, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhotoUploader } from '../components/PhotoUploader';
import { PhotoGrid } from '../components/PhotoGrid';
import { PhotoUsageMeter } from '../components/PhotoUsageMeter';
import { useLanguage } from '../contexts/LanguageContext';
import type { Photo, Folder } from '../services/db';
import { getPhotoByOrder, exportPhotosToJSON, importPhotosFromJSON } from '../services/photoService';
import { getAllFolders, createFolder, deleteFolder, getPhotoCountInFolder } from '../services/folderService';
import { AdBanner } from '../components/ads';

interface PhotoManagerProps {
  onPhotoSelect?: (photo: Photo, folderId?: string | null) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ onPhotoSelect }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
  const [showFolderHelpModal, setShowFolderHelpModal] = useState(false); // フォルダヘルプモーダル
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false); // フォルダ削除モーダル
  const [deleteFolderWithPhotos, setDeleteFolderWithPhotos] = useState(false); // 写真も削除するかどうか

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

  // Navigate to Template Store
  const handleBrowseTemplates = () => {
    navigate('/templates');
  };

  // フォルダ作成（セキュリティ強化: バリデーション追加）
  const handleCreateFolder = async () => {
    const folderName = prompt(t('photoManager.folders.createPrompt'));
    if (!folderName || folderName.trim() === '') {
      if (folderName !== null) {
        alert(t('photoManager.folders.createError'));
      }
      return;
    }

    const sanitizedName = folderName.trim();

    // 1. 長さ制限（50文字）
    if (sanitizedName.length > 50) {
      alert('フォルダ名は50文字以内にしてください');
      return;
    }

    // 2. 特殊文字チェック（英数字、日本語、スペース、ハイフン、アンダースコアのみ許可）
    const FOLDER_NAME_REGEX = /^[a-zA-Z0-9\s\-_\u3000-\u9FFF\u3040-\u309F\u30A0-\u30FF]+$/;
    if (!FOLDER_NAME_REGEX.test(sanitizedName)) {
      alert('フォルダ名に使用できない文字が含まれています');
      return;
    }

    // 3. パストラバーサル対策
    if (sanitizedName.includes('..') || sanitizedName.includes('/') || sanitizedName.includes('\\')) {
      alert('無効なフォルダ名です');
      return;
    }

    await createFolder(sanitizedName);
    await loadFolders();
    setGridKey(prev => prev + 1); // PhotoGridを再マウントしてfoldersを更新
  };

  // フォルダ削除
  const handleDeleteFolder = async (folderId: string) => {
    // フォルダを選択してモーダルを表示
    setSelectedFolderId(folderId);
    setShowDeleteFolderModal(true);
  };

  // フォルダ削除確定
  const confirmDeleteFolder = async () => {
    if (!selectedFolderId) return;

    try {
      // チェックボックスの状態に応じて削除
      await deleteFolder(selectedFolderId, deleteFolderWithPhotos);

      // 削除したフォルダが練習用フォルダだった場合は「全て」に戻す
      if (practiceFolderId === selectedFolderId) {
        setPracticeFolderId(null);
      }

      // モーダルを閉じてリセット
      setShowDeleteFolderModal(false);
      setDeleteFolderWithPhotos(false);
      setSelectedFolderId(null);

      await loadFolders();
      setGridKey(prev => prev + 1); // グリッドを更新
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  // フォルダ削除キャンセル
  const cancelDeleteFolder = () => {
    setShowDeleteFolderModal(false);
    setDeleteFolderWithPhotos(false);
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
    <div className="min-h-screen p-6">
      {/* バナー広告（最上部） */}
      <AdBanner slot="1234567890" format="auto" responsive={true} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ①練習開始セクション（HEROセクション） */}
        <div className="hero-section rounded-lg shadow-md relative min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* GIF背景（右側） */}
          <div className="hero-background">
            <img
              src="/assets/Animation6.gif"
              alt="背景"
              className="hero-gif"
            />
          </div>

          {/* 左側画像 */}
          <div className="hero-left-image">
            <img
              src="/assets/hero-coffee.gif"
              alt="装飾"
              className="hero-coffee"
            />
          </div>

          {/* コンテンツエリア */}
          <div className="hero-content relative z-10 w-full px-8 py-12 flex flex-col items-start text-left space-y-6">
            {/* タイトル: Gesdro! ジェスチャードローイングアプリ */}
            <div className="flex flex-col items-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-2">
                Gesdro!
              </h1>
              <p className="text-lg md:text-xl font-medium text-white drop-shadow-md">
                ジェスチャードローイングアプリ
              </p>
            </div>

            {/* キャッチコピー */}
            <div className="text-white text-base md:text-lg leading-relaxed drop-shadow-md">
              <p>{t('photoManager.practiceStart.catchphrase1')}</p>
              <p>{t('photoManager.practiceStart.catchphrase2')}</p>
              <p className="text-procreate-accent font-semibold text-lg md:text-xl mt-2">
                {t('photoManager.practiceStart.catchphrase3')}
              </p>
            </div>

            {/* 開始ボタン */}
            <div className="flex justify-start w-full">
              <button
                onClick={handleStartPractice}
                className="start-button w-full max-w-xs flex items-center justify-center gap-2 px-8 py-3 text-white hover:scale-[0.98] active:scale-[0.98] transition-all font-bold text-lg"
              >
                <Play size={24} />
                {t('photoManager.practiceStart.startButton')}
              </button>
            </div>

            {/* 順序選択 */}
            <div className="flex flex-wrap justify-start gap-3">
              <button
                onClick={() => setSelectedOrder('oldest')}
                className={`neuro-button px-4 py-2 font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] text-white ${
                  selectedOrder === 'oldest' ? 'selected' : ''
                }`}
              >
                {t('photoManager.practiceStart.oldest')}
              </button>
              <button
                onClick={() => setSelectedOrder('newest')}
                className={`neuro-button px-4 py-2 font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] text-white ${
                  selectedOrder === 'newest' ? 'selected' : ''
                }`}
              >
                {t('photoManager.practiceStart.newest')}
              </button>
              <button
                onClick={() => setSelectedOrder('random')}
                className={`neuro-button px-4 py-2 font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] text-white ${
                  selectedOrder === 'random' ? 'selected' : ''
                }`}
              >
                {t('photoManager.practiceStart.random')}
              </button>
            </div>

            {/* フォルダ選択 */}
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-white mb-2 drop-shadow-md">
                {t('photoManager.practiceStart.folder')}
              </label>
              <select
                value={practiceFolderId || ''}
                onChange={(e) => setPracticeFolderId(e.target.value || null)}
                className="w-full px-4 py-2 bg-procreate-bg text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-procreate-accent focus:border-transparent"
              >
                <option className="bg-white text-gray-900" value="">{t('photoManager.practiceStart.allPhotos')} ({folderPhotoCounts.get(null) || 0})</option>
                {folders.map(folder => (
                  <option className="bg-white text-gray-900" key={folder.id} value={folder.id}>
                    {folder.name} ({folderPhotoCounts.get(folder.id) || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Photo usage meter */}
            <div className="w-full max-w-xs">
              <PhotoUsageMeter
                currentCount={folderPhotoCounts.get(null) || 0}
                maxCount={500}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* ②フォルダセクション */}
        <div className="glass-card rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderIcon size={28} className="text-procreate-accent" />
              {t('photoManager.folders.title')}
            </h2>
            <button
              onClick={handleCreateFolder}
              className="flex items-center gap-2 px-4 py-2 bg-procreate-accent text-white rounded-xl hover:bg-blue-600 hover:scale-[0.98] active:scale-[0.98] transition-all font-semibold"
            >
              <Plus size={20} />
              {t('photoManager.folders.createFolder')}
            </button>
          </div>

          {/* フォルダ機能の説明 */}
          <div className="bg-procreate-tag rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300">
              💡 {t('photoManager.folders.description')}
            </p>
          </div>

          {/* フォルダとは？リンク */}
          <button
            onClick={() => setShowFolderHelpModal(true)}
            className="text-sm text-procreate-accent hover:underline mb-6 block"
          >
            フォルダとは？
          </button>

          {/* フォルダリスト（横スクロール） */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* 「全て」フォルダ */}
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex-shrink-0 flex items-center gap-2 px-[14px] py-[6px] rounded-full font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] ${
                selectedFolderId === null
                  ? 'bg-procreate-accent text-white shadow-lg'
                  : 'bg-procreate-tag text-white hover:bg-procreate-hover'
              }`}
            >
              <FolderIcon size={18} />
              {t('photoManager.folders.allPhotos')} ({folderPhotoCounts.get(null) || 0})
            </button>

            {/* ユーザー作成フォルダ */}
            {folders.map(folder => (
              <div key={folder.id} className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-2 px-[14px] py-[6px] rounded-full font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] ${
                    selectedFolderId === folder.id
                      ? 'bg-procreate-accent text-white shadow-lg'
                      : 'bg-procreate-tag text-white hover:bg-procreate-hover'
                  }`}
                >
                  <FolderIcon size={18} />
                  {folder.name} ({folderPhotoCounts.get(folder.id) || 0})
                </button>

                {/* 選択中のフォルダには削除ボタンを表示 */}
                {selectedFolderId === folder.id && (
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-[0.98] active:scale-[0.98] transition-all"
                    title={t('photoManager.folders.deleteFolder')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ③写真管理セクション */}
        <div className="glass-card rounded-lg shadow-md p-8">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl font-bold text-white">
                {t('photoManager.title')}
              </h1>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowUploader(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-procreate-accent text-white rounded-xl hover:bg-blue-600 hover:scale-[0.98] active:scale-[0.98] transition-all font-semibold"
                >
                  <Plus size={20} />
                  {t('photoManager.management.addPhoto')}
                </button>

                <button
                  onClick={handleBackup}
                  className="flex items-center gap-2 px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all font-semibold"
                >
                  <Download size={20} />
                  {t('photoManager.management.backup')}
                </button>

                <button
                  onClick={handleRestore}
                  className="flex items-center gap-2 px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all font-semibold"
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

            {/* Photo usage meter in management section */}
            <div className="w-full mb-6">
              <PhotoUsageMeter
                currentCount={folderPhotoCounts.get(null) || 0}
                maxCount={500}
              />
            </div>

            {/* 説明 + Template Store CTA */}
            <div className="bg-procreate-tag rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-4">
                💡 {t('photoManager.management.hint')}
              </p>

              {/* Template Store Call-to-Action */}
              <div className="mt-3 pt-3 border-t border-gray-600 flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-3 text-center">
                  {t('photoManager.templateStore.callToAction')}
                </p>
                <button
                  onClick={handleBrowseTemplates}
                  className="template-store-button w-full max-w-xs inline-flex items-center justify-center gap-3 px-5 py-3 bg-procreate-accent text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-base"
                >
                  <ShoppingBag size={20} />
                  {t('photoManager.templateStore.browseButton')}
                </button>
              </div>
            </div>

            {/* バックアップ・復元のステータスメッセージ */}
            {backupStatus && (
              <div className="mt-4 bg-procreate-tag border border-procreate-accent rounded-lg p-4">
                <p className="text-sm text-procreate-accent">{backupStatus}</p>
              </div>
            )}
          </div>

          {/* 区切り線 */}
          <div className="border-t border-gray-600 mb-8"></div>

          {/* 保存された写真グリッド */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
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

        {/* フォルダヘルプモーダル */}
        {showFolderHelpModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFolderHelpModal(false)}
          >
            <div
              className="glass-card rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">フォルダとは？</h3>
                <button
                  onClick={() => setShowFolderHelpModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-300 mb-4">
                フォルダを使うと、写真をカテゴリ別に整理できます。<br />
                「手」「猫」「ポーズ」などフォルダを作成すると、フォルダ別に練習が可能になります。
              </p>
              <img
                src="/assets/Animation1.gif"
                alt="フォルダの使い方"
                className="w-full rounded-lg border border-gray-600"
              />
            </div>
          </div>
        )}

        {/* フォルダ削除確認モーダル */}
        {showDeleteFolderModal && selectedFolderId && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={cancelDeleteFolder}
          >
            <div
              className="glass-card-opaque rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* タイトル */}
              <h3 className="text-xl font-bold text-white mb-4">
                {t('photoManager.folders.deleteFolderModal.title')}
              </h3>

              {/* フォルダ情報 */}
              <div className="mb-6">
                <p className="text-white mb-2">
                  {t('photoManager.folders.deleteFolderModal.confirmMessage', {
                    folderName: folders.find(f => f.id === selectedFolderId)?.name || ''
                  })}
                </p>
                <p className="text-sm text-gray-300">
                  {t('photoManager.folders.deleteFolderModal.photoCount', {
                    count: folderPhotoCounts.get(selectedFolderId) || 0
                  })}
                </p>
              </div>

              {/* チェックボックス */}
              <label className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={deleteFolderWithPhotos}
                  onChange={(e) => setDeleteFolderWithPhotos(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-white">{t('photoManager.folders.deleteFolderModal.deletePhotosCheckbox')}</span>
              </label>

              {/* 説明テキスト */}
              <p className="text-xs text-gray-400 mb-6">
                {deleteFolderWithPhotos
                  ? t('photoManager.folders.deleteFolderModal.warningDelete')
                  : t('photoManager.folders.deleteFolderModal.warningKeep')
                }
              </p>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteFolder}
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm text-white rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmDeleteFolder}
                  className="flex-1 px-4 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-2xl border border-red-400/30 shadow-sm hover:shadow-md hover:bg-red-600/90 transition-all duration-200"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="mt-12 pb-6 text-center space-y-4">
          {/* 開発者サイトへのリンク */}
          <a
            href={import.meta.env.VITE_MAIN_SITE_URL || 'https://www.ennui-lab.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover transition-all border border-gray-600"
          >
            <ExternalLink size={18} />
            <span>開発者のWEBサイトはこちら</span>
          </a>
          <p className="text-sm text-gray-400">
            © 2025 あんにゅい. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};
