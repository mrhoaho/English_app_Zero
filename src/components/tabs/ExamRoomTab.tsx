import React, { useState, useEffect } from 'react';
import { UserProfile, MockExam, ExamQuestion, MockExamRecord } from '../../types';
import { MOCK_EXAMS_DATA } from '../../data/mockExamsData';
import { speakEnglish, sfx } from '../../utils/audioUtils';
import { saveExamResult } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Clock,
  Award,
  Trophy,
  CheckCircle2,
  XCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  FileCheck,
  BookOpen,
  ArrowRight,
  Star,
  Check,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ExamRoomTabProps {
  currentUser: UserProfile;
  onAwardPoints: (xp: number, stars: number, key: string) => void;
  onProfileChanged: (newProfile: UserProfile) => void;
}

export const ExamRoomTab: React.FC<ExamRoomTabProps> = ({
  currentUser,
  onAwardPoints,
  onProfileChanged,
}) => {
  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [examResult, setExamResult] = useState<MockExamRecord | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (!selectedExam || isExamFinished || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedExam, isExamFinished, timeLeftSeconds]);

  const handleStartExam = (exam: MockExam) => {
    setSelectedExam(exam);
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeLeftSeconds(exam.durationMinutes * 60);
    setIsExamFinished(false);
    setExamResult(null);
    setShowReview(false);
    sfx.playStar();
  };

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (isExamFinished) return;
    sfx.playStar();
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitExam = () => {
    if (!selectedExam || isExamFinished) return;

    // Calculate score
    let correctCount = 0;
    selectedExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const totalQuestions = selectedExam.questions.length;
    const scoreOutOf10 = Number(((correctCount / totalQuestions) * 10).toFixed(1));
    const percent = Math.round((correctCount / totalQuestions) * 100);
    const totalTimeSpent = selectedExam.durationMinutes * 60 - timeLeftSeconds;

    let rankTitle = 'Học Sinh Cần Cố Gắng';
    if (scoreOutOf10 >= 9.0) rankTitle = 'Học Sinh Xuất Sắc';
    else if (scoreOutOf10 >= 7.5) rankTitle = 'Học Sinh Giỏi';
    else if (scoreOutOf10 >= 5.0) rankTitle = 'Học Sinh Khá';

    const record: MockExamRecord = {
      score: scoreOutOf10,
      maxScore: 10,
      percent,
      date: new Date().toLocaleDateString('vi-VN'),
      rankTitle,
      totalTimeSeconds: totalTimeSpent,
    };

    setExamResult(record);
    setIsExamFinished(true);

    // Save to storage & award points
    const { updatedProfile } = saveExamResult(selectedExam.id, record);
    onProfileChanged(updatedProfile);

    if (scoreOutOf10 >= 8.0) {
      sfx.playLevelUp();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      onAwardPoints(60, 6, `exam_record_${selectedExam.id}`);
    } else {
      sfx.playCorrect();
      onAwardPoints(30, 3, `exam_record_${selectedExam.id}`);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ: ExamQuestion | undefined = selectedExam?.questions[currentQIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. EXAM CATALOG (Khi chưa chọn đề) */}
      {!selectedExam && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-800 via-cyan-800 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full inline-block">
                Hệ Thống Khảo Sát &amp; Luyện Thi
              </span>
              <h2 className="text-2xl md:text-3xl font-black font-['Fredoka',sans-serif]">
                Phòng Luyện Thi Family and Friends 1
              </h2>
              <p className="text-xs md:text-sm text-blue-200 max-w-xl">
                Làm quen với các đề kiểm tra tiếng Anh theo từng giai đoạn. Tự động chấm điểm, bấm giờ thực tế và cấp Giấy khen Danh dự cho điểm số cao!
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-3xl border border-white/20 text-center flex-shrink-0 flex flex-col items-center gap-2">
              <span className="text-3xl">📜</span>
              <div className="text-xs font-bold text-blue-100">Chứng nhận đạt chuẩn</div>
              <span className="text-xs bg-amber-400 text-blue-950 font-extrabold px-3 py-1 rounded-full shadow-sm">
                Cấp Giấy Khen Ảo
              </span>
            </div>
          </div>

          {/* Exam List Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {MOCK_EXAMS_DATA.map((exam) => {
              const previousRecord = currentUser.mockExamResults?.[exam.id];

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-3xl p-6 border-2 border-blue-100 hover:border-blue-300 shadow-sm flex flex-col justify-between space-y-5 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                        {exam.level}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{exam.durationMinutes} phút</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-blue-950 font-['Fredoka',sans-serif]">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {exam.subtitle}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>{exam.totalQuestions} câu hỏi trắc nghiệm &amp; nghe</span>
                    </div>

                    {/* Previous Result Banner if any */}
                    {previousRecord && (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between text-amber-950 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-600" />
                          <span>Điểm cao nhất:</span>
                        </div>
                        <span className="text-sm font-black text-blue-900">
                          {previousRecord.score} / 10
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartExam(exam)}
                    className="w-full py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 group-hover:scale-101"
                  >
                    <span>{previousRecord ? 'Thi Lại Đề Này' : 'Bắt Đầu Làm Bài'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ACTIVE EXAM TEST ROOM (Đang làm bài) */}
      {selectedExam && !isExamFinished && currentQ && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Test Room Bar */}
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-blue-100 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Bé có chắc chắn muốn thoát khỏi phòng thi? Bài làm hiện tại sẽ không được lưu.')) {
                    setSelectedExam(null);
                  }
                }}
                className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Thoát</span>
              </button>
              <div>
                <h3 className="font-extrabold text-blue-950 text-sm md:text-base font-['Fredoka',sans-serif]">
                  {selectedExam.title}
                </h3>
                <span className="text-xs text-slate-500">
                  Câu hỏi {currentQIndex + 1} / {selectedExam.questions.length}
                </span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-mono font-black text-base md:text-lg ${
                timeLeftSeconds <= 120
                  ? 'border-rose-400 bg-rose-50 text-rose-600 animate-pulse'
                  : 'border-blue-200 bg-blue-50 text-blue-950'
              }`}
            >
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={handleSubmitExam}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Nộp Bài Thi</span>
            </button>
          </div>

          {/* Question Navigator Grid (1 .. 15/20) */}
          <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 block">
              Danh sách câu hỏi (Xanh: Đã làm, Xám: Chưa làm):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedExam.questions.map((q, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = userAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-400'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-100 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Kỹ năng: {currentQ.skill === 'listening' ? '🎧 Nghe' : currentQ.skill === 'reading' ? '📖 Đọc hiểu' : currentQ.skill === 'grammar' ? '⚡ Ngữ pháp' : '📚 Từ vựng'}
              </span>
              <span className="text-xs text-slate-400">Câu {currentQIndex + 1}</span>
            </div>

            {/* If has audio prompt for listening */}
            {currentQ.audioPrompt && (
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎧</span>
                  <div>
                    <span className="text-xs font-extrabold text-cyan-900 block">Phần thi Nghe:</span>
                    <span className="text-xs text-cyan-700">Bấm loa để nghe đoạn băng phát âm</span>
                  </div>
                </div>
                <button
                  onClick={() => speakEnglish(currentQ.audioPrompt!, 0.85)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe đoạn băng</span>
                </button>
              </div>
            )}

            {/* If has Reading Passage */}
            {currentQ.passage && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                <span className="font-bold text-blue-900 block mb-1">📖 Đoạn văn đọc hiểu:</span>
                {currentQ.passage}
              </div>
            )}

            {/* Question Text */}
            <h4 className="text-base md:text-lg font-black text-blue-950 font-['Fredoka',sans-serif]">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="grid gap-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(currentQ.id, optIdx)}
                    className={`p-4 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-extrabold shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-white text-slate-600 border border-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm font-semibold">{opt}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-700" />}
                  </button>
                );
              })}
            </div>

            {/* Question Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-100">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-blue-200 text-blue-800 disabled:opacity-30 font-bold text-xs transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              {currentQIndex < selectedExam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow transition flex items-center gap-1"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Hoàn thành &amp; Nộp bài</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. EXAM RESULT & HONOR CERTIFICATE (Khi thi xong) */}
      {selectedExam && isExamFinished && examResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Certificate Card */}
          <div className="bg-gradient-to-b from-amber-50 via-white to-blue-50 rounded-3xl p-6 md:p-10 border-4 border-amber-300 shadow-2xl text-center space-y-5 relative overflow-hidden">
            {/* Certificate Decorative Seal */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-4xl shadow-md border-4 border-white">
              🏅
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                CHỨNG NHẬN THÀNH TÍCH HỌC TẬP
              </span>
              <h2 className="text-2xl md:text-3xl font-black font-['Fredoka',sans-serif] text-blue-950">
                GIẤY KHEN DANH DỰ ZERO MBAPPE
              </h2>
              <p className="text-xs text-slate-500">
                Giáo trình Family and Friends 1
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 max-w-lg mx-auto space-y-2">
              <div className="text-xs text-slate-500">Vinh danh bạn nhỏ:</div>
              <div className="text-2xl font-black text-blue-950 font-['Fredoka',sans-serif] flex items-center justify-center gap-2">
                <span>{currentUser.avatar}</span>
                <span>{currentUser.name}</span>
              </div>
              <p className="text-xs text-slate-600">
                Đã hoàn thành xuất sắc bài thi <strong>{selectedExam.title}</strong>
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Điểm số</span>
                <span className="text-2xl font-black text-blue-900 font-['Fredoka',sans-serif]">
                  {examResult.score}/10
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Xếp loại</span>
                <span className="text-xs md:text-sm font-extrabold text-amber-800 block pt-1">
                  {examResult.rankTitle}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Thời gian làm</span>
                <span className="text-xs md:text-sm font-extrabold text-emerald-800 block pt-1">
                  {formatTimer(examResult.totalTimeSeconds)}
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-800 italic pt-2">
              🌟 Zero Mbappe khen ngợi sự chăm chỉ và tự tin của bé! Hãy tiếp tục phát huy ở các bài học tiếp theo nhé!
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setShowReview(!showReview)}
                className="px-5 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 font-extrabold text-xs transition"
              >
                {showReview ? 'Ẩn xem lại đáp án' : 'Xem Lại Đáp Án & Giải Thích Chi Tiết'}
              </button>

              <button
                onClick={() => handleStartExam(selectedExam)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs shadow transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thi Lại Đề Này</span>
              </button>

              <button
                onClick={() => setSelectedExam(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow transition"
              >
                Quay Lại Danh Sách Đề Thi
              </button>
            </div>
          </div>

          {/* DETAILED ANSWER REVIEW SECTION */}
          {showReview && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-md space-y-6 animate-fade-in">
              <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-blue-950 border-b border-blue-100 pb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-700" />
                <span>Chi Tiết Đáp Án &amp; Lời Giải Thích Của Zero</span>
              </h3>

              <div className="space-y-5">
                {selectedExam.questions.map((q, idx) => {
                  const userAnsIdx = userAnswers[q.id];
                  const isCorrect = userAnsIdx === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 md:p-5 rounded-2xl border-2 space-y-3 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-rose-200 bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          Câu {idx + 1} ({q.skill})
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+0.5đ)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-sm md:text-base font-bold text-blue-950">
                        {q.question}
                      </h4>

                      {/* Options breakdown */}
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isUserPick = userAnsIdx === oIdx;
                          const isKey = oIdx === q.correctIndex;

                          let style = 'bg-white border-slate-200 text-slate-700';
                          if (isKey) style = 'bg-emerald-600 text-white font-bold border-emerald-600';
                          else if (isUserPick && !isKey)
                            style = 'bg-rose-500 text-white font-bold border-rose-500';

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                            >
                              <span>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </span>
                              {isKey && <Check className="w-4 h-4" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-white/90 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-0.5">
                        <span className="font-extrabold text-blue-800 block">
                          💡 Giải thích chi tiết:
                        </span>
                        <p>{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
