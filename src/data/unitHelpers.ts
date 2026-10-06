import {
  VocabularyWord,
  GrammarPoint,
  CommunicationExercise,
  PhonicsExercise,
  ReadingQuestion,
} from '../types';

/** Từ trọng tâm */
export const v = (
  id: string,
  word: string,
  phonetic: string,
  meaningVi: string,
  partOfSpeech: string,
  exampleEn: string,
  exampleVi: string,
  category: string
): VocabularyWord => ({ id, word, phonetic, meaningVi, partOfSpeech, exampleEn, exampleVi, category });

/** Từ mở rộng */
export const ev = (
  id: string,
  word: string,
  phonetic: string,
  meaningVi: string,
  partOfSpeech: string,
  exampleEn: string,
  exampleVi: string,
  category: string
): VocabularyWord => ({
  id,
  word,
  phonetic,
  meaningVi,
  partOfSpeech,
  exampleEn,
  exampleVi,
  isExtended: true,
  category: `Mở rộng: ${category}`,
});

/** Ví dụ ngữ pháp (meaning có dạng "Dịch câu 1 - Dịch câu 2") */
export const ex = (q: string, a: string, meaning: string) => ({ q, a, meaning });

export const g = (
  id: string,
  title: string,
  pattern: string,
  explanation: string,
  examples: { q: string; a: string; meaning: string }[],
  zeraTip: string
): GrammarPoint => ({ id, title, pattern, explanation, examples, zeraTip });

/** Bài giao tiếp: cho câu trả lời, chọn câu hỏi */
export const a2q = (
  id: string,
  givenLabel: string,
  prompt: string,
  targetLabel: string,
  options: string[],
  correctIndex: number,
  explanation: string
): CommunicationExercise => ({
  id,
  type: 'answer_to_question',
  instruction: 'Cho câu trả lời, hãy chọn câu hỏi phù hợp:',
  givenLabel,
  prompt,
  targetLabel,
  options,
  correctIndex,
  explanation,
});

/** Bài giao tiếp: cho câu hỏi, chọn câu trả lời */
export const q2a = (
  id: string,
  givenLabel: string,
  prompt: string,
  targetLabel: string,
  options: string[],
  correctIndex: number,
  explanation: string
): CommunicationExercise => ({
  id,
  type: 'question_to_answer',
  instruction: 'Cho câu hỏi, hãy chọn câu trả lời đúng:',
  givenLabel,
  prompt,
  targetLabel,
  options,
  correctIndex,
  explanation,
});

export const ph = (
  id: string,
  letterSound: string,
  word: string,
  phonetic: string,
  sentence: string,
  translation: string,
  tip: string
): PhonicsExercise => ({ id, letterSound, word, phonetic, sentence, translation, tip });

export const rq = (
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string
): ReadingQuestion => ({ id, question, options, correctIndex, explanation });

export type VRow = [string, string, string, string, string, string];
/** Tạo danh sách từ vựng từ các dòng [word, phonetic, nghĩa, loại từ, ví dụ EN, ví dụ VI] */
export const vlist = (prefix: string, category: string, rows: VRow[], extended = false): VocabularyWord[] =>
  rows.map((r, i) =>
    (extended ? ev : v)(`${prefix}_${extended ? 'e' : 'v'}${i + 1}`, r[0], r[1], r[2], r[3], r[4], r[5], category)
  );
