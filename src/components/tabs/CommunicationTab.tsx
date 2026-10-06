import React, { useState, useRef } from 'react';
import { UnitData } from '../../types';
import { speakEnglish, sfx, startSpeechRecognition, SpeechAssessmentResult } from '../../utils/audioUtils';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Mic,
  MicOff,
  Lightbulb,
  Trophy,
  ListOrdered,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  User,
  Bot
} from 'lucide-react';

interface CommunicationTabProps {
  unit: UnitData;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
}

export interface MissingRoleExercise {
  id: string;
  missingRole: 'question' | 'answer'; // whether user speaks question or answer
  partnerRole: string; // e.g. "Zero Mbappe" or "Bạn Nam"
  partnerPrompt: string; // The given utterance
  partnerPromptVi: string;
  targetUtterance: string; // What the student needs to say
  targetUtteranceVi: string;
  explanation: string;
}

// Generate tailored missing-part conversational roleplay drills for each unit
const UNIT_ROLEPLAY_DRILLS: {
  [unitId: number]: MissingRoleExercise[];
} = {
  0: [
    {
      id: 'st_r1',
      missingRole: 'question',
      partnerRole: 'Rosy',
      partnerPrompt: "I'm fine, thank you.",
      partnerPromptVi: 'Mình khỏe, cảm ơn bạn.',
      targetUtterance: 'How are you?',
      targetUtteranceVi: 'Bạn khỏe không?',
      explanation: 'Khi Rosy trả lời "I\'m fine, thank you", câu hỏi phù hợp là "How are you?".',
    },
    {
      id: 'st_r2',
      missingRole: 'answer',
      partnerRole: 'Cô Jones',
      partnerPrompt: "Hello. What's your name?",
      partnerPromptVi: 'Xin chào. Tên em là gì?',
      targetUtterance: "My name's Tim.",
      targetUtteranceVi: 'Tên em là Tim.',
      explanation: 'Hỏi tên bằng "What\'s your name?" thì trả lời "My name\'s ..." và nói tên của mình.',
    },
    {
      id: 'st_r3',
      missingRole: 'answer',
      partnerRole: 'Tim',
      partnerPrompt: 'How old are you?',
      partnerPromptVi: 'Bạn bao nhiêu tuổi?',
      targetUtterance: "I'm seven.",
      targetUtteranceVi: 'Mình bảy tuổi.',
      explanation: '"How old are you?" hỏi tuổi, trả lời bằng "I\'m" và một số đếm.',
    },
    {
      id: 'st_r4',
      missingRole: 'question',
      partnerRole: 'Billy',
      partnerPrompt: "I'm two.",
      partnerPromptVi: 'Em hai tuổi.',
      targetUtterance: 'How old are you?',
      targetUtteranceVi: 'Em bao nhiêu tuổi?',
      explanation: 'Billy nói tuổi của mình ("I\'m two"), nên câu hỏi là "How old are you?".',
    },
  ],
  1: [
    {
      id: 'u1_r1',
      missingRole: 'question',
      partnerRole: 'Rosy',
      partnerPrompt: "It's a pen.",
      partnerPromptVi: 'Đây là cái bút mực.',
      targetUtterance: "What's this?",
      targetUtteranceVi: 'Đây là cái gì?',
      explanation: 'Rosy nói tên một đồ vật ("It\'s a pen"), nên câu hỏi là "What\'s this?".',
    },
    {
      id: 'u1_r2',
      missingRole: 'answer',
      partnerRole: 'Rosy',
      partnerPrompt: "What's this?",
      partnerPromptVi: 'Đây là cái gì?',
      targetUtterance: "It's a rubber.",
      targetUtteranceVi: 'Đây là cục tẩy.',
      explanation: 'Hỏi "What\'s this?" thì trả lời "It\'s a ..." và nói tên đồ vật.',
    },
    {
      id: 'u1_r3',
      missingRole: 'answer',
      partnerRole: 'Tim',
      partnerPrompt: 'Can I have my school things, please?',
      partnerPromptVi: 'Cho mình xin đồ dùng học tập của mình nhé?',
      targetUtterance: 'OK, here you are.',
      targetUtteranceVi: 'Được, của bạn đây.',
      explanation: 'Khi bạn xin đồ, ta đưa đồ và nói "OK, here you are."',
    },
  ],
  2: [
    {
      id: 'u2_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Is this your teddy?",
      partnerPromptVi: "Đây có phải gấu bông của bạn không?",
      targetUtterance: "Yes, it is.",
      targetUtteranceVi: "Vâng, đúng vậy.",
      explanation: "Hỏi \"Is this your...?\" thì trả lời \"Yes, it is.\" hoặc \"No, it isn't.\"",
    },
    {
      id: 'u2_r2',
      missingRole: 'question',
      partnerRole: "Holly",
      partnerPrompt: "I'm seven.",
      partnerPromptVi: "Mình bảy tuổi.",
      targetUtterance: "How old are you?",
      targetUtteranceVi: "Bạn bao nhiêu tuổi?",
      explanation: "Holly nói tuổi nên câu hỏi là \"How old are you?\"",
    },
    {
      id: 'u2_r3',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "It's pink.",
      partnerPromptVi: "Nó màu hồng.",
      targetUtterance: "What colour is it?",
      targetUtteranceVi: "Nó màu gì?",
      explanation: "Tim nói màu sắc nên câu hỏi là \"What colour is it?\"",
    },
  ],
  3: [
    {
      id: 'u3_r1',
      missingRole: 'answer',
      partnerRole: "Emma",
      partnerPrompt: "What are these?",
      partnerPromptVi: "Đây là gì vậy?",
      targetUtterance: "These are my legs.",
      targetUtteranceVi: "Đây là hai chân của mình.",
      explanation: "Hỏi \"What are these?\" thì trả lời \"These are...\"",
    },
    {
      id: 'u3_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "I've got ten fingers.",
      partnerPromptVi: "Mình có mười ngón tay.",
      targetUtterance: "How many fingers have you got?",
      targetUtteranceVi: "Bạn có bao nhiêu ngón tay?",
      explanation: "Tim nói số lượng nên câu hỏi là \"How many...have you got?\"",
    },
    {
      id: 'u3_r3',
      missingRole: 'answer',
      partnerRole: "Cô Jones",
      partnerPrompt: "Touch your nose.",
      partnerPromptVi: "Hãy chạm vào mũi của em.",
      targetUtterance: "OK!",
      targetUtteranceVi: "Vâng ạ!",
      explanation: "Khi nghe mệnh lệnh thì đáp lại bằng \"OK!\" rồi làm theo.",
    },
  ],
  4: [
    {
      id: 'u4_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Who's this?",
      partnerPromptVi: "Đây là ai vậy?",
      targetUtterance: "He's my dad.",
      targetUtteranceVi: "Đó là bố của mình.",
      explanation: "Hỏi \"Who's this?\" thì trả lời \"He's / She's my...\"",
    },
    {
      id: 'u4_r2',
      missingRole: 'question',
      partnerRole: "Billy",
      partnerPrompt: "Yes, she is.",
      partnerPromptVi: "Vâng, cô ấy là giáo viên.",
      targetUtterance: "Is she a teacher?",
      targetUtteranceVi: "Cô ấy có phải giáo viên không?",
      explanation: "\"Yes, she is.\" ứng với câu hỏi \"Is she...?\"",
    },
    {
      id: 'u4_r3',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "Is he your brother?",
      partnerPromptVi: "Anh ấy có phải anh trai bạn không?",
      targetUtterance: "No, he isn't.",
      targetUtteranceVi: "Không, anh ấy không phải.",
      explanation: "Với \"he\" trả lời \"he is\" hoặc \"he isn't\".",
    },
  ],
  5: [
    {
      id: 'u5_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Where's the ball?",
      partnerPromptVi: "Quả bóng ở đâu?",
      targetUtterance: "It's in the net.",
      targetUtteranceVi: "Nó ở trong lưới.",
      explanation: "\"Where\" hỏi nơi chốn nên dùng in, on hoặc under.",
    },
    {
      id: 'u5_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "They're under the tree.",
      partnerPromptVi: "Chúng ở dưới gốc cây.",
      targetUtterance: "Where are the bikes?",
      targetUtteranceVi: "Những chiếc xe đạp ở đâu?",
      explanation: "\"They're\" ứng với nhiều đồ vật nên hỏi \"Where are...?\"",
    },
    {
      id: 'u5_r3',
      missingRole: 'answer',
      partnerRole: "Billy",
      partnerPrompt: "Let's play football!",
      partnerPromptVi: "Cùng chơi bóng đá nào!",
      targetUtterance: "OK!",
      targetUtteranceVi: "Được thôi!",
      explanation: "Đáp lại lời rủ \"Let's...\" bằng \"OK!\"",
    },
  ],
  6: [
    {
      id: 'u6_r1',
      missingRole: 'answer',
      partnerRole: "Emma",
      partnerPrompt: "Whose hat is this?",
      partnerPromptVi: "Đây là mũ của ai?",
      targetUtterance: "It's Grandpa's hat.",
      targetUtteranceVi: "Đó là mũ của ông.",
      explanation: "\"Whose\" hỏi đồ của ai, trả lời bằng tên + 's.",
    },
    {
      id: 'u6_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "It's an umbrella.",
      partnerPromptVi: "Đó là một cái ô.",
      targetUtterance: "What's this?",
      targetUtteranceVi: "Đây là gì vậy?",
      explanation: "Trả lời tên đồ vật nên hỏi \"What's this?\"",
    },
    {
      id: 'u6_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Is it Dad's phone?",
      partnerPromptVi: "Đó có phải điện thoại của bố không?",
      targetUtterance: "Yes, it is.",
      targetUtteranceVi: "Vâng, đúng vậy.",
      explanation: "Câu hỏi Yes/No với \"Is it...?\" trả lời \"Yes, it is.\"",
    },
  ],
  7: [
    {
      id: 'u7_r1',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "Are these his shorts?",
      partnerPromptVi: "Đây có phải quần soóc của cậu ấy không?",
      targetUtterance: "Yes, they are.",
      targetUtteranceVi: "Vâng, đúng vậy.",
      explanation: "Với \"Are these...?\" trả lời \"Yes, they are.\"",
    },
    {
      id: 'u7_r2',
      missingRole: 'question',
      partnerRole: "Emma",
      partnerPrompt: "She's wearing a pink dress.",
      partnerPromptVi: "Cô ấy mặc váy màu hồng.",
      targetUtterance: "What's she wearing?",
      targetUtteranceVi: "Cô ấy đang mặc gì?",
      explanation: "Trả lời \"She's wearing...\" nên hỏi \"What's she wearing?\"",
    },
    {
      id: 'u7_r3',
      missingRole: 'answer',
      partnerRole: "Billy",
      partnerPrompt: "Is this her skirt?",
      partnerPromptVi: "Đây có phải chân váy của cô ấy không?",
      targetUtterance: "No, it isn't.",
      targetUtteranceVi: "Không, không phải.",
      explanation: "Một món đồ nên trả lời \"it isn't\".",
    },
  ],
  8: [
    {
      id: 'u8_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Where's Mum?",
      partnerPromptVi: "Mẹ ở đâu?",
      targetUtterance: "She's in the kitchen.",
      targetUtteranceVi: "Mẹ ở trong bếp.",
      explanation: "Hỏi \"Where's Mum?\" thì trả lời \"She's in the...\"",
    },
    {
      id: 'u8_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "No, he isn't.",
      partnerPromptVi: "Không, ông không ở đó.",
      targetUtterance: "Is Grandpa in the garden?",
      targetUtteranceVi: "Ông có ở trong vườn không?",
      explanation: "\"he isn't\" ứng với câu hỏi về một người nam.",
    },
    {
      id: 'u8_r3',
      missingRole: 'answer',
      partnerRole: "Billy",
      partnerPrompt: "What's in the bedroom?",
      partnerPromptVi: "Trong phòng ngủ có gì?",
      targetUtterance: "There's a bed.",
      targetUtteranceVi: "Có một cái giường.",
      explanation: "\"What's in...?\" trả lời \"There's a...\"",
    },
  ],
  9: [
    {
      id: 'u9_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "What have you got?",
      partnerPromptVi: "Bạn có gì vậy?",
      targetUtterance: "I've got an apple.",
      targetUtteranceVi: "Mình có một quả táo.",
      explanation: "Trả lời bằng \"I've got...\" và nhớ dùng \"an\" với apple.",
    },
    {
      id: 'u9_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "Yes, I have.",
      partnerPromptVi: "Vâng, mình có.",
      targetUtterance: "Have you got a banana?",
      targetUtteranceVi: "Bạn có chuối không?",
      explanation: "\"Yes, I have.\" ứng với \"Have you got...?\"",
    },
    {
      id: 'u9_r3',
      missingRole: 'answer',
      partnerRole: "Emma",
      partnerPrompt: "Can I have some milk, please?",
      partnerPromptVi: "Cho mình xin ít sữa nhé?",
      targetUtterance: "Here you are.",
      targetUtteranceVi: "Của bạn đây.",
      explanation: "Khi đưa đồ cho bạn thì nói \"Here you are.\"",
    },
  ],
  10: [
    {
      id: 'u10_r1',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "What's she like?",
      partnerPromptVi: "Cô ấy trông thế nào?",
      targetUtterance: "She's got long brown hair.",
      targetUtteranceVi: "Cô ấy có mái tóc dài màu nâu.",
      explanation: "Mô tả một bạn nữ thì dùng \"She's got...\"",
    },
    {
      id: 'u10_r2',
      missingRole: 'question',
      partnerRole: "Emma",
      partnerPrompt: "No, he hasn't.",
      partnerPromptVi: "Không, cậu ấy không có.",
      targetUtterance: "Has he got blue eyes?",
      targetUtteranceVi: "Cậu ấy có mắt xanh dương không?",
      explanation: "\"he hasn't\" ứng với câu hỏi \"Has he got...?\"",
    },
    {
      id: 'u10_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "What colour are your eyes?",
      partnerPromptVi: "Mắt bạn màu gì?",
      targetUtterance: "They're green.",
      targetUtteranceVi: "Mắt mình màu xanh lá.",
      explanation: "Eyes là số nhiều nên trả lời \"They're...\"",
    },
  ],
  11: [
    {
      id: 'u11_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Do you like elephants?",
      partnerPromptVi: "Bạn có thích voi không?",
      targetUtterance: "Yes, I do.",
      targetUtteranceVi: "Vâng, mình thích.",
      explanation: "\"Do you like...?\" trả lời \"Yes, I do.\"",
    },
    {
      id: 'u11_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "No, I don't.",
      partnerPromptVi: "Không, mình không thích.",
      targetUtterance: "Do you like snakes?",
      targetUtteranceVi: "Bạn có thích rắn không?",
      explanation: "\"No, I don't.\" ứng với \"Do you like...?\"",
    },
    {
      id: 'u11_r3',
      missingRole: 'question',
      partnerRole: "Emma",
      partnerPrompt: "You're a giraffe!",
      partnerPromptVi: "Bạn là hươu cao cổ!",
      targetUtterance: "What am I?",
      targetUtteranceVi: "Mình là con gì?",
      explanation: "Đoán con vật nên hỏi \"What am I?\"",
    },
  ],
  12: [
    {
      id: 'u12_r1',
      missingRole: 'answer',
      partnerRole: "Emma",
      partnerPrompt: "Do you like pizza?",
      partnerPromptVi: "Bạn có thích pizza không?",
      targetUtterance: "Yes, I do.",
      targetUtteranceVi: "Vâng, mình thích.",
      explanation: "\"Do you like...?\" trả lời \"Yes, I do.\"",
    },
    {
      id: 'u12_r2',
      missingRole: 'question',
      partnerRole: "Cô phục vụ",
      partnerPrompt: "Yes, here you are.",
      partnerPromptVi: "Vâng, của bạn đây.",
      targetUtterance: "Can I have a burger, please?",
      targetUtteranceVi: "Cho mình xin một cái burger nhé?",
      explanation: "Đưa đồ cho khách nên đáp \"here you are\" khi khách xin \"Can I have...?\"",
    },
    {
      id: 'u12_r3',
      missingRole: 'answer',
      partnerRole: "Billy",
      partnerPrompt: "What do you like?",
      partnerPromptVi: "Bạn thích món gì?",
      targetUtterance: "I like ice cream.",
      targetUtteranceVi: "Mình thích kem.",
      explanation: "Trả lời \"I like...\" rồi nói món ăn.",
    },
  ],
};

