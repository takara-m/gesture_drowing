import type { TemplatePackMetadata, TemplatePacksData, TemplatePackDownload } from '../types/templatePack';
import { createFolder, getAllFolders } from './folderService';
import { db } from './db';
import type { Photo } from './db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Load all template packs from the static JSON file
 */
export const loadTemplatePacks = async (): Promise<TemplatePackMetadata[]> => {
  try {
    const response = await fetch('/data/templatePacks.json');
    if (!response.ok) {
      throw new Error(`Failed to load template packs: ${response.statusText}`);
    }
    const data: TemplatePacksData = await response.json();
    return data.packs;
  } catch (error) {
    console.error('[TemplatePackService] Error loading template packs:', error);
    throw error;
  }
};

/**
 * Get a specific template pack by ID
 */
export const getTemplatePackById = async (packId: string): Promise<TemplatePackMetadata | undefined> => {
  const packs = await loadTemplatePacks();
  return packs.find(pack => pack.id === packId);
};

/**
 * Download free template pack
 * Fetches pre-built JSON from /data/packs/ and imports directly
 */
export const downloadFreePack = async (packId: string): Promise<void> => {
  // 1. Validate pack metadata
  const pack = await getTemplatePackById(packId);

  if (!pack) {
    throw new Error(`Pack not found: ${packId}`);
  }

  if (!pack.isFree) {
    throw new Error(`Pack ${packId} is not free. Use purchase flow instead.`);
  }

  // 2. Fetch pre-built JSON
  const response = await fetch(`/data/packs/${packId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load pack data: ${response.statusText}`);
  }

  // 3. Parse JSON
  const downloadData: TemplatePackDownload = await response.json();

  // 4. Auto-import using existing function
  await importTemplatePack(downloadData);

  console.log('[TemplatePackService] Free pack imported successfully:', packId);
};

/**
 * Download purchased pack from backend
 * Phase 2/3: This will make an authenticated API call to fetch the pack data
 */
export const downloadPurchasedPack = async (packId: string, _sessionId: string): Promise<void> => {
  // TODO Phase 3: Implement backend API call
  // const response = await fetch(`/api/download-pack?packId=${packId}&sessionId=${_sessionId}`);
  // if (!response.ok) throw new Error('Download failed');
  // const packData = await response.json();

  // For now, same as free pack
  console.warn('[TemplatePackService] downloadPurchasedPack not yet implemented. Falling back to free pack download.');
  await downloadFreePack(packId);
};

/**
 * Get image dimensions from data URL
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
 * Create thumbnail from data URL
 */
async function createThumbnail(dataUrl: string, maxSize: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Maintain aspect ratio while resizing
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
 * Import template pack JSON into user's photo library
 * This function integrates with the existing photo/folder services
 */
export const importTemplatePack = async (packData: TemplatePackDownload): Promise<{ success: number; errors: number }> => {
  console.log('[TemplatePackService] Importing pack:', packData.packName);

  let successCount = 0;
  let errorCount = 0;

  try {
    // 1. Check if folder with the same name already exists
    const existingFolders = await getAllFolders();
    let folderId: string;

    const existingFolder = existingFolders.find(f => f.name === packData.folderName);
    if (existingFolder) {
      console.log(`[TemplatePackService] Using existing folder: ${existingFolder.id}`);
      folderId = existingFolder.id;
    } else {
      // Create new folder
      const newFolder = await createFolder(packData.folderName);
      folderId = newFolder.id;
      console.log(`[TemplatePackService] Created folder: ${folderId} - ${packData.folderName}`);
    }

    // 2. Import each photo
    for (const templatePhoto of packData.photos) {
      try {
        // Check if photo already exists (by filename in this folder)
        const existingPhotos = await db.photos
          .where('folderId')
          .equals(folderId)
          .and(p => p.filename === templatePhoto.filename)
          .toArray();

        if (existingPhotos.length > 0) {
          console.log(`[TemplatePackService] Skipping duplicate: ${templatePhoto.filename}`);
          continue;
        }

        // Get dimensions if not provided
        let { width, height } = templatePhoto;
        if (!width || !height) {
          const dimensions = await getImageDimensions(templatePhoto.dataUrl);
          width = dimensions.width;
          height = dimensions.height;
        }

        // Generate thumbnail if not provided
        let thumbnailUrl = templatePhoto.thumbnailUrl;
        if (!thumbnailUrl) {
          thumbnailUrl = await createThumbnail(templatePhoto.dataUrl);
        }

        // Calculate file size if not provided
        let fileSize = templatePhoto.fileSize;
        if (!fileSize) {
          fileSize = Math.round((templatePhoto.dataUrl.length * 3) / 4); // Base64 decoded size estimate
        }

        // Create Photo object
        const photo: Photo = {
          id: uuidv4(),
          folderId,
          filename: templatePhoto.filename,
          dataUrl: templatePhoto.dataUrl,
          thumbnailUrl,
          width,
          height,
          fileSize,
          addedAt: new Date(),
          tags: templatePhoto.tags || ['template-pack', packData.packId]
        };

        // Add to IndexedDB
        await db.photos.add(photo);
        console.log(`[TemplatePackService] Added photo: ${templatePhoto.filename}`);
        successCount++;
      } catch (error) {
        console.error(`[TemplatePackService] Failed to import ${templatePhoto.filename}:`, error);
        errorCount++;
      }
    }

    console.log(`[TemplatePackService] Import complete: ${successCount} success, ${errorCount} errors`);
    return { success: successCount, errors: errorCount };
  } catch (error) {
    console.error('[TemplatePackService] Import failed:', error);
    throw error;
  }
};
