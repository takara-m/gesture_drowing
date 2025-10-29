import Dexie from 'dexie';

// データ型定義
export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Photo {
  id?: string;
  folderId: string | null;  // フォルダID（nullは「全て」に表示）
  filename: string;
  dataUrl: string;        // Blobの代わりにData URL文字列を保存（iOS Safari対応）
  thumbnailUrl: string;   // サムネイルもData URL文字列
  width: number;
  height: number;
  fileSize: number;
  addedAt: Date;
  tags?: string[];
}

export interface Drawing {
  id?: string;
  photoId: string;
  step: 1 | 2;
  canvasData: any;
  imageUrl?: string;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Dexie データベースクラス
export class GestureDrawingDB extends Dexie {
  folders!: Dexie.Table<Folder, string>;
  photos!: Dexie.Table<Photo, string>;
  drawings!: Dexie.Table<Drawing, string>;

  constructor() {
    super('GestureDrawingDB');

    // Version 1: 初期スキーマ（Blob使用）
    this.version(1).stores({
      photos: 'id, filename, addedAt',
      drawings: 'id, photoId, step, createdAt, updatedAt'
    });

    // Version 2: Blob → Data URLに変更（iOS Safari対応）
    this.version(2).stores({
      photos: 'id, filename, addedAt',
      drawings: 'id, photoId, step, createdAt, updatedAt'
    }).upgrade(tx => {
      // 既存データをクリア（Blob形式のデータは使用不可のため）
      console.log('[DB Migration] Clearing old blob-based photos...');
      return tx.table('photos').clear();
    });

    // Version 3: フォルダ機能追加
    this.version(3).stores({
      folders: 'id, name, createdAt',
      photos: 'id, folderId, filename, addedAt',
      drawings: 'id, photoId, step, createdAt, updatedAt'
    }).upgrade(async tx => {
      // 既存の写真に folderId: null を設定
      console.log('[DB Migration] Adding folderId to existing photos...');
      const photos = await tx.table('photos').toArray();
      for (const photo of photos) {
        if (!('folderId' in photo)) {
          await tx.table('photos').update(photo.id!, { folderId: null });
        }
      }
    });
  }
}

// データベースインスタンス
export const db = new GestureDrawingDB();
