import { MockExam, ExamQuestion } from '../types';

/**
 * Đề thi theo giáo trình Family and Friends 1.
 * Gồm 3 đề: Mini (Starter + Unit 1), Giữa kỳ (Starter – Unit 6), Cuối kỳ (Unit 7 – 12).
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
    title: 'Đề Giữa Kỳ: Starter – Unit 6',
    subtitle: 'Ôn tập chào hỏi, trường học, đồ chơi, cơ thể, gia đình, công viên và đồ dùng (Family and Friends 1)',
    semester: 1,
    level: 'Giữa Học Kỳ',
    durationMinutes: 20,
    totalQuestions: 15,
    questions: [
      L('mid_q1', "I'm seven.", 'Nghe và chọn số tuổi đúng', ['Five', 'Six', 'Seven', 'Eight'], 2, '"Seven" là số 7.'),
      L('mid_q2', "Is this your teddy?", 'Nghe và chọn đồ vật được hỏi', ['Gấu bông', 'Quả bóng', 'Con diều', 'Búp bê'], 0, '"Teddy" là gấu bông.'),
      L('mid_q3', 'These are my legs.', 'Nghe và chọn bộ phận cơ thể', ['Cánh tay', 'Đôi chân', 'Đôi tai', 'Ngón tay'], 1, '"Legs" là đôi chân.'),
      L('mid_q4', "He's my dad.", 'Nghe và chọn người trong gia đình', ['Mẹ', 'Ông', 'Bố', 'Anh trai'], 2, '"Dad" là bố.'),
      L('mid_q5', "It's under the tree.", 'Nghe và chọn vị trí', ['Trong cây', 'Dưới cây', 'Trên cây', 'Cạnh cây'], 1, '"Under" nghĩa là ở dưới.'),
      V('mid_q6', 'Từ "robot" có nghĩa là gì?', ['Xe đạp', 'Máy bay', 'Người máy', 'Tàu hỏa'], 2, '"Robot" là người máy.'),
      V('mid_q7', 'Từ "grandma" có nghĩa là gì?', ['Bà', 'Ông', 'Mẹ', 'Chị gái'], 0, '"Grandma" là bà.'),
      V('mid_q8', 'Từ nào là bộ phận của cơ thể?', ['kite', 'nose', 'bench', 'umbrella'], 1, '"Nose" là cái mũi.'),
      V('mid_q9', 'Từ "umbrella" có nghĩa là gì?', ['Cái mũ', 'Cái ô', 'Điện thoại', 'Cái cốc'], 1, '"Umbrella" là cái ô.'),
      G('mid_q10', 'These ____ my arms.', ['is', 'are', 'am', 'be'], 1, '"These" là số nhiều nên đi với "are".'),
      G('mid_q11', 'Is she a teacher? Yes, she ____.', ['are', 'am', 'is', 'do'], 2, 'Với "she" trả lời "she is".'),
      G('mid_q12', 'Where ____ the ball? It\'s in the net.', ['is', 'are', 'am', 'do'], 0, 'Một quả bóng nên dùng "Where is".'),
      G('mid_q13', 'This is ____ book.', ['Mum', 'Mum\'s', 'Mums', 'Mum is'], 1, 'Đồ của mẹ thêm \'s: Mum\'s book.'),
      R('mid_q14', "Hello! I'm Milly. This is my family. This is my mum. She's a teacher. This is my baby brother. He's one.", 'Who is the teacher?', ["Milly's dad", "Milly's mum", "Milly's brother", "Milly's grandma"], 1, 'Trong bài: "This is my mum. She\'s a teacher."'),
      R('mid_q15', "This is Grandpa's hat. It's old and big. This is Grandma's bag. It's new.", "What's new?", ["Grandpa's hat", "Grandma's bag", "Grandpa's bag", "Grandma's hat"], 1, 'Trong bài: "Grandma\'s bag. It\'s new."'),
    ],
  },

  {
    id: 'exam_final_ef1',
    title: 'Đề Cuối Kỳ: Unit 7 – 12',
    subtitle: 'Ôn tập quần áo, ngôi nhà, thức ăn, khuôn mặt, con vật và quán ăn (Family and Friends 1)',
    semester: 2,
    level: 'Cuối Học Kỳ',
    durationMinutes: 25,
    totalQuestions: 20,
    questions: [
      L('fin_q1', "He's wearing an orange T-shirt.", 'Nghe và chọn món quần áo', ['Áo phông', 'Váy', 'Quần dài', 'Tất'], 0, '"T-shirt" là áo phông.'),
      L('fin_q2', "She's in the kitchen.", 'Nghe và chọn nơi bạn nữ đang ở', ['Phòng ngủ', 'Phòng tắm', 'Nhà bếp', 'Khu vườn'], 2, '"Kitchen" là nhà bếp.'),
      L('fin_q3', "I've got an apple.", 'Nghe và chọn món ăn', ['Quả chuối', 'Quả táo', 'Quả cam', 'Quả trứng'], 1, '"Apple" là quả táo.'),
      L('fin_q4', "She's got long brown hair.", 'Nghe và chọn đặc điểm', ['Tóc dài màu nâu', 'Tóc ngắn màu đen', 'Mắt xanh lá', 'Mắt xanh dương'], 0, '"Long brown hair" là tóc dài màu nâu.'),
      L('fin_q5', 'I like elephants.', 'Nghe và chọn con vật', ['Hổ', 'Rắn', 'Voi', 'Khỉ'], 2, '"Elephants" là những con voi.'),
      L('fin_q6', 'I like ice cream.', 'Nghe và chọn món ăn bạn ấy thích', ['Pizza', 'Kem', 'Rau trộn', 'Sữa chua'], 1, '"Ice cream" là kem.'),
      V('fin_q7', 'Từ "skirt" có nghĩa là gì?', ['Quần soóc', 'Đôi giày', 'Chân váy', 'Áo khoác'], 2, '"Skirt" là chân váy.'),
      V('fin_q8', 'Từ "bedroom" có nghĩa là gì?', ['Phòng tắm', 'Phòng ngủ', 'Phòng khách', 'Nhà bếp'], 1, '"Bedroom" là phòng ngủ.'),
      V('fin_q9', 'Từ nào là một loại nước uống?', ['cheese', 'bread', 'juice', 'cake'], 2, '"Juice" là nước ép.'),
      V('fin_q10', 'Từ "giraffe" có nghĩa là gì?', ['Ngựa vằn', 'Hà mã', 'Hươu cao cổ', 'Cá sấu'], 2, '"Giraffe" là hươu cao cổ.'),
      V('fin_q11', 'Từ "hungry" có nghĩa là gì?', ['Khát nước', 'Đói', 'Mệt', 'Vui'], 1, '"Hungry" là đói.'),
      G('fin_q12', 'Are these his shorts? Yes, they ____.', ['is', 'am', 'are', 'do'], 2, 'Với "they" dùng "are".'),
      G('fin_q13', 'Is she in the garden? No, she ____.', ['aren\'t', 'isn\'t', 'haven\'t', 'don\'t'], 1, 'Với "she" dùng "isn\'t".'),
      G('fin_q14', 'I\'ve got ____ egg.', ['a', 'an', 'some a', 'the a'], 1, 'Trước nguyên âm "e" dùng "an".'),
      G('fin_q15', 'She ____ got brown eyes.', ['have', 'hasn\'t', 'haven\'t', 'has'], 3, 'Với "she" dùng "has got".'),
      G('fin_q16', 'Do you ____ yogurt?', ['likes', 'like', 'liking', 'is like'], 1, 'Sau "Do you" động từ giữ nguyên: like.'),
      R('fin_q17', "Hello! I'm Andy. This is my flat. Mum's in the kitchen. Dad's in the living room. Grandpa's in the garden.", "Where's Dad?", ['In the kitchen', 'In the garden', 'In the living room', 'In the bedroom'], 2, 'Trong bài: "Dad\'s in the living room."'),
      R('fin_q18', "Hello! I'm Katie. I've got long brown hair. I've got green eyes. My brother's got short black hair. He's got brown eyes.", "What colour are Katie's eyes?", ['Brown', 'Green', 'Black', 'Blue'], 1, 'Trong bài: "I\'ve got green eyes."'),
      R('fin_q19', "I've got a long neck. I've got four long legs. I like leaves. I'm tall. What am I? I'm a giraffe!", 'What animal is it?', ['An elephant', 'A zebra', 'A giraffe', 'A hippo'], 2, 'Trong bài: "I\'m a giraffe!"'),
      R('fin_q20', "Sally and Emma are at the café. Sally likes pizza. Emma likes burgers and chips. They don't like salad.", 'What does Emma like?', ['Pizza', 'Salad', 'Burgers and chips', 'Yogurt'], 2, 'Trong bài: "Emma likes burgers and chips."'),
    ],
  },
];
