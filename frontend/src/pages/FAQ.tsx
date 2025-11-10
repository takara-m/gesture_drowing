import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { AdBanner } from '../components/ads';

interface FAQProps {
  onBack: () => void;
}

const FAQ: React.FC<FAQProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

  const toggleQuestion = (questionKey: string) => {
    setExpandedQuestion(expandedQuestion === questionKey ? null : questionKey);
  };

  return (
    <div className="min-h-screen bg-procreate-bg p-6">
      {/* ロゴセクション（最上部・中央寄せ・レスポンシブ） */}
      <div className="flex justify-center mb-6">
        <AnimatedLogo />
      </div>

      {/* バナー広告（ロゴ下） */}
      <AdBanner slot="1234567890" format="auto" responsive={true} />

      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-procreate-card rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-procreate-card text-white rounded-xl hover:bg-procreate-hover border-2 border-procreate-accent shadow-lg mb-4 transition-all hover:scale-105 hover:shadow-xl"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold text-lg">{t('faq.backToApp')}</span>
          </button>
          <h1 className="text-3xl font-bold text-white">
            {t('faq.title')}
          </h1>
        </div>

        {/* 質問リスト */}
        <div className="space-y-4">
          {questions.map((questionKey) => {
            const isExpanded = expandedQuestion === questionKey;
            return (
              <div
                key={questionKey}
                className="bg-procreate-card rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                {/* 質問ヘッダー */}
                <button
                  onClick={() => toggleQuestion(questionKey)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-procreate-tag transition-colors"
                >
                  <span className="font-semibold text-white text-lg pr-4">
                    {t(`faq.questions.${questionKey}.question`)}
                  </span>
                  <ChevronDown
                    size={24}
                    className={`flex-shrink-0 text-procreate-accent transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* 回答コンテンツ */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-600">
                    {t(`faq.questions.${questionKey}.answer`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* フッター（コピーライト表記） */}
        <footer className="mt-12 pb-6 text-center">
          <p className="text-sm text-gray-400">
            © 2025 あんにゅい. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FAQ;
