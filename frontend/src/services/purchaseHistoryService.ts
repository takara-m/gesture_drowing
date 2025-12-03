/**
 * Purchase History Service
 * Manages tracking of purchased template packs using LocalStorage
 *
 * LocalStorage Structure:
 * Key: 'gesdro_purchased_packs'
 * Value: JSON array of purchased pack IDs
 * Example: ["pack-portrait-pro", "pack-pose-dynamic"]
 */

const LOCALSTORAGE_KEY = 'gesdro_purchased_packs';

/**
 * Get all purchased pack IDs from LocalStorage
 */
export const getPurchasedPackIds = (): string[] => {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[PurchaseHistoryService] Error reading purchased packs:', error);
    return [];
  }
};

/**
 * Check if a specific pack has been purchased
 */
export const isPurchased = (packId: string): boolean => {
  const purchasedPacks = getPurchasedPackIds();
  return purchasedPacks.includes(packId);
};

/**
 * Mark a pack as purchased
 * Returns true if successfully added, false if already purchased
 */
export const markAsPurchased = (packId: string): boolean => {
  try {
    const purchasedPacks = getPurchasedPackIds();

    // Check if already purchased
    if (purchasedPacks.includes(packId)) {
      console.log(`[PurchaseHistoryService] Pack ${packId} already marked as purchased`);
      return false;
    }

    // Add to purchased list
    purchasedPacks.push(packId);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(purchasedPacks));

    console.log(`[PurchaseHistoryService] Marked pack ${packId} as purchased`);
    return true;
  } catch (error) {
    console.error('[PurchaseHistoryService] Error marking pack as purchased:', error);
    return false;
  }
};

/**
 * Remove a pack from purchase history
 * Useful for testing or refunds
 */
export const removePurchase = (packId: string): boolean => {
  try {
    const purchasedPacks = getPurchasedPackIds();
    const filtered = purchasedPacks.filter(id => id !== packId);

    if (filtered.length === purchasedPacks.length) {
      console.log(`[PurchaseHistoryService] Pack ${packId} was not in purchase history`);
      return false;
    }

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
    console.log(`[PurchaseHistoryService] Removed pack ${packId} from purchase history`);
    return true;
  } catch (error) {
    console.error('[PurchaseHistoryService] Error removing purchase:', error);
    return false;
  }
};

/**
 * Clear all purchase history
 * WARNING: This will remove all purchase records
 * Only use for testing or complete reset
 */
export const clearPurchaseHistory = (): void => {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    console.log('[PurchaseHistoryService] Purchase history cleared');
  } catch (error) {
    console.error('[PurchaseHistoryService] Error clearing purchase history:', error);
  }
};

/**
 * Get purchase count (total number of packs purchased)
 */
export const getPurchaseCount = (): number => {
  return getPurchasedPackIds().length;
};

/**
 * Export purchase history as JSON string (for backup)
 */
export const exportPurchaseHistory = (): string => {
  const purchasedPacks = getPurchasedPackIds();
  return JSON.stringify({
    version: '1.0',
    exportDate: new Date().toISOString(),
    purchasedPacks
  }, null, 2);
};

/**
 * Import purchase history from JSON string (for restore)
 * Returns number of packs imported
 */
export const importPurchaseHistory = (jsonString: string): number => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.purchasedPacks || !Array.isArray(data.purchasedPacks)) {
      throw new Error('Invalid purchase history format');
    }

    const currentPacks = getPurchasedPackIds();
    const newPacks = data.purchasedPacks.filter((id: string) => !currentPacks.includes(id));

    // Merge with existing purchases
    const merged = [...currentPacks, ...newPacks];
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(merged));

    console.log(`[PurchaseHistoryService] Imported ${newPacks.length} new purchases`);
    return newPacks.length;
  } catch (error) {
    console.error('[PurchaseHistoryService] Error importing purchase history:', error);
    throw error;
  }
};
