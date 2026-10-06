import React, { useState, useEffect } from 'react';
import { UnitData, VocabularyWord } from '../../types';
import { speakEnglish, sfx } from '../../utils/audioUtils';
import { toggleBookmarkWord, isWordBookmarked } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  RotateCw,
  CheckCircle2,
  XCircle,
  Layers,
  HelpCircle,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Star,
  Gamepad2,
  Headphones,
  Check,
  Eye,
  Trophy,
  Flame,
  Award
} from 'lucide-react';

interface VocabularyTabProps {
  unit: UnitData;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
}

interface MemoryCard {
  id: string;
  wordId: string;
  type: 'en' | 'vi';
  content: string;
  subContent?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({ unit, onAwardPoints }) => {
  const [filterType, setFilterType] = useState<'all' | 'core' | 'extended' | 'bookmarked'>('all');
  const [mode, setMode] = useState<'flashcard' | 'quiz' | 'spelling' | 'memory' | 'dictation'>('flashcard');

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slowAudio, setSlowAudio] = useState(false);

  // Bookmark sync
  const [bookmarkedIds, setBookmarkedIds] = useState<{ [id: string]: boolean }>({});

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCombo, setQuizCombo] = useState(0);

  // Spelling game state
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userSpelling, setUserSpelling] = useState<string[]>([]);
  const [isSpellingCorrect, setIsSpellingCorrect] = useState<boolean | null>(null);

  // Memory game state
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryMatches, setMemoryMatches] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  // Dictation state
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationStatus, setDictationStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showDictationHint, setShowDictationHint] = useState(false);

  const allUnitWords = [...unit.coreVocab, ...unit.extendedVocab];

  // Refresh bookmarks on mount or unit change
  useEffect(() => {
    const map: { [id: string]: boolean } = {};
    allUnitWords.forEach((w) => {
      map[w.id] = isWordBookmarked(w.id);
    });
    setBookmarkedIds(map);
  }, [unit]);

  const activeWords: VocabularyWord[] = (() => {
    if (filterType === 'core') return unit.coreVocab;
    if (filterType === 'extended') return unit.extendedVocab;
    if (filterType === 'bookmarked') {
      const bookmarked = allUnitWords.filter((w) => bookmarkedIds[w.id]);
      return bookmarked.length > 0 ? bookmarked : allUnitWords;
    }
    return allUnitWords;
  })();

  const currentFlashcard = activeWords[currentCardIndex % activeWords.length] || activeWords[0];
  const currentQuizWord = activeWords[quizIndex % activeWords.length] || activeWords[0];
  const currentSpellingWord = activeWords[spellingIndex % activeWords.length] || activeWords[0];
  const currentDictationWord = activeWords[dictationIndex % activeWords.length] || activeWords[0];

  const handleToggleBookmark = (wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = toggleBookmarkWord(wordId);
    setBookmarkedIds((prev) => ({ ...prev, [wordId]: result.isBookmarked }));
    if (result.isBookmarked) {
      sfx.playStar();
    }
  };

  // Initialize spelling scrambled letters
  const initSpelling = (wordObj: VocabularyWord) => {
    const letters = wordObj.word.toUpperCase().replace(/\s+/g, '').split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);
    setUserSpelling([]);
    setIsSpellingCorrect(null);
  };

  // Initialize Memory Game (4 pairs = 8 cards)
  const initMemoryGame = () => {
    const wordsToUse = [...activeWords].sort(() => Math.random() - 0.5).slice(0, 4);
    const cards: MemoryCard[] = [];

    wordsToUse.forEach((word, idx) => {
      // English card
      cards.push({
        id: `card_en_${word.id}_${idx}`,
        wordId: word.id,
        type: 'en',
        content: word.word,
        subContent: word.phonetic,
        isFlipped: false,
        isMatched: false,
      });
      // Vietnamese meaning card
      cards.push({
        id: `card_vi_${word.id}_${idx}`,
        wordId: word.id,
        type: 'vi',
        content: word.meaningVi,
        subContent: word.category || 'Từ vựng',
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = cards.sort(() => Math.random() - 0.5);
    setMemoryCards(shuffled);
    setSelectedCards([]);
    setMemoryMoves(0);
    setMemoryMatches(0);
    setMemoryWon(false);
  };

  // Switch modes handler
  const handleSelectMode = (newMode: typeof mode) => {
    setMode(newMode);
    sfx.playStar();
    if (newMode === 'spelling') {
      initSpelling(currentSpellingWord);
    } else if (newMode === 'memory') {
      initMemoryGame();
    } else if (newMode === 'dictation') {
      setDictationInput('');
      setDictationStatus('idle');
      setShowDictationHint(false);
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeWords.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeWords.length) % activeWords.length);
  };

  const handleSpeak = (text: string, rateMultiplier: number = 1) => {
    const speed = slowAudio ? 0.65 : 0.88 * rateMultiplier;
    speakEnglish(text, speed);
  };

  // Generate options for quiz
  const generateQuizOptions = (correctWord: VocabularyWord): VocabularyWord[] => {
    const otherWords = activeWords.filter((w) => w.id !== correctWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [correctWord, ...shuffledOthers].sort(() => Math.random() - 0.5);
    return all;
  };

  const [currentOptions, setCurrentOptions] = useState<VocabularyWord[]>(() =>
    generateQuizOptions(currentQuizWord)
  );

  const handleSelectQuiz = (selectedIdx: number, isCorrect: boolean) => {
    if (quizSelected !== null) return;
    setQuizSelected(selectedIdx);

    if (isCorrect) {
      sfx.playCorrect();
      const newScore = quizScore + 1;
      const newCombo = quizCombo + 1;
      setQuizScore(newScore);
      setQuizCombo(newCombo);

      const bonusXp = newCombo >= 3 ? 30 : 20;
      onAwardPoints(bonusXp, 2, `vocab_quiz_${currentQuizWord.id}`);

      if (newCombo % 3 === 0) {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      sfx.playWrong();
      setQuizCombo(0);
    }
  };

  const handleNextQuiz = () => {
    const nextIdx = (quizIndex + 1) % activeWords.length;
    setQuizIndex(nextIdx);
    setQuizSelected(null);
    setCurrentOptions(generateQuizOptions(activeWords[nextIdx % activeWords.length]));
  };

  // Spelling logic
  const handlePickLetter = (letter: string, index: number) => {
    if (isSpellingCorrect !== null) return;

    sfx.playStar();
    const newUserSpelling = [...userSpelling, letter];
    setUserSpelling(newUserSpelling);

    const newScrambled = [...scrambledLetters];
    newScrambled.splice(index, 1);
    setScrambledLetters(newScrambled);

    const targetClean = currentSpellingWord.word.toUpperCase().replace(/\s+/g, '');
    if (newUserSpelling.length === targetClean.length) {
      if (newUserSpelling.join('') === targetClean) {
        setIsSpellingCorrect(true);
        sfx.playCorrect();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onAwardPoints(25, 3, `vocab_spell_${currentSpellingWord.id}`);
      } else {
        setIsSpellingCorrect(false);
        sfx.playWrong();
      }
    }
  };

  const handleResetSpelling = () => {
    initSpelling(currentSpellingWord);
  };

  const handleNextSpelling = () => {
    const nextIdx = (spellingIndex + 1) % activeWords.length;
    setSpellingIndex(nextIdx);
    initSpelling(activeWords[nextIdx]);
  };

  // Memory Game Logic
  const handleCardClick = (index: number) => {
    if (selectedCards.length === 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) {
      return;
    }

    sfx.playStar();
    const newCards = [...memoryCards];
    newCards[index].isFlipped = true;
    setMemoryCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    // Speak card content if it's English
    if (newCards[index].type === 'en') {
      handleSpeak(newCards[index].content);
    }

    if (newSelected.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.wordId === secondCard.wordId && firstCard.type !== secondCard.type) {
        // MATCH!
        setTimeout(() => {
          sfx.playCorrect();
          const matchedCards = [...memoryCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setMemoryCards(matchedCards);
          setSelectedCards([]);

          const nextMatches = memoryMatches + 1;
          setMemoryMatches(nextMatches);

          if (nextMatches === 4) {
            setMemoryWon(true);
            sfx.playLevelUp();
            confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
            onAwardPoints(35, 4, `vocab_memory_win_${unit.id}`);
          }
        }, 400);
      } else {
        // NO MATCH
        setTimeout(() => {
          sfx.playWrong();
          const resetCards = [...memoryCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setMemoryCards(resetCards);
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  // Dictation logic
  const handleCheckDictation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dictationInput.trim() || dictationStatus === 'correct') return;

    const cleanInput = dictationInput.trim().toLowerCase();
    const cleanTarget = currentDictationWord.word.trim().toLowerCase();

    if (cleanInput === cleanTarget) {
      setDictationStatus('correct');
      sfx.playCorrect();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      onAwardPoints(25, 3, `vocab_dictation_${currentDictationWord.id}`);
    } else {
      setDictationStatus('wrong');
      sfx.playWrong();
    }
  };

  const handleNextDictation = () => {
    const next = (dictationIndex + 1) % activeWords.length;
    setDictationIndex(next);
    setDictationInput('');
    setDictationStatus('idle');
    setShowDictationHint(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner and Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <h2 className="text-xl font-black font-['Fredoka',sans-serif] text-blue-950">
              Luyện Từ Mới &amp; Mở Rộng ({unit.title})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            5 chế độ học tương tác: Thẻ Flashcard, Đố vui, Xếp chữ, Lật thẻ trí nhớ &amp; Nghe gõ chính tả
          </p>
        </div>

        {/* Filter selection */}
        <div className="flex items-center gap-1.5 bg-blue-50 p-1.5 rounded-2xl border border-blue-100 flex-wrap justify-center">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            Tất cả ({allUnitWords.length})
          </button>
          <button
            onClick={() => setFilterType('core')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'core'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            Trọng tâm ({unit.coreVocab.length})
          </button>
          <button
            onClick={() => setFilterType('extended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'extended'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            Mở rộng ({unit.extendedVocab.length})
          </button>
          <button
            onClick={() => setFilterType('bookmarked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'bookmarked'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Đã lưu ({Object.values(bookmarkedIds).filter(Boolean).length})</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => handleSelectMode('flashcard')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition whitespace-nowrap ${
            mode === 'flashcard'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-blue-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Thẻ Flashcard 3D</span>
        </button>

        <button
          onClick={() => handleSelectMode('quiz')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition whitespace-nowrap ${
            mode === 'quiz'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-blue-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Đố Vui Trắc Nghiệm</span>
        </button>

        <button
          onClick={() => handleSelectMode('spelling')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition whitespace-nowrap ${
            mode === 'spelling'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-blue-100'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>Xếp Chữ Ghép Từ</span>
        </button>

        <button
          onClick={() => handleSelectMode('memory')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition whitespace-nowrap ${
            mode === 'memory'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-blue-100'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-emerald-500" />
          <span className="font-extrabold text-emerald-700">Lật Thẻ Trí Nhớ (Game)</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">Mới</span>
        </button>

        <button
          onClick={() => handleSelectMode('dictation')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition whitespace-nowrap ${
            mode === 'dictation'
              ? 'bg-blue-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-blue-100'
          }`}
        >
          <Headphones className="w-4 h-4 text-cyan-500" />
          <span>Nghe &amp; Gõ Chính Tả</span>
        </button>
      </div>

      {/* MODE 1: 3D Flashcard Mode */}
      {mode === 'flashcard' && currentFlashcard && (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full max-w-lg min-h-[340px] perspective-1000">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full min-h-[340px] rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-lg cursor-pointer transition-all duration-500 flex flex-col justify-between select-none relative overflow-hidden ${
                isFlipped
                  ? 'bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-800 text-white transform rotate-y-180'
                  : 'bg-white text-slate-800 hover:border-blue-400'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isFlipped ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {currentFlashcard.isExtended ? 'Từ mở rộng' : 'Từ trọng tâm'}
                  </span>
                  <span
                    className={`text-xs ${
                      isFlipped ? 'text-blue-200' : 'text-slate-400 font-mono'
                    }`}
                  >
                    ({currentFlashcard.partOfSpeech})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleBookmark(currentFlashcard.id, e)}
                    className={`p-2 rounded-xl transition ${
                      bookmarkedIds[currentFlashcard.id]
                        ? 'bg-amber-400 text-blue-950 shadow'
                        : isFlipped
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                    title={bookmarkedIds[currentFlashcard.id] ? 'Bỏ lưu từ này' : 'Lưu từ vào danh sách yêu thích'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        bookmarkedIds[currentFlashcard.id] ? 'fill-blue-950' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentFlashcard.word);
                    }}
                    className={`p-2 rounded-xl transition ${
                      isFlipped
                        ? 'bg-amber-400 text-blue-950 hover:bg-amber-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title="Nghe phát âm chuẩn"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="my-auto text-center space-y-3 py-4">
                {!isFlipped ? (
                  <>
                    <h3 className="text-3xl md:text-4xl font-black font-['Fredoka',sans-serif] text-blue-950 tracking-wide">
                      {currentFlashcard.word}
                    </h3>
                    <p className="text-sm font-mono text-blue-700 font-semibold">
                      {currentFlashcard.phonetic}
                    </p>
                    <p className="text-xs text-slate-400 italic pt-2">
                      (Chạm vào thẻ để lật xem nghĩa Tiếng Việt &amp; ví dụ)
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-amber-300">
                      {currentFlashcard.meaningVi}
                    </h3>
                    <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-left text-xs md:text-sm space-y-1.5 mt-3">
                      <div className="font-bold text-blue-100 flex items-center justify-between">
                        <span>Ví dụ: {currentFlashcard.exampleEn}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(currentFlashcard.exampleEn);
                          }}
                          className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-blue-200 text-[11px] italic">
                        👉 {currentFlashcard.exampleVi}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-100/30">
                <span className={isFlipped ? 'text-blue-200' : 'text-slate-400'}>
                  Từ {((currentCardIndex % activeWords.length) + 1)} / {activeWords.length}
                </span>
                <span className={isFlipped ? 'text-amber-300 font-bold' : 'text-blue-600 font-bold'}>
                  {currentFlashcard.category || 'Family and Friends 1'}
                </span>
              </div>
            </div>
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevCard}
              className="p-3 rounded-2xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm transition"
              title="Từ trước đó"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSpeak(currentFlashcard.word)}
              className="px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Nghe đọc mẫu</span>
            </button>

            <button
              onClick={() => setSlowAudio(!slowAudio)}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition ${
                slowAudio
                  ? 'bg-amber-400 border-amber-500 text-blue-950 font-extrabold'
                  : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
              title="Chỉnh tốc độ đọc chậm"
            >
              {slowAudio ? '🐢 Đọc chậm (0.6x)' : '⚽ Tốc độ chuẩn'}
            </button>

            <button
              onClick={handleNextCard}
              className="p-3 rounded-2xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm transition"
              title="Từ kế tiếp"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: Quiz Mode */}
      {mode === 'quiz' && currentQuizWord && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Câu {(quizIndex % activeWords.length) + 1} / {activeWords.length}
              </span>
              {quizCombo >= 2 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black flex items-center gap-1 animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Combo x{quizCombo}!
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-500">
              Điểm: <strong className="text-amber-500 font-extrabold text-sm">{quizScore}</strong>
            </div>
          </div>

          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
              Chọn nghĩa Tiếng Việt đúng cho từ:
            </span>
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-3xl font-black font-['Fredoka',sans-serif] text-blue-950">
                {currentQuizWord.word}
              </h3>
              <button
                onClick={() => handleSpeak(currentQuizWord.word)}
                className="p-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-mono text-blue-600 font-medium">
              {currentQuizWord.phonetic}
            </p>
          </div>

          {/* Options */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {currentOptions.map((opt, optIdx) => {
              const isSelected = quizSelected === optIdx;
              const isCorrect = opt.id === currentQuizWord.id;
              const showResult = quizSelected !== null;

              let btnClass = 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-800';
              if (showResult) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-600 border-emerald-600 text-white font-black shadow-md';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500 border-rose-500 text-white font-black';
                } else {
                  btnClass = 'opacity-50 bg-slate-50 border-slate-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={showResult}
                  onClick={() => handleSelectQuiz(optIdx, isCorrect)}
                  className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt.meaningVi}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {quizSelected !== null && (
            <div className="pt-2 animate-fade-in flex justify-end">
              <button
                onClick={handleNextQuiz}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Spelling Scramble Game */}
      {mode === 'spelling' && currentSpellingWord && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm max-w-xl mx-auto space-y-6 text-center">
          <div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
              Xếp chữ thành từ đúng
            </span>
            <h3 className="text-lg font-bold text-blue-950 mt-2">
              Nghĩa: &quot;<strong className="text-blue-700">{currentSpellingWord.meaningVi}</strong>&quot;
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <button
                onClick={() => handleSpeak(currentSpellingWord.word)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
              >
                <Volume2 className="w-4 h-4" />
                <span>Bấm nghe gợi ý phát âm</span>
              </button>
            </div>
          </div>

          {/* User's Current Spelling Slot */}
          <div className="flex justify-center items-center gap-2 min-h-[56px] bg-blue-50/60 p-3 rounded-2xl border border-blue-100 flex-wrap">
            {userSpelling.map((letter, idx) => (
              <span
                key={idx}
                className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black text-xl flex items-center justify-center shadow-xs animate-pop-in"
              >
                {letter}
              </span>
            ))}
            {userSpelling.length === 0 && (
              <span className="text-xs text-slate-400 font-medium italic">
                (Bấm vào các chữ cái bên dưới để xếp từ)
              </span>
            )}
          </div>

          {/* Result Feedback */}
          {isSpellingCorrect === true && (
            <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-5 h-5" />
              <span>Chính xác! Bé đánh vần quá xuất sắc! (+25 XP &amp; +3 ⭐)</span>
            </div>
          )}

          {isSpellingCorrect === false && (
            <div className="text-sm font-bold text-rose-500 flex items-center justify-center gap-1.5">
              <XCircle className="w-5 h-5" />
              <span>Chưa đúng rồi! Bé bấm nút Thử lại để xếp lại nhé!</span>
            </div>
          )}

          {/* Scrambled Available Letters */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {scrambledLetters.map((letter, idx) => (
              <button
                key={idx}
                disabled={isSpellingCorrect === true}
                onClick={() => handlePickLetter(letter, idx)}
                className="w-11 h-11 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950 font-black text-xl flex items-center justify-center shadow-sm transform hover:-translate-y-1 transition active:scale-95"
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleResetSpelling}
              className="flex-1 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-bold text-xs transition flex items-center justify-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Thử lại
            </button>
            <button
              onClick={handleNextSpelling}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow"
            >
              <span>Từ tiếp theo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: NEW Memory Match Card Game */}
      {mode === 'memory' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-base font-['Fredoka',sans-serif]">
                Lật Thẻ Trí Nhớ - Tìm Cặp Từ Vựng
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                Đã ghép: <strong className="text-emerald-950 font-extrabold">{memoryMatches} / 4</strong> cặp
              </span>
              <span className="text-slate-500">
                Số lượt lật: <strong>{memoryMoves}</strong>
              </span>
              <button
                onClick={initMemoryGame}
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                title="Chơi ván mới"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            💡 <strong>Cách chơi:</strong> Lật mở 1 thẻ Từ Tiếng Anh và 1 thẻ Nghĩa Tiếng Việt tương ứng. Ghép đúng tất cả các cặp để giành chiến thắng!
          </p>

          {/* 8 Cards Grid (4x2 on desktop, 2x4 on mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {memoryCards.map((card, idx) => {
              const isSelected = selectedCards.includes(idx);
              const showCard = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  disabled={showCard}
                  onClick={() => handleCardClick(idx)}
                  className={`h-28 rounded-2xl border-2 p-2.5 flex flex-col items-center justify-center text-center transition-all duration-300 transform select-none ${
                    card.isMatched
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950 scale-95 shadow-inner'
                      : showCard
                      ? 'bg-blue-700 border-blue-800 text-white shadow-md scale-102'
                      : 'bg-gradient-to-tr from-blue-100 to-cyan-100 border-blue-200 hover:border-blue-400 hover:shadow text-blue-400'
                  }`}
                >
                  {showCard ? (
                    <div className="space-y-1 animate-pop-in">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-white/20 inline-block">
                        {card.type === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}
                      </span>
                      <div className="font-extrabold text-sm md:text-base leading-tight">
                        {card.content}
                      </div>
                      {card.subContent && (
                        <div className="text-[11px] opacity-80 font-mono">
                          {card.subContent}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">⚽</span>
                      <span className="text-[10px] font-black tracking-widest text-blue-700">ZERA</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Win Celebration Banner */}
          {memoryWon && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 text-center space-y-2 animate-fade-in shadow-lg">
              <div className="text-3xl">🎉 🏆 ⭐</div>
              <h4 className="font-black text-lg font-['Fredoka',sans-serif]">
                Tuyệt Vời! Bé Có Trí Nhớ Siêu Phàm!
              </h4>
              <p className="text-xs text-emerald-100">
                Bé đã hoàn thành xuất sắc trò chơi chỉ trong {memoryMoves} lượt lật! (+35 XP &amp; +4 ⭐)
              </p>
              <button
                onClick={initMemoryGame}
                className="mt-2 px-5 py-2 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow hover:bg-emerald-50 transition"
              >
                Chơi ván tiếp theo
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 5: NEW Listen & Dictation Mode */}
      {mode === 'dictation' && currentDictationWord && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm max-w-xl mx-auto space-y-5 text-center">
          <div>
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full uppercase">
              Nghe &amp; Gõ chính tả
            </span>
            <h3 className="text-base font-extrabold text-blue-950 mt-2">
              Lắng nghe phát âm và gõ lại đúng từ vựng tiếng Anh
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gợi ý nghĩa Tiếng Việt: <strong className="text-blue-700">{currentDictationWord.meaningVi}</strong>
            </p>
          </div>

          {/* Big Audio Play Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => handleSpeak(currentDictationWord.word)}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-cyan-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition transform"
              title="Bấm để nghe Zero phát âm"
            >
              <Volume2 className="w-9 h-9" />
            </button>
          </div>
          <span className="text-xs text-slate-400 block">
            (Bấm vào nút loa tròn để nghe đọc)
          </span>

          {/* Typing Form */}
          <form onSubmit={handleCheckDictation} className="space-y-3 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                placeholder="Gõ từ tiếng Anh tại đây..."
                value={dictationInput}
                onChange={(e) => {
                  setDictationInput(e.target.value);
                  setDictationStatus('idle');
                }}
                className={`w-full py-3 px-4 rounded-2xl border-2 text-center font-extrabold text-lg text-blue-950 focus:outline-none transition ${
                  dictationStatus === 'correct'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : dictationStatus === 'wrong'
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-blue-200 focus:border-blue-600 bg-blue-50/30'
                }`}
              />
            </div>

            {/* Hint Display */}
            {showDictationHint && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold animate-fade-in">
                💡 Gợi ý: Bắt đầu bằng chữ cái &quot;<strong>{currentDictationWord.word[0].toUpperCase()}</strong>&quot;, gồm {currentDictationWord.word.length} chữ cái. Phiên âm: {currentDictationWord.phonetic}
              </div>
            )}

            {/* Status messages */}
            {dictationStatus === 'correct' && (
              <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-5 h-5" />
                <span>Chính xác tuyệt đối! Bé gõ từ rất chuẩn! (+25 XP &amp; +3 ⭐)</span>
              </div>
            )}

            {dictationStatus === 'wrong' && (
              <div className="text-sm font-bold text-rose-500 flex items-center justify-center gap-1.5">
                <XCircle className="w-5 h-5" />
                <span>Chưa chuẩn chính tả rồi! Bé nghe lại và thử gõ lại nhé!</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDictationHint(!showDictationHint)}
                className="py-2.5 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold text-xs transition"
              >
                {showDictationHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow transition"
              >
                Kiểm tra kết quả
              </button>

              <button
                type="button"
                onClick={handleNextDictation}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Từ tiếp theo ➔
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vocabulary List Table at Bottom */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <span>Danh sách từ vựng bài học ({activeWords.length} từ)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Chạm vào biểu tượng ngôi sao để lưu từ cần ôn luyện
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeWords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between hover:bg-blue-100/50 hover:border-blue-300 transition group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-950 text-sm">{item.word}</span>
                  {item.isExtended && (
                    <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                      Mở rộng
                    </span>
                  )}
                </div>
                <div className="text-xs text-blue-600 font-mono font-medium">{item.phonetic}</div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">{item.meaningVi}</div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleToggleBookmark(item.id, e)}
                  className={`p-2 rounded-xl transition ${
                    bookmarkedIds[item.id]
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-slate-300 hover:text-amber-500 hover:bg-white'
                  }`}
                  title={bookmarkedIds[item.id] ? 'Đã lưu' : 'Lưu từ'}
                >
                  <Star className={`w-4 h-4 ${bookmarkedIds[item.id] ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => handleSpeak(item.word)}
                  className="p-2 rounded-xl bg-white hover:bg-blue-600 text-blue-700 hover:text-white transition shadow-xs"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
