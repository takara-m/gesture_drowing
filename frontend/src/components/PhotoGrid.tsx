import React, { useEffect, useState } from 'react';
import { Trash2, MoreVertical, Check, X, FolderIcon } from 'lucide-react';
import type { Photo, Folder } from '../services/db';
import { bulkDeletePhotos, deletePhoto } from '../services/photoService';
import { getPhotosInFolder, getAllFolders, bulkMovePhotos } from '../services/folderService';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoGridProps {
  selectedFolderId?: string | null;
  onPhotoSelect?: (photo: Photo) => void;
  onPhotosChange?: () => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ selectedFolderId = null, onPhotoSelect, onPhotosChange }) => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Map<string, string>>(new Map());
  const [errorPhotos, setErrorPhotos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 選択モード関連
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  // モーダル関連
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetPhotos, setMoveTargetPhotos] = useState<string[]>([]);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  // フォルダリスト
  const [folders, setFolders] = useState<Folder[]>([]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      console.log(`[PhotoGrid] Loading photos for folder: ${selectedFolderId}`);
      const allPhotos = await getPhotosInFolder(selectedFolderId);
      console.log(`[PhotoGrid] Loaded ${allPhotos.length} photos from IndexedDB`);
      setPhotos(allPhotos);

      const urlMap = new Map<string, string>();
      const errorSet = new Set<string>();

      for (const photo of allPhotos) {
        try {
          if (photo.thumbnailUrl) {
            urlMap.set(photo.id!, photo.thumbnailUrl);
          } else {
            errorSet.add(photo.id!);
          }
        } catch (error) {
          console.error(`[PhotoGrid] Failed to load thumbnail for photo ${photo.id}:`, error);
          errorSet.add(photo.id!);
        }
      }

      setThumbnailUrls(urlMap);
      setErrorPhotos(errorSet);
    } catch (error) {
      console.error('[PhotoGrid] Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    const folderList = await getAllFolders();
    setFolders(folderList);
  };

  useEffect(() => {
    loadPhotos();
    loadFolders();
  }, [selectedFolderId]);

  // 選択モードの切り替え
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedPhotoIds(new Set());
  };

  // チェックボックスの切り替え
  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotoIds);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotoIds(newSelection);
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedPhotoIds.size === 0) return;

    if (!confirm(t('photoGrid.bulkDeleteConfirm', { count: String(selectedPhotoIds.size) }))) {
      return;
    }

    try {
      await bulkDeletePhotos(Array.from(selectedPhotoIds));
      setSelectedPhotoIds(new Set());
      setSelectionMode(false);
      await loadPhotos();

      if (onPhotosChange) {
        onPhotosChange();
      }
    } catch (error) {
      console.error('Failed to bulk delete photos:', error);
      alert('削除に失敗しました');
    }
  };

  // 一括移動モーダルを開く
  const openBulkMoveModal = () => {
    setMoveTargetPhotos(Array.from(selectedPhotoIds));
    setShowMoveModal(true);
  };

  // 単一写真の移動モーダルを開く
  const openSingleMoveModal = (photoId: string) => {
    setMoveTargetPhotos([photoId]);
    setShowMoveModal(true);
    setShowContextMenu(null);
  };

  // フォルダ移動を実行
  const handleMoveToFolder = async (targetFolderId: string | null) => {
    try {
      await bulkMovePhotos(moveTargetPhotos, targetFolderId);
      setShowMoveModal(false);
      setMoveTargetPhotos([]);
      setSelectedPhotoIds(new Set());
      setSelectionMode(false);
      await loadPhotos();

      if (onPhotosChange) {
        onPhotosChange();
      }
    } catch (error) {
      console.error('Failed to move photos:', error);
      alert('移動に失敗しました');
    }
  };

  // 拡大表示を開く
  const openImageModal = (photo: Photo) => {
    setModalPhoto(photo);
    setShowImageModal(true);
    setShowContextMenu(null);
  };

  // 単一写真の削除
  const handleSingleDelete = async (photoId: string) => {
    if (!confirm(t('photoGrid.deleteConfirm'))) {
      return;
    }

    try {
      await deletePhoto(photoId);
      setShowContextMenu(null);
      await loadPhotos();

      if (onPhotosChange) {
        onPhotosChange();
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-procreate-accent"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300 text-lg">{t('photoGrid.noPhotos')}</p>
        <p className="text-gray-400 mt-2">{t('photoGrid.noPhotosDescription')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* ツールバー */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={toggleSelectionMode}
          className={`px-4 py-2 rounded-xl font-semibold transition-all hover:scale-[0.98] active:scale-[0.98] ${
            selectionMode
              ? 'bg-procreate-accent text-white'
              : 'bg-procreate-tag text-white hover:bg-procreate-hover'
          }`}
        >
          {selectionMode ? (
            <span className="flex items-center gap-2">
              <Check size={18} />
              {t('photoGrid.selectedCount', { count: String(selectedPhotoIds.size) })}
            </span>
          ) : (
            t('photoGrid.selectMode')
          )}
        </button>

        {/* アクションバー（選択モード時のみ表示） */}
        {selectionMode && selectedPhotoIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={openBulkMoveModal}
              className="px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <FolderIcon size={18} />
              {t('photoGrid.bulkMove')}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-[0.98] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('photoGrid.bulkDelete')}
            </button>
          </div>
        )}

        {selectionMode && (
          <button
            onClick={toggleSelectionMode}
            className="px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all"
          >
            {t('photoGrid.cancelSelection')}
          </button>
        )}
      </div>

      {/* 写真グリッド */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group bg-procreate-card rounded-lg shadow-md hover:shadow-xl transition-shadow"
          >
            {/* 選択モード時のチェックボックス */}
            {selectionMode && (
              <div className="absolute top-2 left-2 z-20">
                <input
                  type="checkbox"
                  checked={selectedPhotoIds.has(photo.id!)}
                  onChange={() => togglePhotoSelection(photo.id!)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            )}

            {/* 3点メニュー（通常モード時のみ） */}
            {!selectionMode && (
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={() => setShowContextMenu(showContextMenu === photo.id ? null : photo.id!)}
                  className="bg-white bg-opacity-90 p-1 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <MoreVertical size={18} />
                </button>

                {/* コンテキストメニュー */}
                {showContextMenu === photo.id && (
                  <div className="absolute right-0 mt-1 bg-procreate-tag rounded-lg shadow-xl border border-gray-600 py-1 min-w-[150px]">
                    <button
                      onClick={() => openSingleMoveModal(photo.id!)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-procreate-hover flex items-center gap-2"
                    >
                      <FolderIcon size={16} />
                      {t('photoGrid.moveToFolder')}
                    </button>
                    <button
                      onClick={() => handleSingleDelete(photo.id!)}
                      className="w-full px-4 py-2 text-left hover:bg-procreate-hover flex items-center gap-2 text-red-500"
                    >
                      <Trash2 size={16} />
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* サムネイル */}
            <div
              className="aspect-square overflow-hidden bg-procreate-bg rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => !selectionMode && openImageModal(photo)}
            >
              {errorPhotos.has(photo.id!) ? (
                <div className="text-center p-4">
                  <p className="text-red-500 text-sm font-semibold mb-1">{t('photoGrid.loadError')}</p>
                  <p className="text-xs text-gray-400">{t('photoGrid.loadErrorDescription')}</p>
                </div>
              ) : thumbnailUrls.get(photo.id!) ? (
                <img
                  src={thumbnailUrls.get(photo.id!)}
                  alt={photo.filename}
                  className="w-full h-full object-cover hover:scale-110 transition-transform rounded-lg"
                />
              ) : (
                <div className="text-gray-400">{t('common.loading')}</div>
              )}
            </div>

            {/* ファイル名 */}
            <div className="p-2 bg-procreate-card">
              <p className="text-xs text-gray-300 truncate" title={photo.filename}>
                {photo.filename}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(photo.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 拡大表示モーダル */}
      {showImageModal && modalPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={modalPhoto.dataUrl}
              alt={modalPhoto.filename}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <p className="font-semibold">{modalPhoto.filename}</p>
              <p className="text-sm text-gray-300">
                {modalPhoto.width} × {modalPhoto.height} px
              </p>
            </div>
          </div>
        </div>
      )}

      {/* フォルダ移動モーダル */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-procreate-card rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">{t('photoGrid.selectFolder')}</h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* 「全て」フォルダ */}
              <button
                onClick={() => handleMoveToFolder(null)}
                className="w-full px-4 py-3 text-left text-white bg-procreate-tag hover:bg-procreate-hover rounded-lg transition-colors flex items-center gap-2"
              >
                <FolderIcon size={18} />
                {t('photoManager.folders.allPhotos')}
              </button>

              {/* ユーザー作成フォルダ */}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveToFolder(folder.id)}
                  className="w-full px-4 py-3 text-left text-white bg-procreate-tag hover:bg-procreate-hover rounded-lg transition-colors flex items-center gap-2"
                >
                  <FolderIcon size={18} />
                  {folder.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowMoveModal(false);
                setMoveTargetPhotos([]);
              }}
              className="mt-4 w-full px-4 py-2 bg-procreate-tag text-white rounded-xl hover:bg-procreate-hover hover:scale-[0.98] active:scale-[0.98] transition-all"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
