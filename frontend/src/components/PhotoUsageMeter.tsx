import { useLanguage } from '../contexts/LanguageContext';

interface PhotoUsageMeterProps {
  currentCount: number;
  maxCount: number;
  compact?: boolean;
  className?: string;
}

export const PhotoUsageMeter: React.FC<PhotoUsageMeterProps> = ({
  currentCount,
  maxCount,
  compact = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const percentage = Math.min((currentCount / maxCount) * 100, 100);
  const remaining = maxCount - currentCount;

  // Color coding:
  // Green/Procreate: 0-70% (0-700 photos)
  // Yellow: 70-90% (700-900 photos)
  // Red: 90-100% (900-1000 photos)
  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-procreate-accent'; // Default procreate accent color
  };

  return (
    <div className={className}>
      {/* Count display */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-white text-sm font-medium drop-shadow-md">
          {t('photoManager.photoUsage.title')}
        </span>
        <span className="text-white text-sm drop-shadow-md">
          {currentCount} / {maxCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-procreate-bg rounded-full h-3 shadow-md">
        <div
          className={`${getBarColor()} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Warning message when near limit (90%+) */}
      {percentage >= 90 && (
        <p className="text-yellow-300 text-xs mt-2 drop-shadow-md">
          ⚠ {t('photoManager.photoUsage.warning', { remaining })}
        </p>
      )}

      {/* Info text showing percentage (optional, hidden on compact mode) */}
      {!compact && percentage > 0 && (
        <p className="text-gray-300 text-xs mt-1 text-right drop-shadow-md">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};
