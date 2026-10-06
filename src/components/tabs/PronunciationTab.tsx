import React, { useState, useRef, useMemo } from 'react';
import { UnitData, PhonicsExercise, VocabularyWord } from '../../types';
import { speakEnglish, startSpeechRecognition, SpeechAssessmentResult, sfx } from '../../utils/audioUtils';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCw,
  Award,
  ChevronRight,
  ChevronLeft,
  Layers,
  BookOpen,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';

interface PronunciationTabProps {
  unit: UnitData;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
}

export interface UnifiedPronounceItem {
  id: string;
  category: 'phonics' | 'vocab' | 'sentence';
  badge: string;
  badgeColor: string;
  displayTitle: string;
  phonetic?: string;
  targetToSpeak: string; // The primary target string evaluated in speech
  alternativeSentence?: string; // Optional sentence if child wants to pronounce full sentence
  translation: string;
  tip: string;
}

export const PronunciationTab: React.FC<PronunciationTabProps> = ({
  unit,
  onAwardPoints,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'phonics' | 'vocab' | 'sentence'>('all');
  const [slowAudio, setSlowAudio] = useState(false);
  const [practiceSentenceMode, setPracticeSentenceMode] = useState(false);

  // Speech assessment state
  const [isRecording, setIsRecording] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<SpeechAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // 1. Build list of Phonics items
  const phonicsItems: UnifiedPronounceItem[] = useMemo(() => {
    return unit.phonics.map((p) => ({
      id: `ph_${p.id}`,
      category: 'phonics',
      badge: `Âm /${p.letterSound}/`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      displayTitle: p.word,
      phonetic: p.phonetic,
      targetToSpeak: p.word,
      alternativeSentence: p.sentence,
      translation: p.translation,
      tip: p.tip,
    }));
  }, [unit]);

  // 2. Build list of ALL Vocabulary Words (core + extended)
  const vocabItems: UnifiedPronounceItem[] = useMemo(() => {
    const allWords: VocabularyWord[] = [...unit.coreVocab, ...unit.extendedVocab];
    return allWords.map((w) => ({
      id: `voc_${w.id}`,
      category: 'vocab',
      badge: w.isExtended ? 'Từ mở rộng' : 'Từ trọng tâm',
      badgeColor: w.isExtended ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      displayTitle: w.word,
      phonetic: w.phonetic,
      targetToSpeak: w.word,
      alternativeSentence: w.exampleEn,
      translation: `${w.meaningVi} (Ví dụ: ${w.exampleVi})`,
      tip: `Từ loại: ${w.partOfSpeech}. Nhấn đúng trọng âm của từ "${w.word}".`,
    }));
  }, [unit]);

  // 3. Build list of Full Conversational Sentences from grammar, reading passage, phonics & vocab examples
  const sentenceItems: UnifiedPronounceItem[] = useMemo(() => {
    const list: UnifiedPronounceItem[] = [];

    // Sentences from grammar points
    unit.grammar.forEach((g, gIdx) => {
      g.examples.forEach((ex, exIdx) => {
        // Question
        list.push({
          id: `sent_g_${gIdx}_${exIdx}_q`,
          category: 'sentence',
          badge: 'Câu hỏi mẫu',
          badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
          displayTitle: ex.q,
          targetToSpeak: ex.q,
          translation: `Dịch nghĩa: ${ex.meaning.split('-')[0]?.trim() || ex.meaning}`,
          tip: `Chú ý ngữ điệu của câu hỏi "${ex.q}". Lên giọng hoặc hạ giọng tự nhiên theo mẫu.`,
        });
        // Answer
        list.push({
          id: `sent_g_${gIdx}_${exIdx}_a`,
          category: 'sentence',
          badge: 'Câu trả lời',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          displayTitle: ex.a,
          targetToSpeak: ex.a,
          translation: `Dịch nghĩa: ${ex.meaning.split('-')[1]?.trim() || ex.meaning}`,
          tip: `Đọc to rõ ràng câu đáp "${ex.a}", phát âm chuẩn từng âm cuối.`,
        });
      });
    });

    // Sentences from phonics example sentences (full sentence practice)
    unit.phonics.forEach((p, pIdx) => {
      list.push({
        id: `sent_ph_${pIdx}`,
        category: 'sentence',
        badge: `Câu Phonics /${p.letterSound}/`,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        displayTitle: p.sentence,
        targetToSpeak: p.sentence,
        translation: p.translation,
        tip: `Tập trung phát âm âm /${p.letterSound}/ trong từ "${p.word}" khi đọc câu này.`,
      });
    });

    // Example sentences from core vocabulary words
    unit.coreVocab.forEach((w, wIdx) => {
      if (w.exampleEn && w.exampleEn.split(' ').length >= 3) {
        list.push({
          id: `sent_vex_${wIdx}`,
          category: 'sentence',
          badge: 'Câu ví dụ từ vựng',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          displayTitle: w.exampleEn,
          targetToSpeak: w.exampleEn,
          translation: `${w.exampleVi} (từ: ${w.word})`,
          tip: `Chú ý phát âm từ "${w.word}" ${w.phonetic} trong câu ví dụ này.`,
        });
      }
    });

    // Sentences from reading passage — split by period/dash delimiter
    if (unit.reading?.passageEn) {
      const rawSentences = unit.reading.passageEn
        .replace(/---/g, '.')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10 && s.split(' ').length >= 4);

      const passageViSentences = unit.reading.passageVi
        .replace(/---/g, '.')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      rawSentences.forEach((sentence, sIdx) => {
        list.push({
          id: `sent_read_${sIdx}`,
          category: 'sentence',
          badge: '📖 Câu Đọc Hiểu',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
          displayTitle: sentence,
          targetToSpeak: sentence,
          translation: passageViSentences[sIdx] || `Câu ${sIdx + 1} bài đọc "${unit.reading.title}"`,
          tip: `Đọc cả câu mạch lạc, liên kết các từ tự nhiên. Chú ý nhấn trọng âm vào từ quan trọng.`,
        });
      });
    }

    return list;
  }, [unit]);

  // Combined master list
  const masterList: UnifiedPronounceItem[] = useMemo(() => {
    return [...phonicsItems, ...vocabItems, ...sentenceItems];
  }, [phonicsItems, vocabItems, sentenceItems]);

  // Filtered list
  const filteredList = useMemo(() => {
    if (filterCategory === 'phonics') return phonicsItems;
    if (filterCategory === 'vocab') return vocabItems;
    if (filterCategory === 'sentence') return sentenceItems;
    return masterList;
  }, [filterCategory, masterList, phonicsItems, vocabItems, sentenceItems]);

  // Selected item index
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentItem = filteredList[selectedIdx % filteredList.length] || masterList[0];

  // The active string we want the child to say
  const activeTargetString =
    practiceSentenceMode && currentItem.alternativeSentence
      ? currentItem.alternativeSentence
      : currentItem.targetToSpeak;

  const handlePlayAudio = (text: string) => {
    speakEnglish(text, slowAudio ? 0.65 : 0.88);
  };

  const handleSelectItem = (index: number) => {
    setSelectedIdx(index);
    setAssessmentResult(null);
    setErrorMessage(null);
    setPracticeSentenceMode(false);
    sfx.playStar();
  };

  const handleNextItem = () => {
    const next = (selectedIdx + 1) % filteredList.length;
    setSelectedIdx(next);
    setAssessmentResult(null);
    setErrorMessage(null);
    setPracticeSentenceMode(false);
  };

  const handlePrevItem = () => {
    const prev = (selectedIdx - 1 + filteredList.length) % filteredList.length;
    setSelectedIdx(prev);
    setAssessmentResult(null);
    setErrorMessage(null);
    setPracticeSentenceMode(false);
  };

  const handleStartSpeaking = () => {
    setErrorMessage(null);
    setAssessmentResult(null);
    setIsRecording(true);

    const rec = startSpeechRecognition(
      activeTargetString,
      (result) => {
        setIsRecording(false);
        setAssessmentResult(result);
        if (result.passed) {
          sfx.playCorrect();
          const starsEarned = result.score >= 85 ? 3 : 2;
          onAwardPoints(30, starsEarned, `pronounce_${currentItem.id}`);

          if (result.score >= 85) {
            confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
          }
        } else {
          sfx.playWrong();
        }
      },
      (err) => {
        setIsRecording(false);
        setErrorMessage(err);
      }
    );

    recognitionRef.current = rec;
  };

  const handleStopSpeaking = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Phonics Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-sky-700 to-cyan-800 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-200 bg-white/20 px-3 py-1 rounded-full inline-block mb-2">
              Phòng Luyện Phát Âm &amp; Giọng Đọc Chuẩn Anh
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-['Fredoka',sans-serif]">
              Luyện Giọng Chuẩn Cùng Zero ({unit.title})
            </h2>
            <p className="text-xs md:text-sm text-blue-200 mt-1">
              Kho phát âm đa dạng với <strong>{masterList.length} mục luyện</strong>: Âm Phonics, Từ vựng, Câu hội thoại &amp; <strong>Câu bài đọc</strong> — chấm điểm giọng đọc trực tiếp!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-900/60 p-2 rounded-2xl border border-blue-500/40">
            <span className="text-xs font-bold text-blue-200 pl-2">Tốc độ đọc mẫu:</span>
            <button
              onClick={() => setSlowAudio(false)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                !slowAudio ? 'bg-amber-400 text-blue-950 shadow-xs' : 'text-blue-300 hover:text-white'
              }`}
            >
              Chuẩn 1x
            </button>
            <button
              onClick={() => setSlowAudio(true)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                slowAudio ? 'bg-amber-400 text-blue-950 shadow-xs' : 'text-blue-300 hover:text-white'
              }`}
            >
              Chậm 0.65x 🐢
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-extrabold text-slate-700">Bộ lọc danh mục luyện nói:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setFilterCategory('all');
              setSelectedIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCategory === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Tất cả ({masterList.length})
          </button>
          <button
            onClick={() => {
              setFilterCategory('phonics');
              setSelectedIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCategory === 'phonics'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            🔤 Âm vị Phonics ({phonicsItems.length})
          </button>
          <button
            onClick={() => {
              setFilterCategory('vocab');
              setSelectedIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCategory === 'vocab'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            📚 Toàn bộ Từ vựng ({vocabItems.length} từ)
          </button>
          <button
            onClick={() => {
              setFilterCategory('sentence');
              setSelectedIdx(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterCategory === 'sentence'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            💬 Câu hội thoại ({sentenceItems.length} câu)
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of Pronunciation Items */}
      <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500">
            Chọn từ hoặc câu bé muốn luyện phát âm ({filteredList.length} mục):
          </span>
          <span className="text-xs font-bold text-blue-700">
            Đang chọn: <strong>{(selectedIdx % filteredList.length) + 1} / {filteredList.length}</strong>
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {filteredList.map((item, idx) => {
            const isSelected = (selectedIdx % filteredList.length) === idx;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectItem(idx)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-2xl border-2 transition text-left flex items-center gap-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-700 text-white shadow-md'
                    : 'border-blue-100 bg-blue-50/40 hover:bg-blue-100/60 text-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-700 shadow-2xs'
                  }`}
                >
                  {item.category === 'sentence'
                    ? (item.id.startsWith('sent_read') ? '📖' : item.id.startsWith('sent_ph') ? '🔤' : '💬')
                    : item.category === 'phonics' ? '🔤' : '📚'}
                </div>
                <div>
                  <div className={`text-xs font-bold truncate max-w-[130px] ${isSelected ? 'text-white' : 'text-blue-950'}`}>
                    {item.displayTitle}
                  </div>
                  <div className={`text-[10px] truncate max-w-[130px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {item.phonetic || item.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN PRONUNCIATION STUDIO CARD */}
      {currentItem && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-lg space-y-6 text-center">
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full font-black border ${currentItem.badgeColor}`}>
              {currentItem.badge}
            </span>

            {/* If has alternative sentence mode */}
            {currentItem.alternativeSentence && (
              <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setPracticeSentenceMode(false);
                    setAssessmentResult(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    !practiceSentenceMode ? 'bg-blue-700 text-white shadow-2xs' : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Đọc từ đơn
                </button>
                <button
                  onClick={() => {
                    setPracticeSentenceMode(true);
                    setAssessmentResult(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    practiceSentenceMode ? 'bg-blue-700 text-white shadow-2xs' : 'text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Đọc cả câu ví dụ
                </button>
              </div>
            )}
          </div>

          {/* Primary Target Display Box */}
          <div className="bg-blue-50/80 p-6 rounded-3xl border border-blue-100 space-y-3">
            <h3 className="text-2xl md:text-4xl font-black text-blue-950 font-['Fredoka',sans-serif] tracking-wide leading-tight">
              &quot;{activeTargetString}&quot;
            </h3>

            {currentItem.phonetic && !practiceSentenceMode && (
              <p className="text-base font-mono text-blue-700 font-extrabold">
                {currentItem.phonetic}
              </p>
            )}

            <p className="text-xs md:text-sm text-slate-600 font-medium">
              👉 {currentItem.translation}
            </p>

            {/* Audio Button */}
            <div className="pt-1">
              <button
                onClick={() => handlePlayAudio(activeTargetString)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md transition"
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>Nghe đọc mẫu ({slowAudio ? 'Chậm 0.65x' : 'Chuẩn 1x'})</span>
              </button>
            </div>
          </div>

          {/* Pronunciation Tip from Zero */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 text-left">
            <span className="text-xl flex-shrink-0">⚽</span>
            <div>
              <strong className="text-amber-900 block mb-0.5">Mẹo phát âm của Zero:</strong>
              <span>{currentItem.tip}</span>
            </div>
          </div>

          {/* Microphone Action Center */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartSpeaking}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white flex items-center justify-center shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-blue-200 group"
                  title="Bấm và nói vào micro"
                >
                  <Mic className="w-9 h-9 group-hover:animate-pulse" />
                </button>
              ) : (
                <button
                  onClick={handleStopSpeaking}
                  className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl animate-pulse border-4 border-rose-200"
                  title="Đang lắng nghe... Bấm để dừng"
                >
                  <MicOff className="w-9 h-9" />
                </button>
              )}

              <div className="text-xs font-bold text-slate-600">
                {isRecording ? (
                  <span className="text-rose-600 animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Zero đang lắng nghe... Hãy nói to: &quot;{activeTargetString}&quot;
                  </span>
                ) : (
                  <span>Bấm nút Micro và đọc to: <strong>&quot;{activeTargetString}&quot;</strong></span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium max-w-md mx-auto">
                {errorMessage}
              </div>
            )}

            {/* Speech Assessment Result Box */}
            {assessmentResult && (
              <div className="bg-blue-50 rounded-3xl p-5 border-2 border-blue-200 text-center space-y-3 animate-pop-in max-w-md mx-auto">
                {/* Stars rating */}
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3].map((starIdx) => {
                    const filled =
                      assessmentResult.score >= 85
                        ? true
                        : assessmentResult.score >= 55
                        ? starIdx <= 2
                        : starIdx <= 1;

                    return (
                      <Star
                        key={starIdx}
                        className={`w-7 h-7 transition-all ${
                          filled
                            ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow'
                            : 'text-slate-300'
                        }`}
                      />
                    );
                  })}
                </div>

                <div>
                  <div className="text-2xl font-black text-blue-950 font-['Fredoka',sans-serif]">
                    Điểm phát âm: {assessmentResult.score}/100
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero nghe được bé nói: &quot;<strong className="text-blue-900">{assessmentResult.recognizedText}</strong>&quot;
                  </p>
                </div>

                {/* Word-by-Word Visual Analysis Highlight */}
                <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block text-left">
                    🔍 Phân tích chi tiết từng từ:
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {activeTargetString.split(/\s+/).map((rawWord, wIdx) => {
                      const cleanWord = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const cleanSpoken = assessmentResult.recognizedText.toLowerCase();
                      const isMatched = cleanSpoken.includes(cleanWord);

                      return (
                        <span
                          key={wIdx}
                          className={`px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-1 shadow-2xs ${
                            isMatched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isMatched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          <span>{rawWord}</span>
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đọc chuẩn
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Cần đọc rõ hơn
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-blue-100 text-xs md:text-sm font-bold text-blue-900">
                  {assessmentResult.feedback}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-100">
              <button
                onClick={handlePrevItem}
                className="px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-800 font-bold text-xs transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Mục trước</span>
              </button>

              <button
                onClick={handleStartSpeaking}
                className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs transition flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Nói lại</span>
              </button>

              <button
                onClick={handleNextItem}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow transition flex items-center gap-1"
              >
                <span>Mục tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
