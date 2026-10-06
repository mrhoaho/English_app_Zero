import React, { useState } from 'react';
import { UnitData, ReadingStory } from '../../types';
import { speakEnglish, sfx } from '../../utils/audioUtils';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Star,
  Award
} from 'lucide-react';

interface ReadingTabProps {
  unit: UnitData;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
}

export const ReadingTab: React.FC<ReadingTabProps> = ({ unit, onAwardPoints }) => {
  const story: ReadingStory = unit.reading;
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState<{ [key: string]: boolean }>({});
  const [correctCount, setCorrectCount] = useState(0);

  const handleReadPassage = () => {
    speakEnglish(story.passageEn, 0.85);
  };

  const handleAnswer = (qId: string, optIdx: number, correctIdx: number) => {
    if (submitted[qId]) return;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setSubmitted((prev) => ({ ...prev, [qId]: true }));

    if (optIdx === correctIdx) {
      sfx.playCorrect();
      setCorrectCount((prev) => prev + 1);
      onAwardPoints(25, 3, `reading_${qId}`);
    } else {
      sfx.playWrong();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Reading Passage Container */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                Đọc hiểu đoạn văn SGK Lớp 1
              </span>
              <h3 className="text-xl md:text-2xl font-black font-['Fredoka',sans-serif] text-blue-950">
                {story.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showTranslation ? 'Ẩn bản dịch' : 'Bản dịch Tiếng Việt'}</span>
            </button>

            <button
              onClick={handleReadPassage}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Nghe Zero đọc toàn bộ bài"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe bài đọc</span>
            </button>
          </div>
        </div>

        {/* English Passage Content */}
        <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl border border-blue-100 leading-relaxed space-y-3">
          <p className="text-base md:text-lg font-medium text-slate-800">
            {story.passageEn}
          </p>

          {/* Optional translation */}
          {showTranslation && (
            <div className="pt-3 border-t border-blue-200/60 text-xs md:text-sm text-blue-900 bg-white/70 p-3.5 rounded-xl italic animate-fade-in">
              <span className="font-bold not-italic block mb-1">Dịch nghĩa:</span>
              {story.passageVi}
            </div>
          )}
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-base md:text-lg font-extrabold text-blue-950 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>Câu hỏi kiểm tra đọc hiểu ({story.questions.length} câu)</span>
          </h4>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            Đúng: {correctCount}/{story.questions.length}
          </span>
        </div>

        <div className="grid gap-4">
          {story.questions.map((q, idx) => {
            const hasSubmitted = submitted[q.id];
            const userChoice = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 border border-blue-200 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="font-bold text-sm md:text-base text-blue-950">
                    {q.question}
                  </div>
                </div>

                {/* Multiple choices */}
                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isCorrect = optIdx === q.correctIndex;

                    let btnStyle =
                      'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50';

                    if (hasSubmitted) {
                      if (isCorrect) {
                        btnStyle =
                          'bg-emerald-600 border-emerald-600 text-white font-black shadow-xs';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 border-rose-500 text-white font-bold';
                      } else {
                        btnStyle = 'opacity-40 bg-slate-100 border-slate-200 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={hasSubmitted}
                        onClick={() => handleAnswer(q.id, optIdx, q.correctIndex)}
                        className={`p-3.5 rounded-2xl border-2 text-left text-xs md:text-sm font-semibold transition flex items-center justify-between gap-2 ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {hasSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
                        )}
                        {hasSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 flex-shrink-0 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback explanation */}
                {hasSubmitted && (
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs md:text-sm text-blue-900 flex items-start gap-2 animate-fade-in">
                    <span className="text-base flex-shrink-0">⚽</span>
                    <div>
                      <strong>Ghi chú: </strong>
                      <span>{q.explanation}</span>
                    </div>
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
