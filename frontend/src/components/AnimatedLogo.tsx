import React from 'react';

interface AnimatedLogoProps {
  compact?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ compact = false }) => {
  const mainText = 'Gesdro!';
  const subText = 'ジェスチャードローイングアプリ';

  if (compact) {
    // Compactモード：小さく、アニメーションなし、白テキスト
    return (
      <div className="flex flex-col items-center justify-center">
        {/* メインタイトル: Gesdro! */}
        <div className="flex items-center">
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {mainText}
          </span>
        </div>

        {/* サブタイトル: ジェスチャードローイングアプリ */}
        <div className="mt-1 text-xs md:text-sm font-medium text-gray-300">
          {subText}
        </div>
      </div>
    );
  }

  // 通常モード：大きく、アニメーションあり、青グラデーション
  return (
    <div className="flex flex-col items-center justify-center">
      {/* メインタイトル: Gesdro! */}
      <div className="flex items-center">
        {mainText.split('').map((char, index) => (
          <span
            key={index}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-lg animate-write"
            style={{
              animationDelay: `${index * 0.1}s`,
              display: 'inline-block',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* サブタイトル: ジェスチャードローイングアプリ */}
      <div className="mt-2 text-sm md:text-base lg:text-lg font-medium text-white">
        {subText}
      </div>

      {/* カスタムアニメーション定義 */}
      <style>{`
        @keyframes writeIn {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          20%, 80% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .animate-write {
          animation: writeIn 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