// Dialogue ordering exercises for each unit
const UNIT_DIALOGUES: {
  [unitId: number]: {
    title: string;
    items: { speaker: string; textEn: string; textVi: string }[];
    correctOrder: number[];
  };
} = {
  0: {
    title: 'Hội thoại chào hỏi: tên và tuổi',
    items: [
      { speaker: 'Tim', textEn: "My name's Tim.", textVi: 'Tên mình là Tim.' },
      { speaker: 'Rosy', textEn: "Hello. What's your name?", textVi: 'Xin chào. Tên bạn là gì?' },
      { speaker: 'Tim', textEn: "I'm seven.", textVi: 'Mình bảy tuổi.' },
      { speaker: 'Rosy', textEn: 'How old are you?', textVi: 'Bạn bao nhiêu tuổi?' },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  1: {
    title: 'Hội thoại hỏi đồ dùng học tập',
    items: [
      { speaker: 'Billy', textEn: "It's a pen.", textVi: 'Đây là cái bút mực.' },
      { speaker: 'Rosy', textEn: "And what's this?", textVi: 'Còn đây là cái gì?' },
      { speaker: 'Rosy', textEn: "Look, what's this?", textVi: 'Nhìn này, đây là cái gì?' },
      { speaker: 'Billy', textEn: "It's a rubber.", textVi: 'Đây là cục tẩy.' },
    ],
    correctOrder: [2, 0, 1, 3],
  },
  2: {
    title: "Hội thoại về đồ chơi",
    items: [
      { speaker: "Tim", textEn: "It's brown.", textVi: "Nó màu nâu." },
      { speaker: "Rosy", textEn: "What colour is your teddy?", textVi: "Gấu bông của bạn màu gì?" },
      { speaker: "Tim", textEn: "No, it isn't.", textVi: "Không, không phải." },
      { speaker: "Rosy", textEn: "Is this your teddy?", textVi: "Đây có phải gấu bông của bạn không?" },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  3: {
    title: "Hội thoại về cơ thể",
    items: [
      { speaker: "Tim", textEn: "OK!", textVi: "Vâng ạ!" },
      { speaker: "Cô Jones", textEn: "Touch your head.", textVi: "Hãy chạm vào đầu em." },
      { speaker: "Tim", textEn: "These are my ears.", textVi: "Đây là đôi tai của em." },
      { speaker: "Cô Jones", textEn: "What are these?", textVi: "Đây là gì vậy?" },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  4: {
    title: "Hội thoại về gia đình",
    items: [
      { speaker: "Rosy", textEn: "Is he a teacher?", textVi: "Bố bạn có phải giáo viên không?" },
      { speaker: "Rosy", textEn: "Who's this?", textVi: "Đây là ai vậy?" },
      { speaker: "Tim", textEn: "Yes, he is.", textVi: "Vâng, đúng vậy." },
      { speaker: "Tim", textEn: "He's my dad.", textVi: "Đó là bố mình." },
    ],
    correctOrder: [1, 3, 0, 2],
  },
  5: {
    title: "Hội thoại ở công viên",
    items: [
      { speaker: "Emma", textEn: "It's in the net.", textVi: "Nó ở trong lưới." },
      { speaker: "Emma", textEn: "OK!", textVi: "Được thôi!" },
      { speaker: "Billy", textEn: "Where's the ball?", textVi: "Quả bóng ở đâu?" },
      { speaker: "Billy", textEn: "Let's play football!", textVi: "Cùng chơi bóng đá nào!" },
    ],
    correctOrder: [2, 0, 3, 1],
  },
  6: {
    title: "Hội thoại về đồ dùng",
    items: [
      { speaker: "Rosy", textEn: "Yes, it is.", textVi: "Vâng, nó cũ." },
      { speaker: "Tim", textEn: "Is it old?", textVi: "Nó cũ à?" },
      { speaker: "Rosy", textEn: "It's Grandpa's hat.", textVi: "Đó là mũ của ông." },
      { speaker: "Tim", textEn: "Whose hat is this?", textVi: "Đây là mũ của ai?" },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  7: {
    title: "Hội thoại về quần áo",
    items: [
      { speaker: "Billy", textEn: "Yes, they are.", textVi: "Vâng, đúng vậy." },
      { speaker: "Emma", textEn: "Are these his shorts?", textVi: "Đây có phải quần soóc của cậu ấy không?" },
      { speaker: "Billy", textEn: "He's wearing an orange T-shirt.", textVi: "Cậu ấy mặc áo phông màu cam." },
      { speaker: "Emma", textEn: "What's he wearing?", textVi: "Cậu ấy đang mặc gì?" },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  8: {
    title: "Hội thoại ở nhà",
    items: [
      { speaker: "Tim", textEn: "Is Dad in the kitchen?", textVi: "Bố có ở trong bếp không?" },
      { speaker: "Tim", textEn: "Where's Mum?", textVi: "Mẹ ở đâu?" },
      { speaker: "Rosy", textEn: "No, he isn't.", textVi: "Không, bố không ở đó." },
      { speaker: "Rosy", textEn: "She's in the kitchen.", textVi: "Mẹ ở trong bếp." },
    ],
    correctOrder: [1, 3, 0, 2],
  },
  9: {
    title: "Hội thoại về bữa trưa",
    items: [
      { speaker: "Tim", textEn: "I've got an apple.", textVi: "Mình có một quả táo." },
      { speaker: "Tim", textEn: "Here you are.", textVi: "Của bạn đây." },
      { speaker: "Emma", textEn: "What have you got?", textVi: "Bạn có gì vậy?" },
      { speaker: "Emma", textEn: "Can I have a banana, please?", textVi: "Cho mình xin chuối nhé?" },
    ],
    correctOrder: [2, 0, 3, 1],
  },
  10: {
    title: "Hội thoại tả khuôn mặt",
    items: [
      { speaker: "Billy", textEn: "Yes, she has.", textVi: "Vâng, cô ấy có." },
      { speaker: "Rosy", textEn: "Has she got brown eyes?", textVi: "Cô ấy có mắt nâu không?" },
      { speaker: "Billy", textEn: "She's got long hair.", textVi: "Cô ấy có mái tóc dài." },
      { speaker: "Rosy", textEn: "What's she like?", textVi: "Cô ấy trông thế nào?" },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  11: {
    title: "Hội thoại về con vật",
    items: [
      { speaker: "Tim", textEn: "Yes, I do.", textVi: "Vâng, mình thích." },
      { speaker: "Emma", textEn: "Do you like elephants?", textVi: "Bạn có thích voi không?" },
      { speaker: "Tim", textEn: "No, I don't.", textVi: "Không, mình không thích." },
      { speaker: "Emma", textEn: "Do you like snakes?", textVi: "Bạn có thích rắn không?" },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  12: {
    title: "Hội thoại ở quán ăn",
    items: [
      { speaker: "Billy", textEn: "Can I have some water, please?", textVi: "Cho mình xin ít nước nhé?" },
      { speaker: "Billy", textEn: "Do you like pizza?", textVi: "Bạn có thích pizza không?" },
      { speaker: "Rosy", textEn: "Yes, here you are.", textVi: "Vâng, của bạn đây." },
      { speaker: "Rosy", textEn: "Yes, I do.", textVi: "Vâng, mình thích." },
    ],
    correctOrder: [1, 3, 0, 2],
  },
};

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  unit,
  onAwardPoints,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'speak_missing' | 'dialogue_order' | 'drills'>('speak_missing');

  // Filter in speak_missing: 'all' | 'speak_question' | 'speak_answer'
  const [missingFilter, setMissingFilter] = useState<'all' | 'question' | 'answer'>('all');

  // Roleplay Speaking Exercises
  const rawRoleplayList = UNIT_ROLEPLAY_DRILLS[unit.id] || UNIT_ROLEPLAY_DRILLS[1];
  const roleplayList = rawRoleplayList.filter((item) =>
    missingFilter === 'all' ? true : item.missingRole === missingFilter
  );

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const currentDrill: MissingRoleExercise = roleplayList[currentDrillIndex % roleplayList.length] || rawRoleplayList[0];

  const [showHint, setShowHint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState<SpeechAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Dialogue Ordering State
  const dialogueData = UNIT_DIALOGUES[unit.id] || UNIT_DIALOGUES[1];
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
  const [dialogueChecked, setDialogueChecked] = useState<boolean | null>(null);

  // Drills State
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState<{ [key: string]: boolean }>({});

  const handleSpeak = (text: string) => {
    speakEnglish(text, 0.88);
  };

  // Start Speech Recognition to speak the missing turn
  const handleStartSpeaking = () => {
    setErrorMessage(null);
    setSpeechResult(null);
    setIsRecording(true);

    const rec = startSpeechRecognition(
      currentDrill.targetUtterance,
      (result) => {
        setIsRecording(false);
        setSpeechResult(result);

        if (result.passed) {
          sfx.playCorrect();
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          const bonusStars = result.score >= 85 ? 3 : 2;
          onAwardPoints(30, bonusStars, `comm_speech_${currentDrill.id}`);
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

  const handleNextDrill = () => {
    setCurrentDrillIndex((prev) => (prev + 1) % roleplayList.length);
    setShowHint(false);
    setSpeechResult(null);
    setErrorMessage(null);
  };

  const handlePrevDrill = () => {
    setCurrentDrillIndex((prev) => (prev - 1 + roleplayList.length) % roleplayList.length);
    setShowHint(false);
    setSpeechResult(null);
    setErrorMessage(null);
  };

  // Dialogue ordering
  const handlePickDialogueItem = (originalIdx: number) => {
    if (dialogueChecked === true) return;
    sfx.playStar();
    if (orderedIndices.includes(originalIdx)) {
      setOrderedIndices((prev) => prev.filter((i) => i !== originalIdx));
    } else {
      setOrderedIndices((prev) => [...prev, originalIdx]);
    }
    setDialogueChecked(null);
  };

  const handleCheckDialogue = () => {
    if (orderedIndices.length !== dialogueData.items.length) return;

    const isMatch = orderedIndices.every((val, i) => val === dialogueData.correctOrder[i]);
    if (isMatch) {
      setDialogueChecked(true);
      sfx.playCorrect();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onAwardPoints(30, 4, `dialogue_order_${unit.id}`);

      const fullText = dialogueData.correctOrder
        .map((idx) => `${dialogueData.items[idx].speaker}: ${dialogueData.items[idx].textEn}`)
        .join('. ');
      speakEnglish(fullText);
    } else {
      setDialogueChecked(false);
      sfx.playWrong();
    }
  };

  const handleResetDialogue = () => {
    setOrderedIndices([]);
    setDialogueChecked(null);
  };

  // Drills
  const handleSelectDrill = (exId: string, optIdx: number, isCorrect: boolean) => {
    if (submitted[exId]) return;
    setSelectedOptions((prev) => ({ ...prev, [exId]: optIdx }));
    setSubmitted((prev) => ({ ...prev, [exId]: true }));

    if (isCorrect) {
      sfx.playCorrect();
      onAwardPoints(25, 3, `comm_${exId}`);
    } else {
      sfx.playWrong();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Sub-tab navigation */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <h2 className="text-xl font-black font-['Fredoka',sans-serif] text-blue-950">
              Luyện Giao Tiếp &amp; Hội Thoại ({unit.title})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Luyện nói vào chỗ trống (Hỏi &amp; Đáp qua micro), sắp xếp hội thoại và trắc nghiệm chuẩn SGK
          </p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex items-center gap-1.5 bg-blue-50 p-1.5 rounded-2xl border border-blue-100 flex-wrap justify-center">
          <button
            onClick={() => {
              setActiveSubTab('speak_missing');
              sfx.playStar();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeSubTab === 'speak_missing'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-300" />
            <span>Nói Vào Chỗ Thiếu</span>
            <span className="text-[10px] bg-amber-400 text-blue-950 px-1.5 rounded-full font-bold">Trọng tâm</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('dialogue_order');
              sfx.playStar();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeSubTab === 'dialogue_order'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Sắp Xếp Hội Thoại</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('drills');
              sfx.playStar();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeSubTab === 'drills'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-blue-800 hover:bg-blue-200/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Hỏi &amp; Đáp SGK</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SPEAK THE MISSING TURN (NÓI VÀO CHỖ THIẾU) */}
      {activeSubTab === 'speak_missing' && currentDrill && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Mode Filter Bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-blue-100 shadow-2xs flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 pl-2">
              Lượt nói: <strong>{(currentDrillIndex % roleplayList.length) + 1} / {roleplayList.length}</strong>
            </span>

            <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-xl">
              <button
                onClick={() => {
                  setMissingFilter('all');
                  setCurrentDrillIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  missingFilter === 'all' ? 'bg-blue-700 text-white shadow-xs' : 'text-blue-800 hover:bg-blue-100'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => {
                  setMissingFilter('question');
                  setCurrentDrillIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  missingFilter === 'question' ? 'bg-blue-700 text-white shadow-xs' : 'text-blue-800 hover:bg-blue-100'
                }`}
              >
                ❓ Bé nói Câu Hỏi
              </button>
              <button
                onClick={() => {
                  setMissingFilter('answer');
                  setCurrentDrillIndex(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  missingFilter === 'answer' ? 'bg-blue-700 text-white shadow-xs' : 'text-blue-800 hover:bg-blue-100'
                }`}
              >
                💬 Bé nói Câu Trả Lời
              </button>
            </div>
          </div>

          {/* Interactive Roleplay Voice Studio Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200 shadow-lg space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block">
                {currentDrill.missingRole === 'question'
                  ? '🎯 THỬ THÁCH: BÉ HÃY NÓI CÂU HỎI PHÙ HỢP'
                  : '🎯 THỬ THÁCH: BÉ HÃY NÓI CÂU TRẢ LỜI PHÙ HỢP'}
              </span>
              <p className="text-xs text-slate-500 pt-1">
                Lắng nghe đối tác, quan sát phần còn thiếu, rồi bấm Micro để nói to câu tiếng Anh nhé!
              </p>
            </div>

            {/* Conversation Flow Display */}
            <div className="space-y-4 max-w-xl mx-auto pt-2">
              {/* Turn 1: Partner Bubble (Given) */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-300 text-blue-950 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  ⚽
                </div>

                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-3xl rounded-tl-xs p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-800">
                      {currentDrill.partnerRole} nói:
                    </span>
                    <button
                      onClick={() => handleSpeak(currentDrill.partnerPrompt)}
                      className="p-1.5 rounded-xl bg-white hover:bg-blue-200 text-blue-700 transition"
                      title="Bấm nghe bạn nói"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-base md:text-lg font-black text-blue-950">
                    &quot;{currentDrill.partnerPrompt}&quot;
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    👉 {currentDrill.partnerPromptVi}
                  </div>
                </div>
              </div>

              {/* Turn 2: Student Missing Turn Bubble */}
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-700 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  👦
                </div>

                <div className="flex-1 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-dashed border-blue-300 rounded-3xl rounded-tr-xs p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-900">
                      {currentDrill.missingRole === 'question' ? '❓ Phần câu hỏi của bé:' : '💬 Phần trả lời của bé:'}
                    </span>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 transition"
                    >
                      {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showHint ? 'Ẩn câu mẫu' : 'Xem câu mẫu'}</span>
                    </button>
                  </div>

                  {showHint ? (
                    <div className="bg-white p-3 rounded-2xl border border-blue-200 text-center space-y-1 animate-fade-in">
                      <div className="text-base md:text-lg font-black text-blue-950">
                        &quot;{currentDrill.targetUtterance}&quot;
                      </div>
                      <div className="text-xs text-blue-700 font-semibold italic">
                        👉 {currentDrill.targetUtteranceVi}
                      </div>
                      <button
                        onClick={() => handleSpeak(currentDrill.targetUtterance)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline pt-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe đọc mẫu câu này</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1 select-none">
                      <div className="text-lg font-black text-blue-300 tracking-wider">
                        [ ? ? ? ? ? ]
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        (Hãy bấm Micro bên dưới và nói câu cần điền)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mic Speaking Action Center */}
            <div className="flex flex-col items-center justify-center space-y-3 pt-3">
              {!isRecording ? (
                <button
                  onClick={handleStartSpeaking}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-cyan-700 hover:from-blue-800 hover:to-cyan-800 text-white flex items-center justify-center shadow-xl transform hover:scale-105 active:scale-95 transition border-4 border-blue-200 group"
                  title="Bấm để nói vào mic"
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
                    Zero đang nghe giọng bé nói... Hãy nói to rõ ràng nhé!
                  </span>
                ) : (
                  <span>Chạm vào nút Micro và nói câu: <strong>&quot;{currentDrill.targetUtterance}&quot;</strong></span>
                )}
              </div>
            </div>

            {/* Error prompt */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs text-center font-medium max-w-md mx-auto">
                {errorMessage}
              </div>
            )}

            {/* Speech Assessment Feedback */}
            {speechResult && (
              <div className="bg-blue-50 rounded-3xl p-5 border-2 border-blue-200 max-w-md mx-auto text-center space-y-3 animate-pop-in">
                <div className="text-xl font-black text-blue-950 font-['Fredoka',sans-serif]">
                  Điểm phát âm: {speechResult.score}/100
                </div>

                <div className="text-xs text-slate-600">
                  Zero nghe được bé nói: &quot;<strong className="text-blue-900">{speechResult.recognizedText}</strong>&quot;
                </div>

                {/* Word Highlight Analysis */}
                <div className="bg-white p-3 rounded-2xl border border-blue-100 space-y-1.5">
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {currentDrill.targetUtterance.split(/\s+/).map((w, wIdx) => {
                      const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const cleanSpoken = speechResult.recognizedText.toLowerCase();
                      const isMatched = cleanSpoken.includes(cleanWord);

                      return (
                        <span
                          key={wIdx}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                            isMatched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                          <span>{w}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs font-bold text-blue-900">
                  {speechResult.feedback}
                </div>
              </div>
            )}

            {/* Explanation box */}
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-0.5 max-w-lg mx-auto">
              <span className="font-extrabold text-amber-800 block">💡 Ghi nhớ của Zero:</span>
              <p>{currentDrill.explanation}</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-blue-100 max-w-lg mx-auto">
              <button
                onClick={handlePrevDrill}
                className="px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-800 font-bold text-xs transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <button
                onClick={handleStartSpeaking}
                className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nói lại</span>
              </button>

              <button
                onClick={handleNextDrill}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow transition flex items-center gap-1"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DIALOGUE ORDERING (SẮP XẾP HỘI THOẠI) */}
      {activeSubTab === 'dialogue_order' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Sắp xếp hội thoại logic
              </span>
              <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-blue-950 mt-1">
                {dialogueData.title}
              </h3>
            </div>

            <button
              onClick={handleResetDialogue}
              className="px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-700 text-xs font-bold transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xếp lại từ đầu</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            💡 <strong>Hướng dẫn:</strong> Chạm vào các câu thoại bên dưới theo đúng trình tự từ câu 1 đến câu 4 của đoạn hội thoại đối đáp.
          </p>

          {/* User Order Sequence Display */}
          <div className="space-y-2.5 min-h-[160px] bg-blue-50/50 p-4 rounded-2xl border-2 border-dashed border-blue-200">
            {orderedIndices.map((origIdx, pos) => {
              const item = dialogueData.items[origIdx];
              return (
                <div
                  key={pos}
                  onClick={() => handlePickDialogueItem(origIdx)}
                  className="p-3 rounded-xl bg-white border border-blue-200 hover:border-rose-400 cursor-pointer shadow-xs transition flex items-center justify-between gap-3 animate-pop-in group"
                  title="Chạm để gỡ câu này"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {pos + 1}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-blue-950">
                        <strong>{item.speaker}:</strong> &quot;{item.textEn}&quot;
                      </div>
                      <div className="text-xs text-slate-500 italic">👉 {item.textVi}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(`${item.speaker}: ${item.textEn}`);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-200 text-blue-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {orderedIndices.length === 0 && (
              <div className="text-center text-xs text-slate-400 py-8 italic">
                (Chưa có câu nào được chọn. Hãy chọn câu đầu tiên bên dưới)
              </div>
            )}
          </div>

          {/* Status Message */}
          {dialogueChecked === true && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-emerald-900 text-xs md:text-sm space-y-1 animate-bounce">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Xuất sắc! Bé đã xếp đúng 100% trật tự cuộc hội thoại! (+30 XP &amp; +4 ⭐)</span>
              </div>
              <p>Zero đang đọc lại toàn bộ đoạn hội thoại mẫu cho bé nghe nhé!</p>
            </div>
          )}

          {dialogueChecked === false && (
            <div className="text-sm font-bold text-rose-500 flex items-center justify-center gap-1.5">
              <XCircle className="w-5 h-5" />
              <span>Thứ tự hội thoại chưa đúng rồi! Bé bấm &quot;Xếp lại từ đầu&quot; để thử lại nhé!</span>
            </div>
          )}

          {/* Unselected Dialogue Items Bank */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-600 block">
              Các lượt thoại chưa chọn (Chạm để thêm vào mạch hội thoại):
            </span>
            <div className="grid gap-2">
              {dialogueData.items.map((item, idx) => {
                const isAlreadyPicked = orderedIndices.includes(idx);
                if (isAlreadyPicked) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => handlePickDialogueItem(idx)}
                    className="p-3.5 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 text-left transition shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md inline-block mb-1">
                        {item.speaker}
                      </span>
                      <div className="text-sm font-bold text-slate-800">&quot;{item.textEn}&quot;</div>
                      <div className="text-xs text-slate-500 italic mt-0.5">👉 {item.textVi}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              disabled={orderedIndices.length !== dialogueData.items.length || dialogueChecked === true}
              onClick={handleCheckDialogue}
              className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-extrabold text-sm shadow transition"
            >
              Kiểm Tra Trật Tự Hội Thoại
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DRILLED QUESTIONS (TRẮC NGHIỆM HỎI ĐÁP) */}
      {activeSubTab === 'drills' && (
        <div className="grid gap-6 max-w-2xl mx-auto">
          {unit.communication.map((ex, idx) => {
            const isAnswered = submitted[ex.id];
            const selectedIdx = selectedOptions[ex.id];

            return (
              <div
                key={ex.id}
                className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                    Bài tập {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Hỏi &amp; Đáp chuẩn SGK</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm md:text-base text-blue-950">
                    {ex.instruction}
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs md:text-sm space-y-1">
                    <span className="text-blue-700 font-bold block">{ex.givenLabel}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-blue-950">&quot;{ex.prompt}&quot;</span>
                      <button
                        onClick={() => handleSpeak(ex.prompt)}
                        className="p-1.5 rounded-lg bg-white text-blue-700 hover:bg-blue-100 shadow-2xs"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-600">{ex.targetLabel}</div>

                <div className="grid gap-2.5">
                  {ex.options.map((opt, optIdx) => {
                    const isSelected = selectedIdx === optIdx;
                    const isCorrect = optIdx === ex.correctIndex;

                    let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-300';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-xs';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 border-rose-500 text-white font-extrabold';
                      } else {
                        btnStyle = 'opacity-40 bg-slate-50 border-slate-200';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectDrill(ex.id, optIdx, isCorrect)}
                        className={`p-3.5 rounded-2xl border-2 text-left font-semibold text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-blue-900 animate-fade-in space-y-1">
                    <span className="font-bold">💡 Giải thích của Zero Mbappe:</span>
                    <p>{ex.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
