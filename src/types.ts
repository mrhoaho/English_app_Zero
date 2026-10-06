export interface MockExamRecord {
  score: number;
  maxScore: number;
  percent: number;
  date: string;
  rankTitle: string;
  totalTimeSeconds: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // emoji or character name
  xp: number;
  level: number;
  stars: number;
  streak: number;
  lastActiveDate: string;
  completedActivities: {
    [key: string]: boolean; // e.g. "unit1_vocab": true
  };
  highScores: {
    [key: string]: number;
  };
  unlockedBadges: string[];
  bookmarkedWords?: string[]; // IDs of favorited vocabulary words
  mockExamResults?: {
    [examId: string]: MockExamRecord;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpRequired?: number;
  condition: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  meaningVi: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleVi: string;
  isExtended?: boolean; // whether it's an extended word
  category?: string;
  icon?: string;
}

export interface SentenceBuilderExercise {
  id: string;
  scrambledWords: string[];
  correctSentence: string;
  translationVi: string;
  hint?: string;
}

export interface ErrorBusterExercise {
  id: string;
  originalSentence: string; // e.g. "She are from America."
  words: string[]; // ['She', 'are', 'from', 'America.']
  wrongWordIndex: number; // index of 'are' (1)
  correctWord: string; // 'is'
  explanation: string;
}

export interface GrammarQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarPoint {
  id: string;
  title: string;
  pattern: string;
  explanation: string;
  examples: {
    q: string;
    a: string;
    meaning: string;
  }[];
  zeraTip: string;
  sentenceBuilders?: SentenceBuilderExercise[];
  errorBusters?: ErrorBusterExercise[];
  quizzes?: GrammarQuizQuestion[];
}

export interface CommunicationExercise {
  id: string;
  type: 'answer_to_question' | 'question_to_answer' | 'dialogue_order';
  instruction: string;
  prompt: string; // The given part (e.g. Question or Answer)
  givenLabel: string; // e.g. "Câu trả lời của bạn Nam:"
  targetLabel: string; // e.g. "Hãy chọn câu hỏi phù hợp nhất:"
  options: string[];
  correctIndex: number;
  explanation: string;
  dialogueItems?: string[]; // for ordering
  correctOrder?: number[]; // correct order array of indices [0, 2, 1, 3]
}

export interface PhonicsExercise {
  id: string;
  letterSound: string; // e.g. "a", "ia", "t", "d"
  word: string; // e.g. "America", "Australia"
  phonetic: string;
  sentence: string; // e.g. "I'm from America."
  translation: string;
  tip: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingStory {
  id: string;
  title: string;
  unitId: number;
  passageEn: string;
  passageVi: string;
  authorOrCharacter?: string;
  imageTheme: string;
  questions: ReadingQuestion[];
}

export interface ExamQuestion {
  id: string;
  skill: 'listening' | 'vocab' | 'grammar' | 'reading';
  question: string;
  audioPrompt?: string; // Text to be spoken for listening questions
  passage?: string; // Optional reading passage
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MockExam {
  id: string;
  title: string;
  subtitle: string;
  semester: 1 | 2;
  level: string; // 'Giữa Học Kỳ 1' | 'Cuối Học Kỳ 1' | 'Thử Thách 15 Phút'
  durationMinutes: number;
  totalQuestions: number;
  questions: ExamQuestion[];
}

export interface UnitData {
  id: number;
  title: string;
  subtitleVi: string;
  themeColor: string;
  icon: string;
  grammar: GrammarPoint[];
  coreVocab: VocabularyWord[];
  extendedVocab: VocabularyWord[];
  communication: CommunicationExercise[];
  phonics: PhonicsExercise[];
  reading: ReadingStory;
}

