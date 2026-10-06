import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_AVATARS, ALL_BADGES, getAllProfiles, switchProfile, createNewProfile, calculateLevel } from '../utils/storage';
import { sfx } from '../utils/audioUtils';
import { X, UserPlus, Check, Award, Flame, Star, Zap, Sparkles } from 'lucide-react';

interface UserModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileChanged: (user: UserProfile) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onProfileChanged,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getAllProfiles());
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('⚽');

  if (!isOpen) return null;

  const currentLevelInfo = calculateLevel(currentUser.xp);

  const handleSelectProfile = (id: string) => {
    const switched = switchProfile(id);
    if (switched) {
      sfx.playCorrect();
      onProfileChanged(switched);
      onClose();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createNewProfile(newName, selectedAvatar);
    sfx.playLevelUp();
    setProfiles(getAllProfiles());
    onProfileChanged(created);
    setIsCreating(false);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-700 text-white p-5 rounded-t-3xl relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 text-2xl flex items-center justify-center shadow">
              {currentUser.avatar}
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Fredoka',sans-serif] text-blue-100">
                Tài khoản Học sinh &amp; Điểm Game
              </h2>
              <p className="text-xs text-blue-200">
                Lưu điểm, theo dõi tiến độ lên cấp và đổi tài khoản học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current User Stats Card */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Đang học cùng
                </span>
                <div className="text-xl font-black text-blue-950 flex items-center gap-2">
                  {currentUser.name}
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Cấp {currentLevelInfo.level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-500">Danh hiệu Zero</span>
                <div className="text-sm font-extrabold text-amber-600">
                  {currentLevelInfo.title}
                </div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-blue-700 font-bold">
                <span>Điểm kinh nghiệm (EXP): {currentUser.xp} XP</span>
                <span>Mục tiêu tiếp theo: {currentLevelInfo.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-blue-200 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 to-blue-600 h-full rounded-full transition-all duration-700 shadow-inner"
                  style={{ width: `${currentLevelInfo.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-500 text-center font-medium mt-1">
                Chỉ còn {Math.max(0, currentLevelInfo.nextLevelXp - currentUser.xp)} XP nữa là bé sẽ lên Cấp {currentLevelInfo.level + 1}! 🎉
              </p>
            </div>

            {/* Micro stats grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-blue-200/80 text-center">
              <div className="bg-white rounded-xl p-2 border border-blue-100 shadow-xs">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-base">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {currentUser.stars}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Sao Vàng</div>
              </div>

              <div className="bg-white rounded-xl p-2 border border-blue-100 shadow-xs">
                <div className="flex items-center justify-center gap-1 text-orange-500 font-extrabold text-base">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  {currentUser.streak} ngày
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Chuỗi học</div>
              </div>

              <div className="bg-white rounded-xl p-2 border border-blue-100 shadow-xs">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-extrabold text-base">
                  <Award className="w-4 h-4" />
                  {currentUser.unlockedBadges.length}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Huy hiệu</div>
              </div>
            </div>
          </div>

          {/* Badges Preview */}
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Bộ sưu tập Huy hiệu bé đã nhận:
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BADGES.slice(0, 4).map((badge) => {
                const isUnlocked = currentUser.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl p-2 text-center border transition ${
                      isUnlocked
                        ? 'bg-amber-50 border-amber-300 text-slate-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-[10px] font-bold line-clamp-1">{badge.title}</div>
                    <div className="text-[9px] text-slate-500">
                      {isUnlocked ? 'Đã nhận' : 'Khóa'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profiles List / Create Form */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-blue-900">
                Đổi tài khoản học sinh ({profiles.length})
              </h3>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-full transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Thêm bé mới
                </button>
              )}
            </div>

            {isCreating ? (
              <form onSubmit={handleCreate} className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-900">Tạo hồ sơ học sinh mới:</span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Hủy
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Tên bé hoặc biệt danh:
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ví dụ: Bé An, Nam Anh, Minh Châu..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Chọn nhân vật đại diện:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition ${
                          selectedAvatar === av.emoji
                            ? 'border-blue-600 bg-blue-100 scale-110'
                            : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                        title={av.name}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
                >
                  Bắt đầu học ngay với Zero!
                </button>
              </form>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isCurrent = p.id === currentUser.id;
                  const lvl = calculateLevel(p.xp);
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isCurrent && handleSelectProfile(p.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-100/90 border-blue-400 shadow-xs'
                          : 'bg-white hover:bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.avatar}</span>
                        <div>
                          <div className="text-sm font-bold text-blue-950 flex items-center gap-2">
                            {p.name}
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.2 rounded-full font-semibold">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            Cấp {lvl.level} • {p.xp} XP • {p.stars} ⭐
                          </div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Check className="w-5 h-5 text-blue-700 font-bold" />
                      ) : (
                        <span className="text-xs text-blue-600 font-semibold hover:underline">
                          Chọn bé
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition shadow"
          >
            Đóng &amp; Tiếp Tục Học Bài
          </button>
        </div>
      </div>
    </div>
  );
};
