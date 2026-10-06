import { MascotZero } from './MascotZero';
import React from 'react';
import { UserProfile } from '../types';
import { calculateLevel } from '../utils/storage';
import { sfx } from '../utils/audioUtils';
import { Volume2, VolumeX, Trophy, Sparkles, Flame, Star, User, GraduationCap } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onOpenUserModal: () => void;
  onOpenLeaderboard: () => void;
  onOpenExamRoom?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenUserModal,
  onOpenLeaderboard,
  onOpenExamRoom,
  isMuted,
  onToggleMute,
}) => {
  const levelInfo = calculateLevel(user.xp);

  return (
    <header className="sticky top-0 z-30 bg-blue-700/95 backdrop-blur-md text-white shadow-lg border-b border-blue-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Logo & Mascot */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-300 via-sky-400 to-blue-300 p-0.5 shadow-md flex items-center justify-center transform hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-sky-100 overflow-hidden"><MascotZero /></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight font-['Fredoka',sans-serif] text-blue-100 flex items-center gap-1.5">
                Zero Mbappe
                <span className="bg-amber-400 text-blue-950 text-xs px-2 py-0.5 rounded-full font-extrabold uppercase shadow-sm">
                  Family and Friends 1
                </span>
              </h1>
            </div>
            <p className="text-xs text-blue-200 hidden sm:block">
              Học Tiếng Anh lớp 1 vui nhộn • Chấm điểm &amp; Lên cấp Game
            </p>
          </div>
        </div>

        {/* Center/Right: Game Stats (Level, Stars, Streak) */}
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          {/* Level Progress */}
          <div
            id="user-level-badge"
            onClick={onOpenUserModal}
            className="flex items-center gap-2 bg-blue-900/60 hover:bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-500/40 cursor-pointer transition"
            title="Xem chi tiết cấp độ và hồ sơ học sinh"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 font-black flex items-center justify-center text-sm shadow">
              Lv.{levelInfo.level}
            </div>
            <div className="text-left hidden xs:block">
              <div className="text-xs font-bold text-amber-200 truncate max-w-[110px]">
                {levelInfo.title}
              </div>
              <div className="w-20 bg-blue-950/80 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stars */}
          <div
            id="user-stars-badge"
            className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/40 text-sm font-extrabold"
            title="Số sao vàng Zero bạn đã thu thập"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{user.stars}</span>
          </div>

          {/* Daily Streak */}
          <div
            id="user-streak-badge"
            className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-2.5 py-1.5 rounded-xl border border-orange-400/40 text-sm font-extrabold"
            title={`Chuỗi học tập liên tục: ${user.streak} ngày!`}
          >
            <Flame className="w-4 h-4 fill-orange-400 text-orange-400 animate-pulse" />
            <span>{user.streak}d</span>
          </div>

          {/* Exam Room Button */}
          {onOpenExamRoom && (
            <button
              id="btn-exam-room"
              onClick={onOpenExamRoom}
              className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold transition flex items-center gap-1 shadow-sm"
              title="Phòng Luyện Thi Chuẩn SGK"
            >
              <GraduationCap className="w-4 h-4 text-blue-950" />
              <span className="text-xs hidden md:inline">Luyện Thi</span>
            </button>
          )}

          {/* Leaderboard Trophy */}
          <button
            id="btn-leaderboard"
            onClick={onOpenLeaderboard}
            className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-600 border border-blue-500/40 text-blue-100 hover:text-white transition flex items-center gap-1"
            title="Bảng vàng &amp; Huy hiệu danh dự"
          >
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold hidden md:inline">Bảng Vàng</span>
          </button>

          {/* Mute SFX */}
          <button
            id="btn-mute-sound"
            onClick={() => {
              onToggleMute();
              if (isMuted) {
                sfx.playStar();
              }
            }}
            className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white transition"
            title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Profile Switcher */}
          <button
            id="btn-user-profile"
            onClick={onOpenUserModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-gradient-to-r from-blue-800 to-cyan-800 hover:from-blue-600 hover:to-cyan-600 rounded-xl border border-blue-400/40 transition shadow-sm"
          >
            <span className="text-xl">{user.avatar}</span>
            <span className="text-xs font-bold text-white max-w-[80px] truncate hidden sm:inline">
              {user.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
