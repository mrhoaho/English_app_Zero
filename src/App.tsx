/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MascotZero } from './components/MascotZero';
import React, { useState, useEffect } from 'react';
import { UserProfile, UnitData } from './types';
import { UNITS_DATA } from './data/unitsData';
import { getCurrentProfile, awardPoints, saveCurrentProfile } from './utils/storage';
import { sfx, speakEnglish } from './utils/audioUtils';
import { Header } from './components/Header';
import { UnitSelector } from './components/UnitSelector';
import { UserModal } from './components/UserModal';
import { LevelUpModal } from './components/LevelUpModal';
import { GrammarTab } from './components/tabs/GrammarTab';
import { VocabularyTab } from './components/tabs/VocabularyTab';
import { CommunicationTab } from './components/tabs/CommunicationTab';
import { PronunciationTab } from './components/tabs/PronunciationTab';
import { ReadingTab } from './components/tabs/ReadingTab';
import { LeaderboardTab } from './components/tabs/LeaderboardTab';
import { ExamRoomTab } from './components/tabs/ExamRoomTab';
import {
  BookOpen,
  Sparkles,
  MessageSquare,
  Mic,
  FileText,
  Trophy,
  Volume2,
  Smile,
  ArrowRight,
  Flame,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => getCurrentProfile());
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1); // Default to Unit 1
  const [activeTab, setActiveTab] = useState<
    'grammar' | 'vocab' | 'communication' | 'pronunciation' | 'reading' | 'exam' | 'leaderboard'
  >('grammar');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; level: number }>({
    isOpen: false,
    level: 1,
  });
  const [isMuted, setIsMuted] = useState(false);

  // Sync mute state with sfx utility
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sfx.setMuted(nextMuted);
  };

  const currentUnit = UNITS_DATA.find((u) => u.id === selectedUnitId) || UNITS_DATA[1];

  // Callback to award points and check level up
  const handleAwardPoints = (xp: number, stars: number, activityKey: string) => {
    const result = awardPoints(xp, stars, activityKey);
    setUser(result.updatedProfile);

    if (result.leveledUp) {
      setLevelUpData({
        isOpen: true,
        level: result.newLevel,
      });
    }
  };

  const handleProfileChanged = (newProfile: UserProfile) => {
    setUser(newProfile);
  };

  const tabs = [
    {
      id: 'grammar',
      name: 'Ôn tập Kiến thức',
      icon: BookOpen,
      badge: 'Trọng tâm',
      color: 'text-blue-600',
    },
    {
      id: 'vocab',
      name: 'Luyện Từ mới & Mở rộng',
      icon: Sparkles,
      badge: `${currentUnit.coreVocab.length + currentUnit.extendedVocab.length} từ`,
      color: 'text-cyan-600',
    },
    {
      id: 'communication',
      name: 'Luyện Giao tiếp',
      icon: MessageSquare,
      badge: 'Hỏi & Đáp',
      color: 'text-sky-600',
    },
    {
      id: 'pronunciation',
      name: 'Luyện Phát âm',
      icon: Mic,
      badge: 'Chấm giọng',
      color: 'text-sky-600',
    },
    {
      id: 'reading',
      name: 'Đọc hiểu',
      icon: FileText,
      badge: 'Đoạn văn',
      color: 'text-blue-700',
    },
    {
      id: 'exam',
      name: 'Phòng Luyện Thi',
      icon: GraduationCap,
      badge: 'Đề kiểm tra',
      color: 'text-amber-500',
    },
    {
      id: 'leaderboard',
      name: 'Bảng Vàng & Cấp',
      icon: Trophy,
      badge: 'Game',
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Gamified Header */}
      <Header
        user={user}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenLeaderboard={() => setActiveTab('leaderboard')}
        onOpenExamRoom={() => setActiveTab('exam')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Zero Friendly Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-200 overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 animate-bounce-slow">
              <MascotZero />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black font-['Fredoka',sans-serif] text-blue-100">
                  Chào bé {user.name}!
                </h2>
                <span className="text-xs bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full font-bold">
                  Sẵn sàng tích lũy EXP nào!
                </span>
              </div>
              <p className="text-xs md:text-sm text-blue-200 mt-1 max-w-xl">
                Hôm nay chúng mình cùng học <strong className="text-white">{currentUnit.title}</strong> nhé!
                Hoàn thành các bài luyện tập để nhận sao ⭐ và thăng cấp hiệp sĩ tiếng Anh nha.
              </p>
            </div>
          </div>

          <button
            onClick={() => speakEnglish(`Hello ${user.name}! Welcome to ${currentUnit.title}! Let's learn English together!`)}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-2 transition flex-shrink-0"
            title="Nghe Zero Mbappe chào bạn"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Nghe Zero chào bé</span>
          </button>
        </div>

        {/* Units Navigation Carousel */}
        <UnitSelector
          units={UNITS_DATA}
          selectedUnitId={selectedUnitId}
          onSelectUnit={(id) => {
            setSelectedUnitId(id);
            sfx.playStar();
          }}
          user={user}
        />

        {/* Tab Navigation Menu */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-blue-100">
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    sfx.playStar();
                  }}
                  className={`flex-1 flex-shrink-0 py-2.5 px-3 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : tab.color}`} />
                  <span>{tab.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold hidden lg:inline ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Display */}
        <div className="pb-10">
          {activeTab === 'grammar' && (
            <GrammarTab unit={currentUnit} onAwardPoints={handleAwardPoints} />
          )}

          {activeTab === 'vocab' && (
            <VocabularyTab unit={currentUnit} onAwardPoints={handleAwardPoints} />
          )}

          {activeTab === 'communication' && (
            <CommunicationTab unit={currentUnit} onAwardPoints={handleAwardPoints} />
          )}

          {activeTab === 'pronunciation' && (
            <PronunciationTab unit={currentUnit} onAwardPoints={handleAwardPoints} />
          )}

          {activeTab === 'reading' && (
            <ReadingTab unit={currentUnit} onAwardPoints={handleAwardPoints} />
          )}

          {activeTab === 'exam' && (
            <ExamRoomTab
              currentUser={user}
              onAwardPoints={handleAwardPoints}
              onProfileChanged={handleProfileChanged}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab currentUser={user} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 py-6 text-center text-xs border-t border-blue-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-blue-100 font-['Fredoka',sans-serif]">
              Zero Mbappe - Family and Friends 1
            </span>
          </div>
          <p className="text-[11px] text-blue-300">
            Theo giáo trình Family and Friends 1 (Oxford University Press) - dành cho bé 6-7 tuổi
          </p>
          <div className="text-[11px] text-blue-300">
            Tông xanh nước biển • Học vui cùng Zero Mbappe
          </div>
        </div>
      </footer>

      {/* User / Profile Management Modal */}
      <UserModal
        currentUser={user}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onProfileChanged={handleProfileChanged}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        newLevel={levelUpData.level}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
