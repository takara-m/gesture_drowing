import { createFolder } from './folderService';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { Photo } from './db';

const TEMPLATE_FOLDER_NAME = 'template';
const LOCALSTORAGE_KEY = 'gesdro_templates_initialized';

const TEMPLATE_IMAGES = [
  'Close-up Portrait of a Human Subject.png',
  'Close-Up Portrait.png',
  'image.jpg',
  'japanese idol women.jpg',
  'japanese idol women2.jpg',
  'japanese idol women3.jpg',
  'japanese men.jpg',
  'japanese men2.jpg',
  'Portrait Profile View.png'
];

/**
 * 画像URLをfetchしてData URLに変換
 */
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 画像のサイズを取得
 */
async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * サムネイル生成（簡易版 - 元画像を縮小）
 */
async function createThumbnail(dataUrl: string, maxSize: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // アスペクト比を維持しながらリサイズ
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * テンプレート写真を初期化
 * LocalStorageでフラグ管理し、初回のみ実行
 */
export async function initializeTemplatePhotos(): Promise<void> {
  try {
    // 既に初期化済みかチェック
    const initialized = localStorage.getItem(LOCALSTORAGE_KEY);
    if (initialized === 'true') {
      console.log('[templateService] Templates already initialized, skipping');
      return;
    }

    console.log('[templateService] Initializing template photos...');

    // 1. templateフォルダを作成
    const folder = await createFolder(TEMPLATE_FOLDER_NAME);
    console.log(`[templateService] Created folder: ${folder.id} - ${TEMPLATE_FOLDER_NAME}`);

    // 2. 各画像を処理
    let successCount = 0;
    for (const filename of TEMPLATE_IMAGES) {
      try {
        // 画像をfetch
        const imageUrl = `/assets/template/${filename}`;
        const dataUrl = await fetchImageAsDataUrl(imageUrl);

        // サイズ取得
        const { width, height } = await getImageDimensions(dataUrl);

        // サムネイル生成
        const thumbnailUrl = await createThumbnail(dataUrl);

        // Data URLのサイズ計算（概算）
        const fileSize = Math.round((dataUrl.length * 3) / 4); // Base64デコード後のサイズ

        // Photoオブジェクト作成
        const photo: Photo = {
          id: uuidv4(),
          folderId: folder.id,
          filename,
          dataUrl,
          thumbnailUrl,
          width,
          height,
          fileSize,
          addedAt: new Date(),
          tags: ['template']
        };

        // IndexedDBに追加
        await db.photos.add(photo);
        console.log(`[templateService] Added photo: ${filename}`);
        successCount++;
      } catch (error) {
        console.error(`[templateService] Failed to add ${filename}:`, error);
        // 個別の画像失敗は続行
      }
    }

    // 3. LocalStorageフラグを設定
    localStorage.setItem(LOCALSTORAGE_KEY, 'true');
    console.log(`[templateService] Template initialization complete: ${successCount}/${TEMPLATE_IMAGES.length} photos added`);
  } catch (error) {
    console.error('[templateService] Failed to initialize templates:', error);
    // エラーがあってもアプリは継続
  }
}

/**
 * テンプレート初期化フラグをリセット（デバッグ用）
 */
export function resetTemplateFlag(): void {
  localStorage.removeItem(LOCALSTORAGE_KEY);
  console.log('[templateService] Template flag reset');
}
