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
      targetUtterance: "No, it isn't.",
      targetUtteranceVi: "Không, không phải.",
      explanation: "Trả lời Yes/No với \"Is this...?\" bằng \"Yes, it is.\" hoặc \"No, it isn't.\"",
    },
    {
      id: 'u2_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "Yes, it is.",
      partnerPromptVi: "Vâng, đúng rồi.",
      targetUtterance: "Is this your teddy?",
      targetUtteranceVi: "Đây có phải gấu bông của bạn không?",
      explanation: "\"Yes, it is.\" ứng với câu hỏi \"Is this...?\"",
    },
    {
      id: 'u2_r3',
      missingRole: 'answer',
      partnerRole: "Holly",
      partnerPrompt: "What's your favourite colour?",
      partnerPromptVi: "Màu bạn thích nhất là gì?",
      targetUtterance: "It's pink.",
      targetUtteranceVi: "Đó là màu hồng.",
      explanation: "Hỏi về màu thì trả lời \"It's\" + màu.",
    },
  ],
  3: [
    {
      id: 'u3_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Point to your arms.",
      partnerPromptVi: "Hãy chỉ vào cánh tay của bạn.",
      targetUtterance: "These are my arms.",
      targetUtteranceVi: "Đây là hai cánh tay của mình.",
      explanation: "Hai cánh tay là số nhiều nên nói \"These are my arms.\"",
    },
    {
      id: 'u3_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "These are my legs.",
      partnerPromptVi: "Đây là hai chân của mình.",
      targetUtterance: "What are these?",
      targetUtteranceVi: "Đây là gì vậy?",
      explanation: "\"These are...\" ứng với câu hỏi \"What are these?\"",
    },
    {
      id: 'u3_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Put it on your arms, your nose, your face and your legs.",
      partnerPromptVi: "Hãy thoa lên tay, mũi, mặt và chân của bạn.",
      targetUtterance: "OK, Rosy.",
      targetUtteranceVi: "Được, Rosy.",
      explanation: "Khi bạn nhờ làm việc gì thì đáp \"OK\" rồi làm theo.",
    },
  ],
  4: [
    {
      id: 'u4_r1',
      missingRole: 'answer',
      partnerRole: "Grandpa",
      partnerPrompt: "Look! Is Billy a teacher?",
      partnerPromptVi: "Nhìn kìa! Billy có phải giáo viên không?",
      targetUtterance: "Yes, he is.",
      targetUtteranceVi: "Vâng, đúng vậy.",
      explanation: "Hỏi về \"Billy\" (nam) thì trả lời \"he is\".",
    },
    {
      id: 'u4_r2',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "Is Grandma a teacher?",
      partnerPromptVi: "Bà có phải giáo viên không?",
      targetUtterance: "No, she isn't. She's a housewife.",
      targetUtteranceVi: "Không, bà không phải. Bà là người nội trợ.",
      explanation: "Bà là nữ nên dùng \"she isn't\".",
    },
    {
      id: 'u4_r3',
      missingRole: 'question',
      partnerRole: "Rosy",
      partnerPrompt: "No, he isn't. But he is a hero!",
      partnerPromptVi: "Không, ông không phải. Nhưng ông là một người hùng!",
      targetUtterance: "Is he a fireman?",
      targetUtteranceVi: "Ông ấy có phải lính cứu hỏa không?",
      explanation: "\"he isn't\" ứng với câu hỏi \"Is he...?\"",
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
      partnerRole: "Dad",
      partnerPrompt: "No, it isn't.",
      partnerPromptVi: "Không, không phải.",
      targetUtterance: "Is it under the seesaw?",
      targetUtteranceVi: "Có phải nó ở dưới bập bênh không?",
      explanation: "\"No, it isn't.\" ứng với câu hỏi \"Is it...?\"",
    },
    {
      id: 'u5_r3',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "Where's the girl?",
      partnerPromptVi: "Bạn nữ ở đâu?",
      targetUtterance: "She's under the tree.",
      targetUtteranceVi: "Bạn ấy ở dưới gốc cây.",
      explanation: "Một bạn nữ nên dùng \"She's\".",
    },
  ],
  6: [
    {
      id: 'u6_r1',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "I don't know.",
      partnerPromptVi: "Mình không biết.",
      targetUtterance: "But where are they?",
      targetUtteranceVi: "Nhưng họ ở đâu nhỉ?",
      explanation: "Rosy hỏi \"But where are they?\" và Tim đáp \"I don't know.\"",
    },
    {
      id: 'u6_r2',
      missingRole: 'answer',
      partnerRole: "Mum",
      partnerPrompt: "Look, ice creams for you!",
      partnerPromptVi: "Nhìn này, kem cho các con đây!",
      targetUtterance: "Ah, thank you!",
      targetUtteranceVi: "À, cảm ơn mẹ!",
      explanation: "Khi nhận quà thì nói lời cảm ơn.",
    },
    {
      id: 'u6_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Who's this?",
      partnerPromptVi: "Đây là ai vậy?",
      targetUtterance: "It's Beth's dad.",
      targetUtteranceVi: "Đó là bố của Beth.",
      explanation: "Hỏi người thì trả lời bằng tên + 's + người thân.",
    },
  ],
  7: [
    {
      id: 'u7_r1',
      missingRole: 'answer',
      partnerRole: "Dad",
      partnerPrompt: "Are these her socks?",
      partnerPromptVi: "Đây có phải tất của cô ấy không?",
      targetUtterance: "Yes, they are.",
      targetUtteranceVi: "Vâng, đúng rồi.",
      explanation: "Hỏi \"Are these...?\" thì trả lời \"Yes, they are.\"",
    },
    {
      id: 'u7_r2',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Is this Billy's T-shirt?",
      partnerPromptVi: "Đây có phải áo phông của Billy không?",
      targetUtterance: "Yes, it is.",
      targetUtteranceVi: "Vâng, đúng rồi.",
      explanation: "Một chiếc áo nên trả lời \"it is\".",
    },
    {
      id: 'u7_r3',
      missingRole: 'answer',
      partnerRole: "Dad",
      partnerPrompt: "Are these his trousers?",
      partnerPromptVi: "Đây có phải quần dài của cậu ấy không?",
      targetUtterance: "No, they aren't. They're my shorts!",
      targetUtteranceVi: "Không phải. Chúng là quần soóc của mình!",
      explanation: "Số nhiều nên trả lời \"they aren't\".",
    },
  ],
  8: [
    {
      id: 'u8_r1',
      missingRole: 'question',
      partnerRole: "Mum",
      partnerPrompt: "No, she isn't.",
      partnerPromptVi: "Không, bà không ở đó.",
      targetUtterance: "Is she in the kitchen?",
      targetUtteranceVi: "Bà có ở trong bếp không?",
      explanation: "\"she isn't\" ứng với câu hỏi \"Is she...?\"",
    },
    {
      id: 'u8_r2',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Where's Grandma?",
      partnerPromptVi: "Bà ở đâu?",
      targetUtterance: "She's in the dining room.",
      targetUtteranceVi: "Bà ở trong phòng ăn.",
      explanation: "Hỏi \"Where's Grandma?\" thì trả lời \"She's in the...\"",
    },
    {
      id: 'u8_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Are Dad and Billy in the living room?",
      partnerPromptVi: "Bố và Billy có ở trong phòng khách không?",
      targetUtterance: "No, they aren't.",
      targetUtteranceVi: "Không, họ không ở đó.",
      explanation: "Hai người nên trả lời \"they aren't\".",
    },
  ],
  9: [
    {
      id: 'u9_r1',
      missingRole: 'answer',
      partnerRole: "Miss Jones",
      partnerPrompt: "Where's your lunch box?",
      partnerPromptVi: "Hộp cơm trưa của em đâu?",
      targetUtterance: "Oh no! I haven't got my lunch box.",
      targetUtteranceVi: "Ôi không! Em không có hộp cơm trưa.",
      explanation: "Không có thì nói \"I haven't got...\"",
    },
    {
      id: 'u9_r2',
      missingRole: 'answer',
      partnerRole: "Tim",
      partnerPrompt: "I've got an apple. And I've got a banana. Choose one.",
      partnerPromptVi: "Mình có một quả táo. Và mình có một quả chuối. Hãy chọn một.",
      targetUtterance: "Thanks. The apple, please.",
      targetUtteranceVi: "Cảm ơn. Cho mình quả táo nhé.",
      explanation: "Chọn một món rồi nói \"The apple, please.\"",
    },
    {
      id: 'u9_r3',
      missingRole: 'question',
      partnerRole: "Rosy",
      partnerPrompt: "Yes, I have.",
      partnerPromptVi: "Vâng, mình có.",
      targetUtterance: "Have you got a banana?",
      targetUtteranceVi: "Bạn có chuối không?",
      explanation: "\"Yes, I have.\" ứng với \"Have you got...?\"",
    },
  ],
  10: [
    {
      id: 'u10_r1',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "I've got a new friend. Look, this is Alice with her teddy.",
      partnerPromptVi: "Mình có một người bạn mới. Nhìn này, đây là Alice với gấu bông của bạn ấy.",
      targetUtterance: "She's got curly hair.",
      targetUtteranceVi: "Bạn ấy có tóc xoăn.",
      explanation: "Mô tả một bạn nữ bằng \"She's got...\"",
    },
    {
      id: 'u10_r2',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "We're brother and sister.",
      partnerPromptVi: "Chúng mình là anh em.",
      targetUtterance: "Are you friends?",
      targetUtteranceVi: "Các bạn là bạn bè à?",
      explanation: "Trả lời \"We're brother and sister.\" cho câu hỏi \"Are you friends?\"",
    },
    {
      id: 'u10_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "She's got blond hair. Who is it?",
      partnerPromptVi: "Bạn ấy có tóc vàng hoe. Là ai vậy?",
      targetUtterance: "It's number 1.",
      targetUtteranceVi: "Là số 1.",
      explanation: "Trả lời bằng số thứ tự của bức hình.",
    },
  ],
  11: [
    {
      id: 'u11_r1',
      missingRole: 'answer',
      partnerRole: "Mum",
      partnerPrompt: "Do you like elephants, Billy?",
      partnerPromptVi: "Billy, con có thích voi không?",
      targetUtterance: "No, I don't. They're big!",
      targetUtteranceVi: "Không ạ. Chúng to quá!",
      explanation: "Không thích thì nói \"No, I don't.\"",
    },
    {
      id: 'u11_r2',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Do you like monkeys?",
      partnerPromptVi: "Bạn có thích khỉ không?",
      targetUtterance: "Yes, I do. They're little and funny.",
      targetUtteranceVi: "Có, mình thích. Chúng nhỏ và vui nhộn.",
      explanation: "Thích thì nói \"Yes, I do.\"",
    },
    {
      id: 'u11_r3',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "It's an elephant.",
      partnerPromptVi: "Đó là con voi.",
      targetUtterance: "It's grey. It's got big ears. What is it?",
      targetUtteranceVi: "Nó màu xám. Nó có tai to. Nó là con gì?",
      explanation: "Trả lời \"It's an elephant.\" cho câu đố đoán con vật.",
    },
  ],
  12: [
    {
      id: 'u12_r1',
      missingRole: 'answer',
      partnerRole: "Mum",
      partnerPrompt: "Do you like carrots, Billy?",
      partnerPromptVi: "Billy, con có thích cà rốt không?",
      targetUtterance: "No, I don't. No carrots for me!",
      targetUtteranceVi: "Không ạ. Con không ăn cà rốt!",
      explanation: "Không thích thì nói \"No, I don't.\"",
    },
    {
      id: 'u12_r2',
      missingRole: 'question',
      partnerRole: "Billy",
      partnerPrompt: "Yes, I do!",
      partnerPromptVi: "Có ạ!",
      targetUtterance: "Do you like yogurt?",
      targetUtteranceVi: "Con có thích sữa chua không?",
      explanation: "\"Yes, I do!\" ứng với câu hỏi \"Do you like...?\"",
    },
    {
      id: 'u12_r3',
      missingRole: 'answer',
      partnerRole: "Sally",
      partnerPrompt: "What do you like, Emma?",
      partnerPromptVi: "Bạn thích gì, Emma?",
      targetUtterance: "I like ice cream, too.",
      targetUtteranceVi: "Mình cũng thích kem.",
      explanation: "Hỏi \"What do you like?\" thì trả lời \"I like...\"",
    },
  ],
  13: [
    {
      id: 'u13_r1',
      missingRole: 'answer',
      partnerRole: "Grandma",
      partnerPrompt: "Look, there's a doll on the rug. There are books under the bed.",
      partnerPromptVi: "Nhìn kìa, có một con búp bê trên thảm. Có những quyển sách dưới giường.",
      targetUtterance: "Sorry. I can tidy up.",
      targetUtteranceVi: "Xin lỗi bà. Con dọn dẹp được ạ.",
      explanation: "Xin lỗi rồi nói \"I can tidy up.\"",
    },
    {
      id: 'u13_r2',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "How many blankets?",
      partnerPromptVi: "Có mấy cái chăn?",
      targetUtterance: "There's one blanket.",
      targetUtteranceVi: "Có một cái chăn.",
      explanation: "Một cái nên dùng \"There's one blanket.\"",
    },
    {
      id: 'u13_r3',
      missingRole: 'question',
      partnerRole: "Jamie",
      partnerPrompt: "I have got twelve books on my shelf.",
      partnerPromptVi: "Mình có mười hai quyển sách trên kệ.",
      targetUtterance: "How many books have you got on your shelf?",
      targetUtteranceVi: "Bạn có bao nhiêu quyển sách trên kệ?",
      explanation: "Trả lời bằng số lượng nên hỏi \"How many...?\"",
    },
  ],
  14: [
    {
      id: 'u14_r1',
      missingRole: 'question',
      partnerRole: "Tim",
      partnerPrompt: "Yes, he can.",
      partnerPromptVi: "Được, cậu ấy chơi được.",
      targetUtterance: "Can he play football?",
      targetUtteranceVi: "Cậu ấy chơi bóng đá được không?",
      explanation: "\"Yes, he can.\" ứng với \"Can he...?\"",
    },
    {
      id: 'u14_r2',
      missingRole: 'answer',
      partnerRole: "Billy",
      partnerPrompt: "Look, Tim. Action Boy can fly.",
      partnerPromptVi: "Nhìn này, Tim. Action Boy biết bay.",
      targetUtterance: "Great! Can he play football?",
      targetUtteranceVi: "Tuyệt! Cậu ấy chơi bóng đá được không?",
      explanation: "Khen rồi hỏi tiếp khả năng của Action Boy.",
    },
    {
      id: 'u14_r3',
      missingRole: 'answer',
      partnerRole: "Rosy",
      partnerPrompt: "Can he talk?",
      partnerPromptVi: "Cậu ấy nói được không?",
      targetUtterance: "No, he can't.",
      targetUtteranceVi: "Không, cậu ấy không nói được.",
      explanation: "Đồ chơi không nói được nên trả lời \"No, he can't.\"",
    },
  ],
  15: [
    {
      id: 'u15_r1',
      missingRole: 'answer',
      partnerRole: "Dad",
      partnerPrompt: "Come on. Let's make a sandcastle!",
      partnerPromptVi: "Nào. Cùng làm lâu đài cát!",
      targetUtterance: "That's a good idea.",
      targetUtteranceVi: "Ý hay đấy.",
      explanation: "Đồng ý lời rủ bằng \"That's a good idea.\"",
    },
    {
      id: 'u15_r2',
      missingRole: 'answer',
      partnerRole: "Grandma",
      partnerPrompt: "Let's play ball, Grandma!",
      partnerPromptVi: "Cùng chơi bóng nào, bà ơi!",
      targetUtterance: "Great! OK!",
      targetUtteranceVi: "Tuyệt! Được thôi!",
      explanation: "Đồng ý lời rủ \"Let's...\" bằng \"Great! OK!\"",
    },
    {
      id: 'u15_r3',
      missingRole: 'answer',
      partnerRole: "Dad",
      partnerPrompt: "Oh no. Sorry!",
      partnerPromptVi: "Ôi không. Xin lỗi!",
      targetUtterance: "It's OK. Let's make another sandcastle together!",
      targetUtteranceVi: "Không sao. Cùng làm một lâu đài cát khác nào!",
      explanation: "Khi bạn xin lỗi, đáp \"It's OK.\"",
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
    title: "Hội thoại: Gấu bông của ai?",
    items: [
      { speaker: "Rosy", textEn: "No, it isn't. This is my pencil case. Look!", textVi: "Không phải. Đây là hộp bút của mình. Nhìn này!" },
      { speaker: "Tim", textEn: "Is this your teddy?", textVi: "Đây có phải gấu bông của bạn không?" },
      { speaker: "Rosy", textEn: "But where's my teddy? Where's Tiny Ted?", textVi: "Nhưng gấu bông của mình đâu? Tiny Ted đâu rồi?" },
      { speaker: "Tim", textEn: "This is your doll. And this is your ball.", textVi: "Đây là búp bê của bạn. Và đây là quả bóng của bạn." },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  3: {
    title: "Hội thoại: Thoa kem chống nắng",
    items: [
      { speaker: "Tim", textEn: "These are my arms.", textVi: "Đây là hai tay của mình." },
      { speaker: "Rosy", textEn: "Let's put on sun cream. First, my arms. Point to your arms.", textVi: "Cùng thoa kem chống nắng nào. Đầu tiên là tay. Hãy chỉ vào tay của bạn." },
      { speaker: "Tim", textEn: "This is my nose.", textVi: "Đây là mũi của mình." },
      { speaker: "Rosy", textEn: "Now, my nose.", textVi: "Giờ đến mũi của mình." },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  4: {
    title: "Hội thoại: Ai làm nghề gì?",
    items: [
      { speaker: "Tim", textEn: "Is Grandma a teacher?", textVi: "Bà có phải giáo viên không?" },
      { speaker: "Grandpa", textEn: "Look! Is Billy a teacher?", textVi: "Nhìn kìa! Billy có phải giáo viên không?" },
      { speaker: "Rosy", textEn: "No, she isn't. She's a housewife.", textVi: "Không. Bà là người nội trợ." },
      { speaker: "Rosy", textEn: "Yes, he is. And Tim is a pupil.", textVi: "Vâng. Còn Tim là học sinh." },
    ],
    correctOrder: [1, 3, 0, 2],
  },
  5: {
    title: "Hội thoại: Tìm quả bóng",
    items: [
      { speaker: "Dad", textEn: "Is it under the seesaw?", textVi: "Có phải nó ở dưới bập bênh không?" },
      { speaker: "Rosy", textEn: "Look! The ball's on the slide.", textVi: "Nhìn kìa! Quả bóng ở trên cầu trượt." },
      { speaker: "Dad", textEn: "Where's the ball?", textVi: "Quả bóng ở đâu?" },
      { speaker: "Tim", textEn: "No, it isn't.", textVi: "Không phải." },
    ],
    correctOrder: [2, 0, 3, 1],
  },
  6: {
    title: "Hội thoại: Tìm bà và mọi người",
    items: [
      { speaker: "Mum", textEn: "Look, ice creams for you!", textVi: "Nhìn này, kem cho các con đây!" },
      { speaker: "Tim", textEn: "I don't know.", textVi: "Mình không biết." },
      { speaker: "Rosy", textEn: "But where are they?", textVi: "Nhưng họ ở đâu nhỉ?" },
      { speaker: "Rosy", textEn: "Let's find Grandma and the others.", textVi: "Cùng đi tìm bà và mọi người nào." },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  7: {
    title: "Hội thoại: Giặt quần áo",
    items: [
      { speaker: "Mum", textEn: "Yes, they are.", textVi: "Vâng, đúng rồi." },
      { speaker: "Dad", textEn: "Are these her socks?", textVi: "Đây có phải tất của cô ấy không?" },
      { speaker: "Dad", textEn: "Yes, it is. Put it in his basket.", textVi: "Đúng rồi. Hãy bỏ vào giỏ của cậu ấy." },
      { speaker: "Mum", textEn: "Is this Billy's T-shirt?", textVi: "Đây có phải áo phông của Billy không?" },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  8: {
    title: "Hội thoại: Bà ở đâu?",
    items: [
      { speaker: "Rosy", textEn: "Are Dad and Billy in the living room?", textVi: "Bố và Billy có ở trong phòng khách không?" },
      { speaker: "Rosy", textEn: "Where's Grandma? Is she in the kitchen?", textVi: "Bà ở đâu? Bà có ở trong bếp không?" },
      { speaker: "Mum", textEn: "No, they aren't.", textVi: "Không, họ không ở đó." },
      { speaker: "Mum", textEn: "No, she isn't.", textVi: "Không, bà không ở đó." },
    ],
    correctOrder: [1, 3, 0, 2],
  },
  9: {
    title: "Hội thoại: Giờ ăn trưa",
    items: [
      { speaker: "Girl", textEn: "Oh no! I haven't got my lunch box.", textVi: "Ôi không! Mình không có hộp cơm trưa." },
      { speaker: "Girl", textEn: "Thank you, Tim.", textVi: "Cảm ơn bạn, Tim." },
      { speaker: "Miss Jones", textEn: "It's lunchtime. Get your lunch boxes.", textVi: "Đến giờ ăn trưa rồi. Hãy lấy hộp cơm của các em." },
      { speaker: "Tim", textEn: "I've got two sandwiches and two drinks. Here you are.", textVi: "Mình có hai cái bánh mì kẹp và hai đồ uống. Của bạn đây." },
    ],
    correctOrder: [2, 0, 3, 1],
  },
  10: {
    title: "Hội thoại: Một người bạn mới",
    items: [
      { speaker: "Adam", textEn: "My new friend is Adam. He's got curly hair too.", textVi: "Bạn mới của mình là Adam. Cậu ấy cũng có tóc xoăn." },
      { speaker: "Rosy", textEn: "Yes. And she's got blue eyes.", textVi: "Đúng. Và bạn ấy có mắt xanh dương." },
      { speaker: "Tim", textEn: "She's got curly hair.", textVi: "Bạn ấy có tóc xoăn." },
      { speaker: "Rosy", textEn: "I've got a new friend. Look, this is Alice with her teddy.", textVi: "Mình có một người bạn mới. Nhìn này, đây là Alice với gấu bông của bạn ấy." },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  11: {
    title: "Hội thoại: Ở sở thú",
    items: [
      { speaker: "Billy", textEn: "Oh no! I don't like elephants. They're big!", textVi: "Ôi không! Mình không thích voi. Chúng to quá!" },
      { speaker: "Rosy", textEn: "The zoo. Great! I like animals. Look at the elephants, Billy.", textVi: "Sở thú. Tuyệt quá! Mình thích động vật. Nhìn những con voi kìa, Billy." },
      { speaker: "Billy", textEn: "Ahh! I don't like giraffes. They're tall!", textVi: "Á! Mình không thích hươu cao cổ. Chúng cao quá!" },
      { speaker: "Rosy", textEn: "Look at the giraffes.", textVi: "Nhìn những con hươu cao cổ kìa." },
    ],
    correctOrder: [1, 0, 3, 2],
  },
  12: {
    title: "Hội thoại: Giờ ăn tối",
    items: [
      { speaker: "Mum", textEn: "What do you like, Billy? Do you like yogurt?", textVi: "Con thích gì, Billy? Con có thích sữa chua không?" },
      { speaker: "Mum", textEn: "Rice, meat and carrots for Billy. Do you like carrots, Billy?", textVi: "Cơm, thịt và cà rốt cho Billy. Con có thích cà rốt không, Billy?" },
      { speaker: "Billy", textEn: "Yes, I do!", textVi: "Có ạ!" },
      { speaker: "Billy", textEn: "No, I don't. No carrots for me!", textVi: "Không ạ. Con không ăn cà rốt!" },
    ],
    correctOrder: [1, 3, 0, 2],
  },
  13: {
    title: "Hội thoại: Dọn phòng",
    items: [
      { speaker: "Rosy", textEn: "Sorry. I can tidy up.", textVi: "Xin lỗi bà. Con dọn dẹp được ạ." },
      { speaker: "Grandma", textEn: "Good girl, Rosy. Well done.", textVi: "Cháu ngoan, Rosy. Làm tốt lắm." },
      { speaker: "Grandma", textEn: "Look, there's a doll on the rug. There are books under the bed.", textVi: "Nhìn kìa, có một con búp bê trên thảm. Có những quyển sách dưới giường." },
      { speaker: "Rosy", textEn: "Look, Grandma. My room is tidy now.", textVi: "Nhìn này bà. Giờ phòng của con gọn gàng rồi." },
    ],
    correctOrder: [2, 0, 3, 1],
  },
  14: {
    title: "Hội thoại: Action Boy",
    items: [
      { speaker: "Tim", textEn: "Look, Rosy. Action Boy can walk. He can run and he can fly.", textVi: "Nhìn này, Rosy. Action Boy biết đi bộ. Cậu ấy biết chạy và biết bay." },
      { speaker: "Tim", textEn: "Look! He can run.", textVi: "Nhìn này! Cậu ấy biết chạy." },
      { speaker: "Uncle", textEn: "Hello. Nice to meet you.", textVi: "Xin chào. Rất vui được gặp cháu." },
      { speaker: "Tim", textEn: "Look at my toy, Uncle. His name's Action Boy.", textVi: "Nhìn đồ chơi của cháu này, chú. Tên của nó là Action Boy." },
    ],
    correctOrder: [3, 2, 1, 0],
  },
  15: {
    title: "Hội thoại: Ở bãi biển",
    items: [
      { speaker: "Mum", textEn: "That's a good idea.", textVi: "Ý hay đấy." },
      { speaker: "Dad", textEn: "Come on. Let's make a sandcastle!", textVi: "Nào. Cùng làm lâu đài cát!" },
      { speaker: "Grandma", textEn: "Great! OK!", textVi: "Tuyệt! Được thôi!" },
      { speaker: "Billy", textEn: "Let's play ball, Grandma!", textVi: "Cùng chơi bóng nào, bà ơi!" },
    ],
    correctOrder: [1, 0, 3, 2],
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
