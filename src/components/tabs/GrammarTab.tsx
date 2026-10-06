import React, { useState } from 'react';
import { UnitData, GrammarPoint } from '../../types';
import { speakEnglish, sfx } from '../../utils/audioUtils';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookMarked,
  HelpCircle,
  Puzzle,
  Bug,
  RotateCw,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface GrammarTabProps {
  unit: UnitData;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
}

// Pre-defined unit common grammatical errors for Error Buster
const UNIT_ERROR_CHALLENGES: {
  [unitId: number]: {
    sentence: string;
    words: string[];
    wrongIndex: number;
    correctWord: string;
    explanation: string;
  };
} = {
  0: {
    sentence: 'My name are Tim.',
    words: ['My', 'name', 'are', 'Tim.'],
    wrongIndex: 2,
    correctWord: 'is',
    explanation: 'Với "My name" ta dùng "is" (My name is Tim), viết gọn là "My name\'s Tim".',
  },
  1: {
    sentence: "What's this? It a pen.",
    words: ["What's", 'this?', 'It', 'a', 'pen.'],
    wrongIndex: 2,
    correctWord: "It's",
    explanation: 'Câu trả lời phải là "It\'s a pen." (It\'s = It is). Thiếu "is" thì câu chưa đúng nhé!',
  },
  2: {
    sentence: "Is this you teddy?",
    words: ["Is", "this", "you", "teddy?"],
    wrongIndex: 2,
    correctWord: "your",
    explanation: "Hỏi đồ của bạn thì dùng \"your\" (của bạn), không dùng \"you\". Câu đúng: Is this your teddy?",
  },
  3: {
    sentence: "These is my arms.",
    words: ["These", "is", "my", "arms."],
    wrongIndex: 1,
    correctWord: "are",
    explanation: "\"These\" là số nhiều nên đi với \"are\": These are my arms.",
  },
  4: {
    sentence: "Is he a teacher? Yes, he are.",
    words: ["Is", "he", "a", "teacher?", "Yes,", "he", "are."],
    wrongIndex: 6,
    correctWord: "is",
    explanation: "Với \"he\" câu trả lời đúng là \"Yes, he is.\" chứ không phải \"he are\".",
  },
  5: {
    sentence: "It's at the net.",
    words: ["It's", "at", "the", "net."],
    wrongIndex: 1,
    correctWord: "in",
    explanation: "Quả bóng nằm trong lưới nên dùng \"in\": It's in the net.",
  },
  6: {
    sentence: "This is Mum book.",
    words: ["This", "is", "Mum", "book."],
    wrongIndex: 2,
    correctWord: "Mum's",
    explanation: "Đồ vật của mẹ phải thêm 's: This is Mum's book.",
  },
  7: {
    sentence: "Are these his shorts? Yes, they is.",
    words: ["Are", "these", "his", "shorts?", "Yes,", "they", "is."],
    wrongIndex: 6,
    correctWord: "are",
    explanation: "Với \"they\" dùng \"are\": Yes, they are.",
  },
  8: {
    sentence: "Is she in the kitchen? No, she aren't.",
    words: ["Is", "she", "in", "the", "kitchen?", "No,", "she", "aren't."],
    wrongIndex: 7,
    correctWord: "isn't",
    explanation: "Với \"she\" dùng \"isn't\": No, she isn't.",
  },
  9: {
    sentence: "I've got a apple.",
    words: ["I've", "got", "a", "apple."],
    wrongIndex: 2,
    correctWord: "an",
    explanation: "Trước từ bắt đầu bằng nguyên âm (apple) dùng \"an\": I've got an apple.",
  },
  10: {
    sentence: "She haven't got brown eyes.",
    words: ["She", "haven't", "got", "brown", "eyes."],
    wrongIndex: 1,
    correctWord: "hasn't",
    explanation: "Với \"she\" dùng \"hasn't\": She hasn't got brown eyes.",
  },
  11: {
    sentence: "I don't likes elephants.",
    words: ["I", "don't", "likes", "elephants."],
    wrongIndex: 2,
    correctWord: "like",
    explanation: "Sau \"don't\" động từ giữ nguyên: I don't like elephants.",
  },
  12: {
    sentence: "Do you likes yogurt?",
    words: ["Do", "you", "likes", "yogurt?"],
    wrongIndex: 2,
    correctWord: "like",
    explanation: "Sau \"Do you\" động từ giữ nguyên: Do you like yogurt?",
  },
  13: {
    sentence: "There is three books under the bed.",
    words: ["There", "is", "three", "books", "under", "the", "bed."],
    wrongIndex: 1,
    correctWord: "are",
    explanation: "Có ba quyển sách (số nhiều) nên dùng \"There are\": There are three books under the bed.",
  },
  14: {
    sentence: "He can flies.",
    words: ["He", "can", "flies."],
    wrongIndex: 2,
    correctWord: "fly",
    explanation: "Sau \"can\" động từ giữ nguyên: He can fly.",
  },
  15: {
    sentence: "Let's plays ball!",
    words: ["Let's", "plays", "ball!"],
    wrongIndex: 1,
    correctWord: "play",
    explanation: "Sau \"Let's\" dùng động từ nguyên mẫu: Let's play ball!",
  },
};

