import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { TemplatePackMetadata, TemplateCategory, TemplatePacksData } from '../types/templatePack';
import { redirectToCheckout } from '../services/stripeService';
import { TemplatePreviewModal } from '../components/TemplatePreviewModal';

export const TemplateStore: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<TemplatePackMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedPreviewPack, setSelectedPreviewPack] = useState<TemplatePackMetadata | null>(null);

  // Load template packs from JSON
  useEffect(() => {
    const loadPacks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/templatePacks.json');
        if (!response.ok) {
          throw new Error('Failed to load template packs');
        }
        const data: TemplatePacksData = await response.json();
        setPacks(data.packs);
      } catch (err) {
        console.error('[TemplateStore] Failed to load packs:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  // Filter packs by category
  const filteredPacks = selectedCategory === 'all'
    ? packs
    : packs.filter(pack => pack.category === selectedCategory);

  // Category buttons
  const categories: Array<TemplateCategory | 'all'> = ['all', 'portrait', 'hand', 'pose', 'animal', 'object'];

  // Purchase handler
  const handlePurchase = async (pack: TemplatePackMetadata) => {
    if (pack.isFree) {
      // 無料パックの場合はダウンロード（Phase 3で実装）
      console.log('[TemplateStore] Free pack download:', pack.id);
      alert('無料パックのダウンロード機能はPhase 3で実装予定です');
      return;
    }

    // 有料パックの場合はStripe Checkoutへ
    try {
      setPurchasing(pack.id);

      if (!pack.stripePriceId) {
        throw new Error('Stripe Price ID not found');
      }

      await redirectToCheckout(pack.stripePriceId, pack.id);
    } catch (error) {
      console.error('[TemplateStore] Purchase failed:', error);
      alert('購入処理に失敗しました。もう一度お試しください。');
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-procreate-bg">
      {/* Header */}
      <div className="bg-procreate-card border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/gesdro')}
              className="p-2 hover:bg-procreate-hover rounded-lg transition-colors text-white"
              aria-label={t('templateStore.backToApp')}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('templateStore.title')}</h1>
              <p className="text-gray-300 mt-1">{t('templateStore.description')}</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-procreate-accent text-white shadow-lg'
                    : 'bg-procreate-bg text-gray-300 hover:bg-procreate-hover border border-gray-600'
                }`}
              >
                {t(`templateStore.categories.${category}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-procreate-accent"></div>
            <p className="text-gray-300 mt-4">{t('templateStore.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 font-semibold">{t('templateStore.loadError')}</p>
            <p className="text-red-300 mt-2">{t('templateStore.loadErrorDescription')}</p>
          </div>
        )}

        {!loading && !error && filteredPacks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-300 text-xl font-semibold">{t('templateStore.emptyState.title')}</p>
            <p className="text-gray-400 mt-2">{t('templateStore.emptyState.description')}</p>
          </div>
        )}

        {!loading && !error && filteredPacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-procreate-card rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-procreate-bg overflow-hidden">
                  {pack.thumbnailUrl ? (
                    <img
                      src={pack.thumbnailUrl}
                      alt={pack.name[language]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Preview
                    </div>
                  )}

                  {/* Free Badge */}
                  {pack.isFree && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {t('templateStore.packCard.free')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{pack.name[language]}</h3>
                  <p className="text-gray-300 text-sm mb-4">{pack.description[language]}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm">
                      {t('templateStore.packCard.photoCount', { count: pack.photoCount })}
                    </span>
                    {!pack.isFree && (
                      <span className="text-procreate-accent font-bold text-lg">
                        ¥{pack.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full bg-procreate-accent text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all hover:scale-[0.98] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePurchase(pack)}
                    disabled={purchasing === pack.id}
                  >
                    {purchasing === pack.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        処理中...
                      </span>
                    ) : (
                      pack.isFree ? t('templateStore.packCard.download') : t('templateStore.packCard.purchase')
                    )}
                  </button>

                  {/* View Samples Button */}
                  {pack.previewImages && pack.previewImages.length > 0 && (
                    <button
                      className="w-full mt-2 bg-gray-700 text-white font-medium py-2 rounded-lg hover:bg-gray-600 transition-all hover:scale-[0.98] active:scale-[0.98]"
                      onClick={() => setSelectedPreviewPack(pack)}
                    >
                      サンプルを見る
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={selectedPreviewPack !== null}
        onClose={() => setSelectedPreviewPack(null)}
        previewImages={selectedPreviewPack?.previewImages || []}
        packName={selectedPreviewPack?.name[language] || ''}
      />
    </div>
  );
};
