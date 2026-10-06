import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audioUtils';
import { LEVEL_THRESHOLDS } from '../utils/storage';
import { Sparkles, Trophy, Star, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      sfx.playLevelUp();
      // Burst celebratory colorful confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#38bdf8', '#fbbf24', '#f43f5e', '#3b82f6'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#38bdf8', '#fbbf24', '#34d399'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#2563eb', '#f59e0b', '#0ea5e9'],
          });
        }, 250);
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentConfig =
    LEVEL_THRESHOLDS.find((l) => l.level === newLevel) || {
      level: newLevel,
      title: 'Đại Hiệp Sĩ Tiếng Anh',
      reward: '+30 Sao Vàng',
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden transform animate-scale-up">
        {/* Sparkle background glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-300 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-amber-300 rounded-full blur-3xl opacity-60" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-xl border-4 border-white mx-auto transform hover:rotate-6 transition">
            <span className="text-5xl">👑</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              CHÚC MỪNG BÉ LÊN CẤP!
            </div>
            <h2 className="text-3xl font-black font-['Fredoka',sans-serif] text-blue-900">
              CẤP ĐỘ {newLevel}
            </h2>
            <p className="text-base font-extrabold text-amber-600 mt-0.5">
              {currentConfig.title}
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200 text-xs text-blue-800 space-y-1">
            <p className="font-semibold">
              ⚽ Zero Mbappe rất tự hào về bé! Bé vừa mở khóa phần thưởng:
            </p>
            <div className="flex items-center justify-center gap-1.5 font-bold text-amber-600 text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{currentConfig.reward}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white font-extrabold text-sm shadow-lg hover:from-blue-700 hover:to-cyan-800 transition flex items-center justify-center gap-2 group"
          >
            <span>Nhận Thưởng &amp; Học Tiếp Nào!</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
