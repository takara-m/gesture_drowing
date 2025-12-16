import { db } from './db';
import type { Photo, Folder } from './db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getAllFolders, createFolder } from './folderService';

// ===== セキュリティ制限 =====
const MAX_PHOTOS = 500; // 最大保存可能写真数（複数テンプレートパック購入対応）
const MAX_BACKUP_SIZE = 150 * 1024 * 1024; // 150MB（バックアップJSONファイルの最大サイズ、500枚対応）
const MAX_DATA_URL_SIZE = 5 * 1024 * 1024; // 5MB（単一Data URLの最大サイズ）

// ===== バックアップJSON検証スキーマ (Zod) =====
const PhotoSchema = z.object({
  id: z.string().uuid(),
  folderId: z.string().uuid().nullable(),
  filename: z.string().min(1).max(255),
  dataUrl: z.string().refine(
    (val) => val.startsWith('data:image/') && val.length < MAX_DATA_URL_SIZE,
    { message: 'Invalid or too large data URL' }
  ),
  thumbnailUrl: z.string().refine(
    (val) => val.startsWith('data:image/') && val.length < MAX_DATA_URL_SIZE,
    { message: 'Invalid or too large thumbnail URL' }
  ),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  fileSize: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  addedAt: z.union([z.date(), z.string().datetime()]),
  tags: z.array(z.string()).optional()
});

const FolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.union([z.date(), z.string().datetime()])
});

const BackupSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  totalPhotos: z.number().int().nonnegative(),
  folders: z.array(FolderSchema).optional(),  // v2.0用（v1.0互換性のためoptional）
  photos: z.array(PhotoSchema).max(MAX_PHOTOS)
});

