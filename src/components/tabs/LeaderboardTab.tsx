import React from 'react';
import { UserProfile, Badge } from '../../types';
import { ALL_BADGES, calculateLevel, LEVEL_THRESHOLDS } from '../../utils/storage';
import { Trophy, Star, Flame, Award, Crown, Medal, Sparkles, CheckCircle2 } from 'lucide-react';

interface LeaderboardTabProps {
  currentUser: UserProfile;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ currentUser }) => {
  const currentLvl = calculateLevel(currentUser.xp);

  // Simulated classroom friends leaderboard mixed with real user's score
  const mockClassmates = [
    { name: 'Tim', avatar: '👦🏻', xp: 520, stars: 74, title: 'Thám Tử Lớp 1' },
    { name: 'Rosy', avatar: '👱🏻‍♀️', xp: 460, stars: 62, title: 'Chiến Binh Ngữ Pháp' },
    { name: 'Billy', avatar: '👦🏽', xp: 390, stars: 55, title: 'Chiến Binh Ngữ Pháp' },
    { name: 'Emma', avatar: '👧🏼', xp: 310, stars: 48, title: 'Bé Siêu Nhớ Từ' },
    { name: 'Sally', avatar: '👧🏽', xp: 260, stars: 39, title: 'Bé Siêu Nhớ Từ' },
    { name: 'Sue', avatar: '🧑🏼‍🦰', xp: 190, stars: 28, title: 'Tập Sự Tiếng Anh' },
  ];

  const allPlayers = [
    ...mockClassmates,
    {
      name: `${currentUser.name} (Bé)`,
      avatar: currentUser.avatar,
      xp: currentUser.xp,
      stars: currentUser.stars,
      title: currentLvl.title,
      isUser: true,
    },
  ].sort((a, b) => b.xp - a.xp);

  const userRank = allPlayers.findIndex((p) => (p as any).isUser) + 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-800 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full inline-block mb-1">
            Bảng Vàng Danh Dự Lớp 1
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-['Fredoka',sans-serif]">
            Đua Top Điểm Cao Cùng Các Bạn
          </h2>
          <p className="text-xs md:text-sm text-blue-200 mt-1">
            Chăm chỉ ôn tập, luyện nói và làm bài tập để tích lũy EXP và vươn lên vị trí dẫn đầu!
          </p>
        </div>

        <div className="bg-blue-900/70 p-4 rounded-2xl border border-blue-400/40 text-center flex items-center gap-3">
          <div className="text-3xl">🏅</div>
          <div className="text-left">
            <span className="text-xs text-blue-200 font-bold block">Xếp hạng của bé:</span>
            <span className="text-xl font-black text-amber-300 font-['Fredoka',sans-serif]">
              Hạng #{userRank} / {allPlayers.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base md:text-lg text-blue-950 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Bảng Xếp Hạng Tuần Này
          </h3>

          <div className="space-y-2.5">
            {allPlayers.map((player, idx) => {
              const rank = idx + 1;
              const isCurrentUser = (player as any).isUser;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-blue-100 border-blue-400 shadow-md ring-2 ring-blue-400/50'
                      : rank === 1
                      ? 'bg-amber-50/80 border-amber-200'
                      : rank === 2
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                      {rank === 1 && <span className="text-xl">🥇</span>}
                      {rank === 2 && <span className="text-xl">🥈</span>}
                      {rank === 3 && <span className="text-xl">🥉</span>}
                      {rank > 3 && <span className="text-slate-400 font-bold">#{rank}</span>}
                    </div>

                    <div className="text-2xl">{player.avatar}</div>

                    <div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{player.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-blue-700 text-white px-2 py-0.2 rounded-full font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {player.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-sm font-black text-blue-950">{player.xp} XP</div>
                      <div className="text-xs text-amber-500 font-bold flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {player.stars}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Badges & Roadmap */}
        <div className="space-y-6">
          {/* Badges Collection */}
          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-700" />
              Bộ Sưu Tập Huy Hiệu
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {ALL_BADGES.map((b) => {
                const isUnlocked = currentUser.unlockedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border text-center transition ${
                      isUnlocked
                        ? 'bg-amber-50 border-amber-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-3xl mb-1">{b.icon}</div>
                    <div className="text-xs font-black text-slate-900 truncate">
                      {b.title}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                      {b.description}
                    </p>
                    <div className="text-[9px] font-bold mt-1">
                      {isUnlocked ? (
                        <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã mở khóa
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa đạt</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Roadmap */}
          <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Lộ Trình Cấp Độ
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {LEVEL_THRESHOLDS.map((lvl) => {
                const isReached = currentUser.xp >= lvl.minXp;
                const isCurrent = currentLvl.level === lvl.level;

                return (
                  <div
                    key={lvl.level}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'bg-blue-100 border-blue-400 font-bold text-blue-950'
                        : isReached
                        ? 'bg-emerald-50 border-emerald-200 text-slate-700'
                        : 'bg-slate-50 border-slate-200 opacity-60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-700 text-white font-extrabold flex items-center justify-center text-[10px]">
                        Lv.{lvl.level}
                      </span>
                      <span>{lvl.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-700 font-bold">
                      {lvl.minXp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
