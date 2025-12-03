// テンプレートパックの型定義

export type TemplateCategory = 'portrait' | 'hand' | 'pose' | 'animal' | 'object';

export interface TemplatePackMetadata {
  id: string;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  category: TemplateCategory;
  price: number;
  photoCount: number;
  thumbnailUrl: string;
  previewImages: string[];
  isFree: boolean;
  stripeProductId: string;
  stripePriceId: string;
}

export interface TemplatePhoto {
  filename: string;
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  tags?: string[];
}

export interface TemplatePackDownload {
  version: string;
  exportDate: string;
  packId: string;
  packName: string;
  folderName: string;
  totalPhotos: number;
  photos: TemplatePhoto[];
}

export interface TemplatePacksData {
  version: string;
  lastUpdated: string;
  packs: TemplatePackMetadata[];
}