// 画像をリサイズしてData URLを生成（iOS Safari対応: Blob → Data URL）
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`[resizeImage] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) {
        console.error('[resizeImage] FileReader result is null');
        reject(new Error('FileReader result is null'));
        return;
      }
      console.log(`[resizeImage] FileReader loaded, data URL length: ${(result as string).length}`);
      img.src = result as string;
    };

    img.onload = () => {
      console.log(`[resizeImage] Image loaded: ${img.width}x${img.height}`);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // アスペクト比を維持してリサイズ
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      console.log(`[resizeImage] Canvas size: ${width}x${height}`);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[resizeImage] Canvas context not available');
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // iOS Safari対応: BlobではなくData URLを直接返す
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        console.log(`[resizeImage] Data URL created successfully, length: ${dataUrl.length}`);

        // メモリクリーンアップ: canvasをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        resolve(dataUrl);
      } catch (error) {
        console.error('[resizeImage] Failed to create data URL from canvas:', error);

        // エラー時もcanvasをクリーンアップ
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        reject(new Error('Failed to create data URL'));
      }
    };

    img.onerror = (e) => {
      console.error('[resizeImage] Image load error:', e);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    reader.onerror = (e) => {
      console.error('[resizeImage] FileReader error:', e);
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
};

// サムネイル生成（Data URL形式）
export const createThumbnail = (file: File): Promise<string> => {
  return resizeImage(file, 200, 200);
};

// 写真を追加
export const addPhoto = async (file: File, folderId: string | null = null): Promise<string> => {
  try {
    console.log(`[addPhoto] Starting upload: ${file.name}, type: ${file.type}, size: ${file.size}, folderId: ${folderId}`);

    // 写真数制限チェック（セキュリティ: メモリ保護）
    const existingPhotos = await getAllPhotos();
    if (existingPhotos.length >= MAX_PHOTOS) {
      throw new Error(`写真は最大${MAX_PHOTOS}枚まで保存できます。古い写真を削除してください。`);
    }

    // HEIC形式の警告（iOSで一般的だが、ブラウザのサポートが限定的）
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
      console.warn('[addPhoto] HEIC format detected. This may cause issues on some browsers.');
      throw new Error('HEIC形式の画像は対応していません。JPEGまたはPNGに変換してください。');
    }

    // 画像の元のサイズを取得
    const img = new Image();
    const reader = new FileReader();

    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) {
          console.error('[addPhoto] FileReader result is null');
          reject(new Error('Failed to read file'));
          return;
        }
        img.src = result as string;
      };
      img.onload = () => {
        console.log(`[addPhoto] Original dimensions: ${img.width}x${img.height}`);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (e) => {
        console.error('[addPhoto] Image load error:', e);
        reject(new Error('Failed to load image'));
      };
      reader.onerror = (e) => {
        console.error('[addPhoto] FileReader error:', e);
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });

    console.log('[addPhoto] Resizing image...');
    // リサイズ（最大800x800）→ Data URL形式で取得
    const dataUrl = await resizeImage(file, 800, 800);

    console.log('[addPhoto] Creating thumbnail...');
    // サムネイル生成 → Data URL形式で取得
    const thumbnailUrl = await createThumbnail(file);

    const photo: Photo = {
      id: uuidv4(),
      folderId: folderId,         // フォルダID（nullは「全て」に表示）
      filename: file.name,
      dataUrl: dataUrl,           // Data URL文字列を保存（iOS Safari対応）
      thumbnailUrl: thumbnailUrl, // サムネイルもData URL文字列
      width: dimensions.width,
      height: dimensions.height,
      fileSize: file.size,
      addedAt: new Date(),
      tags: []
    };

    console.log(`[addPhoto] Saving to IndexedDB... Photo ID: ${photo.id}, dataUrl length: ${dataUrl.length}, thumbnailUrl length: ${thumbnailUrl.length}`);
    await db.photos.add(photo);
    console.log('[addPhoto] Photo saved successfully');
    return photo.id!;
  } catch (error) {
    console.error('[addPhoto] Failed to add photo:', error);
    throw error;
  }
};

// 写真を取得
export const getPhoto = async (id: string): Promise<Photo | undefined> => {
  return await db.photos.get(id);
};

// 全写真を取得
export const getAllPhotos = async (): Promise<Photo[]> => {
  return await db.photos.orderBy('addedAt').reverse().toArray();
};

// 写真を削除
export const deletePhoto = async (id: string): Promise<void> => {
  await db.photos.delete(id);
  // 関連する描画データも削除
  const drawings = await db.drawings.where('photoId').equals(id).toArray();
  const drawingIds = drawings.map(d => d.id!);
  await db.drawings.bulkDelete(drawingIds);
};

// 複数の写真を一括削除
export const bulkDeletePhotos = async (photoIds: string[]): Promise<void> => {
  for (const id of photoIds) {
    await deletePhoto(id);
  }
};

// 注意: iOS Safari対応のため、写真はData URL形式で直接保存されています
// blobToDataURL関数は不要になりました（後方互換性のため残していません）

// ランダムに写真を取得
export const getRandomPhoto = async (): Promise<Photo | undefined> => {
  const photos = await getAllPhotos();
  if (photos.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * photos.length);
  return photos[randomIndex];
};

// 指定されたIDを除外してランダムに写真を取得
export const getRandomPhotoExcept = async (excludeId: string, folderId: string | null = null): Promise<Photo | undefined> => {
  let photos: Photo[];

  if (folderId === null) {
    // 「全て」: 全写真から選択
    photos = await getAllPhotos();
  } else {
    // 指定フォルダ内の写真から選択
    photos = await db.photos.where('folderId').equals(folderId).toArray();
  }

  // 現在の写真を除外
  const filteredPhotos = photos.filter(photo => photo.id !== excludeId);

  console.log(`[getRandomPhotoExcept] Total photos: ${photos.length}, Filtered: ${filteredPhotos.length}, Excluded ID: ${excludeId}, FolderId: ${folderId}`);

  if (filteredPhotos.length === 0) {
    console.warn('[getRandomPhotoExcept] No other photos available');
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * filteredPhotos.length);
  const selectedPhoto = filteredPhotos[randomIndex];
  console.log(`[getRandomPhotoExcept] Selected photo ID: ${selectedPhoto.id}, filename: ${selectedPhoto.filename}`);

  return selectedPhoto;
};

// 写真を順序で取得（oldest/newest/random）
export const getPhotoByOrder = async (order: 'oldest' | 'newest' | 'random', folderId: string | null = null): Promise<Photo | undefined> => {
  if (order === 'random') {
    if (folderId === null) {
      return getRandomPhoto();
    }
    const photos = await db.photos.where('folderId').equals(folderId).toArray();
    if (photos.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * photos.length);
    return photos[randomIndex];
  }

  let photos: Photo[];

  if (folderId === null) {
    // 「全て」: 全写真から選択
    photos = order === 'oldest'
      ? await db.photos.orderBy('addedAt').toArray()
      : await db.photos.orderBy('addedAt').reverse().toArray();
  } else {
    // 指定フォルダ内の写真から選択
    const folderPhotos = await db.photos.where('folderId').equals(folderId).toArray();
    photos = order === 'oldest'
      ? folderPhotos.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
      : folderPhotos.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  if (photos.length === 0) return undefined;
  return photos[0];
};

// ===== バックアップ・復元機能 =====

// バックアップ用のJSONインターフェース
export interface PhotoBackup {
  version: string;
  exportDate: string;
  totalPhotos: number;
  folders?: Folder[];  // v2.0: フォルダ情報（v1.0互換性のためoptional）
  photos: Photo[];
}

// 全写真をJSON形式でエクスポート
export const exportPhotosToJSON = async (): Promise<string> => {
  try {
    console.log('[exportPhotosToJSON] Starting export...');
    const photos = await getAllPhotos();
    const folders = await getAllFolders();

    const backup: PhotoBackup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      totalPhotos: photos.length,
      folders: folders,
      photos: photos
    };

    const jsonString = JSON.stringify(backup, null, 2);
    console.log(`[exportPhotosToJSON] Successfully exported ${photos.length} photos and ${folders.length} folders, JSON size: ${jsonString.length} bytes`);

    return jsonString;
  } catch (error) {
    console.error('[exportPhotosToJSON] Export failed:', error);
    throw new Error('写真のエクスポートに失敗しました');
  }
};

// JSONファイルから写真をインポート（重複チェック付き）
export const importPhotosFromJSON = async (jsonString: string): Promise<{ imported: number; skipped: number; errors: number }> => {
  try {
    console.log('[importPhotosFromJSON] Starting import...');

    // 1. ファイルサイズチェック（セキュリティ: メモリ保護）
    const backupSize = new Blob([jsonString]).size;
    console.log(`[importPhotosFromJSON] Backup file size: ${backupSize} bytes (${(backupSize / 1024 / 1024).toFixed(2)} MB)`);

    if (backupSize > MAX_BACKUP_SIZE) {
      throw new Error(`バックアップファイルが大きすぎます（最大${MAX_BACKUP_SIZE / 1024 / 1024}MB）`);
    }

    // 2. JSONパース
    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('[importPhotosFromJSON] JSON parse error:', parseError);
      throw new Error('無効なJSON形式です');
    }

    // 3. Zodスキーマ検証（セキュリティ: データ検証）
    const validationResult = BackupSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error('[importPhotosFromJSON] Schema validation failed:', validationResult.error);
      const firstError = validationResult.error.issues[0];
      throw new Error('バックアップファイルの形式が無効です: ' + (firstError?.message || '不明なエラー'));
    }

    const backup: PhotoBackup = validationResult.data as PhotoBackup;
    console.log(`[importPhotosFromJSON] Backup version: ${backup.version}, Total photos in backup: ${backup.totalPhotos}`);

    // フォルダIDマッピング（旧ID → 新ID）
    const folderIdMap = new Map<string, string>();

    // v2.0の場合: フォルダを復元
    if (backup.version === '2.0' && backup.folders && backup.folders.length > 0) {
      console.log(`[importPhotosFromJSON] Restoring ${backup.folders.length} folders...`);
      const existingFolders = await getAllFolders();

      for (const backupFolder of backup.folders) {
        // フォルダ名でマッチング
        const existingFolder = existingFolders.find(f => f.name === backupFolder.name);

        if (existingFolder) {
          // 既存フォルダを使用
          folderIdMap.set(backupFolder.id, existingFolder.id);
          console.log(`[importPhotosFromJSON] Using existing folder: "${backupFolder.name}" (${backupFolder.id} → ${existingFolder.id})`);
        } else {
          // 新規作成
          const newFolder = await createFolder(backupFolder.name);
          folderIdMap.set(backupFolder.id, newFolder.id);
          console.log(`[importPhotosFromJSON] Created new folder: "${backupFolder.name}" (${backupFolder.id} → ${newFolder.id})`);
        }
      }
    }

    // 既存の写真IDを取得
    const existingPhotos = await getAllPhotos();
    const existingIds = new Set(existingPhotos.map(p => p.id));
    console.log(`[importPhotosFromJSON] Existing photos: ${existingIds.size}`);

    // 4. インポート後の合計写真数チェック（セキュリティ: メモリ保護）
    const newPhotos = backup.photos.filter(p => !existingIds.has(p.id));
    const totalAfterImport = existingPhotos.length + newPhotos.length;

    if (totalAfterImport > MAX_PHOTOS) {
      throw new Error(`インポート後の合計写真数が${MAX_PHOTOS}枚を超えます（現在: ${existingPhotos.length}枚、新規: ${newPhotos.length}枚）`);
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // 各写真をインポート
    for (const photo of backup.photos) {
      try {
        // 重複チェック
        if (existingIds.has(photo.id)) {
          console.log(`[importPhotosFromJSON] Skipping duplicate photo: ${photo.id} (${photo.filename})`);
          skipped++;
          continue;
        }

        // Data URLの検証
        if (!photo.dataUrl || !photo.dataUrl.startsWith('data:image/')) {
          console.error(`[importPhotosFromJSON] Invalid dataUrl for photo: ${photo.id}`);
          errors++;
          continue;
        }

        // folderIdを変換（マッピングがあれば）
        let finalFolderId = photo.folderId;
        if (photo.folderId && folderIdMap.has(photo.folderId)) {
          finalFolderId = folderIdMap.get(photo.folderId)!;
          console.log(`[importPhotosFromJSON] Mapped folderId: ${photo.folderId} → ${finalFolderId} for photo ${photo.filename}`);
        }

        // 写真を追加（addedAtをDateオブジェクトに変換）
        await db.photos.add({
          ...photo,
          folderId: finalFolderId,
          addedAt: new Date(photo.addedAt)
        });

        console.log(`[importPhotosFromJSON] Imported photo: ${photo.id} (${photo.filename})`);
        imported++;
      } catch (error) {
        console.error(`[importPhotosFromJSON] Failed to import photo ${photo.id}:`, error);
        errors++;
      }
    }

    console.log(`[importPhotosFromJSON] Import complete. Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);

    return { imported, skipped, errors };
  } catch (error) {
    console.error('[importPhotosFromJSON] Import failed:', error);
    throw new Error('写真のインポートに失敗しました。ファイル形式を確認してください。');
  }
};
