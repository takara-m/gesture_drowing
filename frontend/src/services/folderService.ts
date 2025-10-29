import { v4 as uuidv4 } from 'uuid';
import type { Folder } from './db';
import { db } from './db';

/**
 * 全フォルダを作成順に取得
 */
export const getAllFolders = async (): Promise<Folder[]> => {
  return await db.folders.orderBy('createdAt').toArray();
};

/**
 * IDでフォルダを取得
 */
export const getFolderById = async (id: string): Promise<Folder | undefined> => {
  return await db.folders.get(id);
};

/**
 * 新しいフォルダを作成
 */
export const createFolder = async (name: string): Promise<Folder> => {
  const folder: Folder = {
    id: uuidv4(),
    name,
    createdAt: new Date()
  };

  await db.folders.add(folder);
  console.log(`[folderService] Folder created: ${folder.id} - ${name}`);
  return folder;
};

/**
 * フォルダを削除
 * 注意: フォルダ内の写真のfolderIdはnullに設定される
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  // フォルダ内の写真のfolderIdをnullに設定
  const photos = await db.photos.where('folderId').equals(folderId).toArray();
  for (const photo of photos) {
    await db.photos.update(photo.id!, { folderId: null });
  }

  // フォルダを削除
  await db.folders.delete(folderId);
  console.log(`[folderService] Folder deleted: ${folderId}, ${photos.length} photos moved to root`);
};

/**
 * フォルダ内の写真数を取得
 */
export const getPhotoCountInFolder = async (folderId: string | null): Promise<number> => {
  if (folderId === null) {
    // 「全て」: 全写真数
    return await db.photos.count();
  }

  return await db.photos.where('folderId').equals(folderId).count();
};

/**
 * フォルダ内の写真を取得
 */
export const getPhotosInFolder = async (folderId: string | null) => {
  if (folderId === null) {
    // 「全て」: 全写真を取得
    return await db.photos.orderBy('addedAt').reverse().toArray();
  }

  // フォルダIDでフィルタリングしてから、JavaScriptでソート
  const photos = await db.photos.where('folderId').equals(folderId).toArray();
  return photos.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
};

/**
 * 写真を別のフォルダに移動
 */
export const movePhotoToFolder = async (photoId: string, folderId: string | null): Promise<void> => {
  await db.photos.update(photoId, { folderId });
  console.log(`[folderService] Photo ${photoId} moved to folder ${folderId}`);
};

/**
 * 複数の写真を一括で別のフォルダに移動
 */
export const bulkMovePhotos = async (photoIds: string[], folderId: string | null): Promise<void> => {
  for (const photoId of photoIds) {
    await movePhotoToFolder(photoId, folderId);
  }
  console.log(`[folderService] Moved ${photoIds.length} photos to folder ${folderId}`);
};