export const GrammarTab: React.FC<GrammarTabProps> = ({ unit, onAwardPoints }) => {
  const [activePracticeMode, setActivePracticeMode] = useState<'sentence_builder' | 'error_buster'>('sentence_builder');

  // Sentence Builder State
  const sentenceExamples = unit.grammar.flatMap((g) =>
    g.examples.map((ex) => ({
      sentence: `${ex.q} ${ex.a}`,
      meaning: ex.meaning,
    }))
  );

  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const currentSentenceItem = sentenceExamples[currentSentenceIdx % sentenceExamples.length] || {
    sentence: "I'm from Viet Nam.",
    meaning: 'Mình đến từ Việt Nam.',
  };

  const targetSentenceWords = currentSentenceItem.sentence.split(/\s+/).filter(Boolean);

  const [scrambledWords, setScrambledWords] = useState<string[]>(() =>
    [...targetSentenceWords].sort(() => Math.random() - 0.5)
  );
  const [userBuiltWords, setUserBuiltWords] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Error Buster State
  const errorChallenge = UNIT_ERROR_CHALLENGES[unit.id] || UNIT_ERROR_CHALLENGES[1];
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [isBugFixed, setIsBugFixed] = useState(false);

  const handleSpeak = (text: string) => {
    speakEnglish(text, 0.85);
  };

  // Reset Sentence Builder when moving to next sentence
  const loadSentence = (idx: number) => {
    setCurrentSentenceIdx(idx);
    const item = sentenceExamples[idx % sentenceExamples.length];
    const words = item.sentence.split(/\s+/).filter(Boolean);
    setScrambledWords([...words].sort(() => Math.random() - 0.5));
    setUserBuiltWords([]);
    setBuilderStatus('idle');
  };

  // Click word in scrambled bank
  const handlePickBuilderWord = (word: string, index: number) => {
    if (builderStatus === 'correct') return;
    sfx.playStar();

    const newBuilt = [...userBuiltWords, word];
    setUserBuiltWords(newBuilt);

    const newScrambled = [...scrambledWords];
    newScrambled.splice(index, 1);
    setScrambledWords(newScrambled);

    if (newBuilt.length === targetSentenceWords.length) {
      if (newBuilt.join(' ') === targetSentenceWords.join(' ')) {
        setBuilderStatus('correct');
        sfx.playCorrect();
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
        onAwardPoints(25, 3, `grammar_builder_${unit.id}_${currentSentenceIdx}`);
      } else {
        setBuilderStatus('wrong');
        sfx.playWrong();
      }
    }
  };

  // Undo word in builder
  const handleRemoveBuilderWord = (index: number) => {
    if (builderStatus === 'correct') return;
    const removed = userBuiltWords[index];
    const newBuilt = [...userBuiltWords];
    newBuilt.splice(index, 1);
    setUserBuiltWords(newBuilt);
    setScrambledWords((prev) => [...prev, removed]);
    setBuilderStatus('idle');
  };

  const handleResetBuilder = () => {
    loadSentence(currentSentenceIdx);
  };

  const handleNextBuilderSentence = () => {
    loadSentence(currentSentenceIdx + 1);
  };

  // Error Buster Word Click
  const handleSelectErrorWord = (wordIdx: number) => {
    if (isBugFixed) return;
    setSelectedWordIdx(wordIdx);

    if (wordIdx === errorChallenge.wrongIndex) {
      setIsBugFixed(true);
      sfx.playCorrect();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onAwardPoints(30, 3, `grammar_error_buster_${unit.id}`);
    } else {
      sfx.playWrong();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Unit Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-4 bottom-2 text-7xl opacity-20 pointer-events-none select-none">
          {unit.icon}
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-extrabold uppercase mb-2">
            <BookMarked className="w-3.5 h-3.5" />
            ÔN TẬP KIẾN THỨC TRỌNG TÂM
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-['Fredoka',sans-serif] text-blue-50">
            {unit.title}
          </h2>
          <p className="text-sm md:text-base text-blue-200 mt-1 font-medium">
            {unit.subtitleVi}
          </p>
        </div>
      </div>

      {/* Grammar Cards List */}
      <div className="grid gap-6">
        {unit.grammar.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-blue-100 space-y-4 hover:border-blue-300 transition"
          >
            {/* Grammar Title & Pattern */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-sm shadow-xs">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-blue-950 font-['Fredoka',sans-serif]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{item.explanation}</p>
                </div>
              </div>
            </div>

            {/* Pattern Formula Box */}
            <div className="bg-blue-50 rounded-2xl p-4 border-l-4 border-blue-600">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                Cấu trúc mẫu câu (Sentence Pattern)
              </div>
              <div className="text-sm md:text-base font-extrabold text-blue-950 font-mono">
                {item.pattern}
              </div>
            </div>

            {/* Interactive Bilingual Examples */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <span>Ví dụ mẫu trong sách (Bấm loa để nghe giọng đọc chuẩn):</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {item.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-300 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                          <span>Q: {ex.q}</span>
                        </div>
                        <div className="text-sm font-extrabold text-cyan-700">
                          A: {ex.a}
                        </div>
                        <div className="text-xs text-slate-500 italic pt-0.5">
                          👉 {ex.meaning}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSpeak(`${ex.q}. ${ex.a}`)}
                        className="p-2 rounded-xl bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white transition flex-shrink-0"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero's Memory Tip */}
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs md:text-sm text-amber-900 flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0">⚽</span>
              <div>
                <span className="font-extrabold text-amber-800">Mẹo ghi nhớ của Zero Mbappe: </span>
                <span className="text-amber-950">{item.zeraTip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE PRACTICE CORNER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg md:text-xl font-black font-['Fredoka',sans-serif] text-blue-950">
                Góc Luyện Tập Ngữ Pháp Tương Tác
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rèn luyện cấu trúc ngữ pháp qua các thử thách sắp xếp câu và bắt lỗi sai
            </p>
          </div>

          {/* Sub-mode selector */}
          <div className="flex items-center gap-2 bg-blue-50 p-1.5 rounded-2xl border border-blue-100">
            <button
              onClick={() => {
                setActivePracticeMode('sentence_builder');
                sfx.playStar();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activePracticeMode === 'sentence_builder'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-800 hover:bg-blue-200/50'
              }`}
            >
              <Puzzle className="w-4 h-4" />
              <span>Sắp Xếp Câu (Sentence Builder)</span>
            </button>

            <button
              onClick={() => {
                setActivePracticeMode('error_buster');
                sfx.playStar();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                activePracticeMode === 'error_buster'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-800 hover:bg-blue-200/50'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Bắt Sâu Ngữ Pháp</span>
            </button>
          </div>
        </div>

        {/* PRACTICE 1: Sentence Builder */}
        {activePracticeMode === 'sentence_builder' && (
          <div className="space-y-5 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Câu {(currentSentenceIdx % sentenceExamples.length) + 1} / {sentenceExamples.length}
              </span>
              <button
                onClick={() => handleSpeak(currentSentenceItem.sentence)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bấm nghe giọng mẫu</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
              👉 Dịch nghĩa: <strong className="text-amber-950 font-bold">{currentSentenceItem.meaning}</strong>
            </div>

            {/* Sentence Drop Zone (User words) */}
            <div className="min-h-[64px] bg-blue-50/60 p-3.5 rounded-2xl border-2 border-dashed border-blue-200 flex flex-wrap items-center justify-center gap-2">
              {userBuiltWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveBuilderWord(idx)}
                  className="px-3.5 py-2 rounded-xl bg-blue-700 text-white font-extrabold text-sm shadow-xs hover:bg-rose-600 transition animate-pop-in"
                  title="Chạm vào để gỡ từ này"
                >
                  {word}
                </button>
              ))}
              {userBuiltWords.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">
                  (Bấm vào các mảnh từ vựng bên dưới để ghép thành câu đúng)
                </span>
              )}
            </div>

            {/* Result status */}
            {builderStatus === 'correct' && (
              <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-5 h-5" />
                <span>Chính xác! Bé ghép câu rất siêu! (+25 XP &amp; +3 ⭐)</span>
              </div>
            )}

            {builderStatus === 'wrong' && (
              <div className="text-sm font-bold text-rose-500 flex items-center justify-center gap-1.5">
                <XCircle className="w-5 h-5" />
                <span>Thứ tự từ chưa đúng rồi! Bé hãy bấm Thử lại hoặc chạm vào từ để gỡ nhé!</span>
              </div>
            )}

            {/* Scrambled Word Bank */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {scrambledWords.map((word, idx) => (
                <button
                  key={idx}
                  disabled={builderStatus === 'correct'}
                  onClick={() => handlePickBuilderWord(word, idx)}
                  className="px-4 py-2.5 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-950 font-extrabold text-sm shadow-xs transform hover:-translate-y-0.5 transition active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={handleResetBuilder}
                className="flex-1 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-800 font-bold text-xs transition flex items-center justify-center gap-1"
              >
                <RotateCw className="w-4 h-4" />
                <span>Làm lại</span>
              </button>

              <button
                onClick={handleNextBuilderSentence}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1 shadow"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PRACTICE 2: Error Buster */}
        {activePracticeMode === 'error_buster' && (
          <div className="space-y-6 text-center max-w-xl mx-auto">
            <div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase">
                Bắt sâu ngữ pháp (Tìm 1 từ sai)
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Trong câu dưới đây có một từ bị sai ngữ pháp. Bé hãy chạm vào từ đó để tiêu diệt sâu nhé!
              </p>
            </div>

            {/* Sentence with clickable words */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-wrap justify-center gap-2">
              {errorChallenge.words.map((w, idx) => {
                const isSelected = selectedWordIdx === idx;
                const isTheWrongOne = idx === errorChallenge.wrongIndex;

                let btnStyle = 'bg-white border-blue-200 text-blue-950 hover:border-blue-500';
                if (isSelected) {
                  if (isTheWrongOne) {
                    btnStyle = 'bg-rose-500 border-rose-600 text-white line-through font-black';
                  } else {
                    btnStyle = 'bg-slate-200 border-slate-300 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isBugFixed}
                    onClick={() => handleSelectErrorWord(idx)}
                    className={`px-3 py-2 rounded-xl border-2 font-black text-base md:text-lg transition ${btnStyle}`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {isBugFixed && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Bé đã bắt đúng từ sai! (+30 XP &amp; +3 ⭐)</span>
                </div>
                <div className="text-xs text-emerald-950">
                  <span className="font-extrabold">Từ đúng: </span>
                  <span className="text-emerald-700 font-black text-sm">&quot;{errorChallenge.correctWord}&quot;</span>
                </div>
                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-emerald-100">
                  💡 <strong>Giải thích của Zero:</strong> {errorChallenge.explanation}
                </p>
              </div>
            )}

            {selectedWordIdx !== null && selectedWordIdx !== errorChallenge.wrongIndex && (
              <div className="text-xs font-bold text-rose-500 flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4" />
                <span>Từ này đã đúng rồi, bé hãy quan sát kỹ các từ khác xem sao nhé!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
