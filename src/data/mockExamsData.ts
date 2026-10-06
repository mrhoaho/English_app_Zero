import { MockExam, ExamQuestion } from '../types';

/**
 * Đề thi theo giáo trình Family and Friends 1.
 * Gồm 3 đề: Mini (Starter + Unit 1), Giữa kỳ (Starter – Unit 7), Cuối kỳ (Unit 8 – 15).
 */

const L = (id: string, audio: string, question: string, options: string[], c: number, e: string): ExamQuestion => ({
  id, skill: 'listening', question: `${question} (Bấm loa để nghe):`, audioPrompt: audio, options, correctIndex: c, explanation: e,
});
const V = (id: string, question: string, options: string[], c: number, e: string): ExamQuestion => ({
  id, skill: 'vocab', question, options, correctIndex: c, explanation: e,
});
const G = (id: string, question: string, options: string[], c: number, e: string): ExamQuestion => ({
  id, skill: 'grammar', question, options, correctIndex: c, explanation: e,
});
const R = (id: string, passage: string, question: string, options: string[], c: number, e: string): ExamQuestion => ({
  id, skill: 'reading', passage, question, options, correctIndex: c, explanation: e,
});

export const MOCK_EXAMS_DATA: MockExam[] = [
  {
    id: 'exam_mini_starter_u1',
    title: 'Đề Mini: Starter + Unit 1',
    subtitle: "Kiểm tra nhanh chào hỏi, số đếm, màu sắc và đồ dùng học tập (Family and Friends 1)",
    semester: 1,
    level: 'Đề Mini',
    durationMinutes: 10,
    totalQuestions: 10,
    questions: [
      {
        id: 'm1_q1',
        skill: 'listening',
        question: 'Nghe và chọn tên của bạn nữ (Bấm loa để nghe):',
        audioPrompt: "Hello. My name's Rosy.",
        options: ['Tim', 'Rosy', 'Billy', 'Emma'],
        correctIndex: 1,
        explanation: 'Bạn nữ nói: "My name\'s Rosy."',
      },
      {
        id: 'm1_q2',
        skill: 'listening',
        question: 'Nghe và chọn số tuổi đúng (Bấm loa để nghe):',
        audioPrompt: "I'm seven.",
        options: ['Six', 'Eight', 'Seven', 'Ten'],
        correctIndex: 2,
        explanation: '"Seven" nghĩa là số 7, nên bạn ấy bảy tuổi.',
      },
      {
        id: 'm1_q3',
        skill: 'listening',
        question: 'Nghe và chọn đồ vật đúng (Bấm loa để nghe):',
        audioPrompt: "It's a ruler.",
        options: ['pen', 'ruler', 'rubber', 'book'],
        correctIndex: 1,
        explanation: 'Bạn nói: "It\'s a ruler." (Đây là cái thước kẻ).',
      },
      {
        id: 'm1_q4',
        skill: 'listening',
        question: 'Nghe và chọn việc cần làm (Bấm loa để nghe):',
        audioPrompt: 'Open the window.',
        options: ['Mở cửa sổ', 'Đóng cửa ra vào', 'Mở quyển sách', 'Đóng cặp sách'],
        correctIndex: 0,
        explanation: '"Open the window" nghĩa là "Hãy mở cửa sổ ra".',
      },
      {
        id: 'm1_q5',
        skill: 'vocab',
        question: 'Từ "pencil" có nghĩa là gì?',
        options: ['Bút chì', 'Bút mực', 'Thước kẻ', 'Cục tẩy'],
        correctIndex: 0,
        explanation: '"Pencil" là bút chì, còn bút mực là "pen".',
      },
      {
        id: 'm1_q6',
        skill: 'vocab',
        question: 'Từ nào là một MÀU SẮC?',
        options: ['pen', 'door', 'pink', 'bag'],
        correctIndex: 2,
        explanation: '"Pink" là màu hồng. Các từ còn lại là đồ vật.',
      },
      {
        id: 'm1_q7',
        skill: 'vocab',
        question: 'Từ nào KHÔNG thuộc nhóm các thứ trong tuần?',
        options: ['Monday', 'Friday', 'seven', 'Sunday'],
        correctIndex: 2,
        explanation: '"Seven" là số 7, còn lại là các thứ trong tuần.',
      },
      {
        id: 'm1_q8',
        skill: 'grammar',
        question: "Cô giáo giơ cái bút mực lên và hỏi: \"What's this?\". Bé trả lời thế nào?",
        options: ["I'm fine, thank you.", "It's a pen.", "My name's Tim.", "I'm six."],
        correctIndex: 1,
        explanation: 'Câu hỏi "What\'s this?" được trả lời bằng "It\'s a ...", ở đây là "It\'s a pen."',
      },
      {
        id: 'm1_q9',
        skill: 'grammar',
        question: 'Chọn câu hỏi phù hợp với câu trả lời: "I\'m seven."',
        options: ["What's your name?", 'How are you?', 'How old are you?', "What's this?"],
        correctIndex: 2,
        explanation: '"I\'m seven" nói về tuổi, nên câu hỏi là "How old are you?".',
      },
      {
        id: 'm1_q10',
        skill: 'reading',
        question: "What colour is Emma's pencil case? (Hộp bút của Emma màu gì?)",
        passage: "My name's Emma. This is my school bag. This is my pencil case. It's green. And this is my blue pen.",
        options: ['Green', 'Blue', 'Pink', 'Red'],
        correctIndex: 0,
        explanation: 'Trong bài: "This is my pencil case. It\'s green."',
      },
    ],
  },

  {
    id: 'exam_midterm_ef1',
    title: 'Đề Giữa Kỳ: Starter – Unit 7',
    subtitle: 'Ôn tập chào hỏi, đồ dùng, đồ chơi, cơ thể, nghề nghiệp, công viên, gia đình và quần áo (Family and Friends 1)',
    semester: 1,
    level: 'Giữa Học Kỳ',
    durationMinutes: 20,
    totalQuestions: 15,
    questions: [
      L('mid_q1', "I'm seven.", 'Nghe và chọn số tuổi đúng', ['Five', 'Six', 'Seven', 'Eight'], 2, '"Seven" là số 7.'),
      L('mid_q2', 'Is this your teddy?', 'Nghe và chọn đồ vật được hỏi', ['Gấu bông', 'Quả bóng', 'Con diều', 'Búp bê'], 0, '"Teddy" là gấu bông.'),
      L('mid_q3', 'These are my legs.', 'Nghe và chọn bộ phận cơ thể', ['Cánh tay', 'Đôi chân', 'Đôi tai', 'Ngón tay'], 1, '"Legs" là đôi chân.'),
      L('mid_q4', "She's a housewife.", 'Nghe và chọn nghề nghiệp', ['Giáo viên', 'Bác sĩ', 'Người nội trợ', 'Phi công'], 2, '"Housewife" là người nội trợ.'),
      L('mid_q5', "It's under the tree.", 'Nghe và chọn vị trí', ['Trong cây', 'Dưới cây', 'Trên cây', 'Cạnh cây'], 1, '"Under" nghĩa là ở dưới.'),
      V('mid_q6', 'Từ "scooter" có nghĩa là gì?', ['Xe đạp', 'Tàu hỏa', 'Xe trượt scooter', 'Ô tô'], 2, '"Scooter" là xe trượt scooter.'),
      V('mid_q7', 'Từ "fireman" có nghĩa là gì?', ['Người đưa thư', 'Lính cứu hỏa', 'Nông dân', 'Cảnh sát'], 1, '"Fireman" là lính cứu hỏa.'),
      V('mid_q8', 'Từ nào là một bộ phận của cơ thể?', ['kite', 'shoulders', 'bench', 'scooter'], 1, '"Shoulders" là hai bờ vai.'),
      V('mid_q9', 'Từ "grandpa" có nghĩa là gì?', ['Bà', 'Ông', 'Mẹ', 'Chị gái'], 1, '"Grandpa" là ông.'),
      V('mid_q10', 'Từ nào là một đồ chơi trong công viên?', ['seesaw', 'pencil', 'door', 'dress'], 0, '"Seesaw" là cái bập bênh.'),
      G('mid_q11', 'Is this ____ teddy? (Hỏi một bạn)', ['my', 'your', 'he', 'it'], 1, 'Hỏi một bạn thì dùng "your" (của bạn).'),
      G('mid_q12', 'Is he a teacher? Yes, he ____.', ['are', 'am', 'is', 'do'], 2, 'Với "he" trả lời "he is".'),
      G('mid_q13', 'Where\'s the ball? It\'s ____ the net.', ['in', 'at', 'is', 'am'], 0, 'Quả bóng nằm trong lưới nên dùng "in".'),
      G('mid_q14', 'Are these ____ socks? (của cô ấy)', ['his', 'her', 'she', 'your is'], 1, 'Với cô ấy dùng "her".'),
      R('mid_q15', "Look. This is Mum's book. And this is Billy's teddy.", "Whose teddy is it?", ["Mum's", "Billy's", "Rosy's", "Tim's"], 1, 'Trong bài: "this is Billy\'s teddy."'),
    ],
  },
  {
    id: 'exam_final_ef1',
    title: 'Đề Cuối Kỳ: Unit 8 – 15',
    subtitle: 'Ôn tập ngôi nhà, hộp cơm trưa, bạn bè, sở thú, đồ ăn, phòng ngủ, động từ và bãi biển (Family and Friends 1)',
    semester: 2,
    level: 'Cuối Học Kỳ',
    durationMinutes: 25,
    totalQuestions: 20,
    questions: [
      L('fin_q1', "She's in the dining room.", 'Nghe và chọn nơi bạn nữ đang ở', ['Phòng ngủ', 'Phòng tắm', 'Phòng ăn', 'Khu vườn'], 2, '"Dining room" là phòng ăn.'),
      L('fin_q2', "I've got an apple.", 'Nghe và chọn món ăn', ['Quả chuối', 'Quả táo', 'Quả cam', 'Quả lê'], 1, '"Apple" là quả táo.'),
      L('fin_q3', "He's got blond hair.", 'Nghe và chọn đặc điểm', ['Tóc vàng hoe', 'Tóc xoăn', 'Tóc dài', 'Mắt nâu'], 0, '"Blond hair" là tóc vàng hoe.'),
      L('fin_q4', 'I like monkeys.', 'Nghe và chọn con vật', ['Hổ', 'Rắn', 'Voi', 'Khỉ'], 3, '"Monkeys" là những con khỉ.'),
      L('fin_q5', "I don't like carrots.", 'Nghe và chọn món bạn ấy không thích', ['Cà rốt', 'Sữa chua', 'Cá', 'Bánh mì'], 0, '"Carrots" là cà rốt.'),
      L('fin_q6', 'There are three pillows.', 'Nghe và chọn số lượng', ['Một cái gối', 'Hai cái gối', 'Ba cái gối', 'Mười cái gối'], 2, '"Three" là số 3.'),
      V('fin_q7', 'Từ "kitchen" có nghĩa là gì?', ['Phòng tắm', 'Phòng ngủ', 'Phòng khách', 'Nhà bếp'], 3, '"Kitchen" là nhà bếp.'),
      V('fin_q8', 'Từ "curly" có nghĩa là gì?', ['Thẳng', 'Xoăn', 'Dài', 'Ngắn'], 1, '"Curly" là xoăn.'),
      V('fin_q9', 'Từ "giraffe" có nghĩa là gì?', ['Ngựa vằn', 'Hà mã', 'Hươu cao cổ', 'Cá sấu'], 2, '"Giraffe" là hươu cao cổ.'),
      V('fin_q10', 'Từ "twenty" là số mấy?', ['12', '15', '19', '20'], 3, '"Twenty" là số 20.'),
      V('fin_q11', 'Từ "sandcastle" có nghĩa là gì?', ['Vỏ sò', 'Con cua', 'Lâu đài cát', 'Cái xô'], 2, '"Sandcastle" là lâu đài cát.'),
      V('fin_q12', 'Từ "swim" có nghĩa là gì?', ['Chạy', 'Bay', 'Leo trèo', 'Bơi'], 3, '"Swim" là bơi.'),
      G('fin_q13', 'Are Dad and Billy in the living room? No, they ____.', ["isn't", "aren't", "haven't", "don't"], 1, 'Hai người nên dùng "they aren\'t".'),
      G('fin_q14', 'I ____ got my lunch box. (không có)', ["haven't", "hasn't", "don't", "isn't"], 0, 'Với "I" dùng "haven\'t got".'),
      G('fin_q15', 'He ____ got blue eyes. (không có)', ["haven't", "hasn't", "doesn't", "isn't"], 1, 'Với "he" dùng "hasn\'t got".'),
      G('fin_q16', 'Can he talk? No, he ____.', ["isn't", "doesn't", "can't", "hasn't"], 2, 'Hỏi "Can he...?" thì trả lời "he can / he can\'t".'),
      G('fin_q17', 'There ____ two beds.', ['is', 'are', 'am', 'be'], 1, 'Hai cái giường là số nhiều nên dùng "There are".'),
      R('fin_q18', "There are three bedrooms. The big bedroom is for my mum and dad. This is my bedroom. Next door is my sister's bedroom.", 'How many bedrooms are there?', ['One', 'Two', 'Three', 'Four'], 2, 'Trong bài: "There are three bedrooms."'),
      R('fin_q19', 'This is a very big cat. It has got orange and black stripes. It can swim. It can climb trees. It is a tiger.', 'What colour are the tiger\'s stripes?', ['Orange and black', 'Blue and green', 'Pink and white', 'Red and yellow'], 0, 'Trong bài: "orange and black stripes".'),
      R('fin_q20', 'The beach is lovely. It is long and sandy. The sea is blue and clean here. We can swim in the sea and go in a boat.', 'What colour is the sea?', ['Green', 'Pink', 'Blue', 'Yellow'], 2, 'Trong bài: "The sea is blue and clean here."'),
    ],
  },
];
