import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            {t('faq.backToApp')}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
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
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                {/* 質問ヘッダー */}
                <button
                  onClick={() => toggleQuestion(questionKey)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 text-lg pr-4">
                    {t(`faq.questions.${questionKey}.question`)}
                  </span>
                  <ChevronDown
                    size={24}
                    className={`flex-shrink-0 text-purple-600 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* 回答コンテンツ */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100">
                    {t(`faq.questions.${questionKey}.answer`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
