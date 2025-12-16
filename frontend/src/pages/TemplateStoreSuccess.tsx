import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { markAsPurchased } from '../services/purchaseHistoryService';
import { getTemplatePackById, downloadPurchasedPack } from '../services/templatePackService';
import type { TemplatePackMetadata } from '../types/templatePack';

export const TemplateStoreSuccess: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pack, setPack] = useState<TemplatePackMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const sessionId = searchParams.get('session_id');
  const packId = searchParams.get('pack_id');

  useEffect(() => {
    const processPurchase = async () => {
      if (!packId) {
        console.error('[TemplateStoreSuccess] Pack ID not found');
        navigate('/templates');
        return;
      }

      try {
        // パック情報取得
        const packData = await getTemplatePackById(packId);
        if (!packData) {
          throw new Error('Pack not found');
        }
        setPack(packData);

        // 購入履歴に記録
        markAsPurchased(packId);
        console.log(`[TemplateStoreSuccess] Marked ${packId} as purchased`);
      } catch (error) {
        console.error('[TemplateStoreSuccess] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    processPurchase();
  }, [packId, navigate]);

  const handleDownloadPack = async () => {
    if (!pack || !sessionId) {
      alert(t('templateStore.downloadError'));
      return;
    }

    try {
      setDownloading(true);
      console.log('[TemplateStoreSuccess] Downloading pack:', pack.id);

      await downloadPurchasedPack(pack.id, sessionId);

      alert(t('templateStore.purchaseSuccess.downloadComplete', {
        packName: pack.name[language]
      }));

      navigate('/');
    } catch (error) {
      console.error('[TemplateStoreSuccess] Download failed:', error);
      alert(t('templateStore.downloadError'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-procreate-bg flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen bg-procreate-bg flex items-center justify-center">
        <div className="text-white">パック情報が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-procreate-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-procreate-card rounded-lg shadow-xl p-8 border border-gray-700">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          {t('templateStore.purchaseSuccess.title')}
        </h1>

        {/* Pack Name */}
        <p className="text-gray-300 text-center mb-6">
          {t('templateStore.purchaseSuccess.message', { packName: pack.name[language] })}
        </p>

        {/* Instructions */}
        <div className="bg-procreate-bg rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm mb-4">
            {t('templateStore.purchaseSuccess.downloadInstructions')}
          </p>
          <p className="text-yellow-400 text-xs">
            {t('templateStore.purchaseSuccess.backupReminder')}
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadPack}
            disabled={downloading}
            className="w-full bg-procreate-accent text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t('templateStore.downloading')}
              </span>
            ) : (
              t('templateStore.purchaseSuccess.downloadButton')
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-500 transition-all"
          >
            {t('templateStore.purchaseSuccess.importButton')}
          </button>

          <button
            onClick={() => navigate('/templates')}
            className="w-full bg-transparent border border-gray-600 text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-700 transition-all"
          >
            ストアに戻る
          </button>
        </div>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};
