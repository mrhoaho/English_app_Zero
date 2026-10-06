import { UserProfile, Badge, MockExamRecord } from '../types';

const STORAGE_KEY_PROFILES = 'mbappe_ef1_profiles';
const STORAGE_KEY_CURRENT_ID = 'mbappe_ef1_current_user_id';

export const DEFAULT_AVATARS = [
  { id: 'zera', name: 'Zero Mbappe', emoji: '⚽', color: 'bg-blue-500' },
  { id: 'minh', name: 'Tim', emoji: '👦🏻', color: 'bg-blue-500' },
  { id: 'mai', name: 'Rosy', emoji: '👧🏻', color: 'bg-rose-500' },
  { id: 'linh', name: 'Emma', emoji: '👧🏽', color: 'bg-amber-500' },
  { id: 'nam', name: 'Billy', emoji: '👦🏽', color: 'bg-emerald-500' },
  { id: 'lucy', name: 'Lucy', emoji: '👱🏻‍♀️', color: 'bg-pink-500' },
  { id: 'ben', name: 'Ben', emoji: '🧑🏼‍🦰', color: 'bg-orange-500' },
  { id: 'mary', name: 'Mary', emoji: '👧🏼', color: 'bg-sky-500' },
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'Bước Chân Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên cùng Zero Mbappe',
    icon: '🌱',
    condition: 'first_lesson',
  },
  {
    id: 'vocab_master_1',
    title: 'Thợ Săn Từ Vựng',
    description: 'Học và kiểm tra đạt 100 điểm phần từ vựng',
    icon: '📚',
    condition: 'vocab_100',
  },
  {
    id: 'talk_star',
    title: 'Ngôi Sao Giao Tiếp',
    description: 'Hoàn thành xuất sắc phần luyện giao tiếp',
    icon: '💬',
    condition: 'communication_100',
  },
  {
    id: 'voice_pro',
    title: 'Giọng Đọc Chuẩn Anh',
    description: 'Được Zero chấm 3 sao phát âm xuất sắc',
    icon: '🎙️',
    condition: 'pronounce_star',
  },
  {
    id: 'reading_detective',
    title: 'Thám Tử Đọc Hiểu',
    description: 'Trả lời đúng 100% câu hỏi bài đọc hiểu',
    icon: '🔍',
    condition: 'reading_100',
  },
  {
    id: 'streak_3',
    title: 'Chiến Binh Chăm Chỉ',
    description: 'Học liên tục 3 ngày không bỏ bữa',
    icon: '🔥',
    condition: 'streak_3',
  },
  {
    id: 'level_5_master',
    title: 'Đại Hiệp Sĩ Tiếng Anh',
    description: 'Đạt Cấp độ 5 trong hành trình khám phá',
    icon: '👑',
    condition: 'level_5',
  },
  {
    id: 'star_collector',
    title: 'Kho Tàng Tri Thức',
    description: 'Thu thập được hơn 100 ngôi sao Zero',
    icon: '⭐',
    condition: 'stars_100',
  },
  {
    id: 'exam_hero',
    title: 'Thủ Khoa Lớp 1',
    description: 'Đạt từ 9.0 điểm trở lên trong bài thi thử chuẩn SGK',
    icon: '🏆',
    condition: 'exam_90',
  },
  {
    id: 'memory_genius',
    title: 'Bậc Thầy Trí Nhớ',
    description: 'Vượt qua thử thách lật thẻ tìm cặp từ vựng',
    icon: '🧠',
    condition: 'memory_won',
  },
  {
    id: 'sentence_master',
    title: 'Hiệp Sĩ Ngữ Pháp',
    description: 'Sắp xếp chuẩn xác các câu tiếng Anh hóc búa',
    icon: '⚔️',
    condition: 'sentence_builder',
  },
  {
    id: 'ai_chatter',
    title: 'Bạn Tri Kỷ Của Zero',
    description: 'Tự tin trò chuyện giao tiếp bằng tiếng Anh cùng AI Zero',
    icon: '🤖',
    condition: 'ai_chat',
  },
];

export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, title: 'Cầu Thủ Nhí Zero', reward: 'Huy hiệu Tân Binh' },
  { level: 2, minXp: 80, title: 'Tập Sự Tiếng Anh', reward: '+15 Sao' },
  { level: 3, minXp: 200, title: 'Bé Siêu Nhớ Từ', reward: '+20 Sao' },
  { level: 4, minXp: 380, title: 'Chiến Binh Ngữ Pháp', reward: '+25 Sao' },
  { level: 5, minXp: 620, title: 'Thám Tử Lớp 1', reward: 'Vương miện Zero' },
  { level: 6, minXp: 920, title: 'Ngôi Sao Giao Tiếp', reward: '+30 Sao' },
  { level: 7, minXp: 1300, title: 'Dũng Sĩ Phát Âm', reward: '+35 Sao' },
  { level: 8, minXp: 1750, title: 'Cao Thủ Toàn Năng', reward: '+40 Sao' },
  { level: 9, minXp: 2300, title: 'Đại Sứ Toàn Cầu', reward: '+50 Sao' },
  { level: 10, minXp: 3000, title: 'Bậc Thầy Tiếng Anh', reward: 'Cúp Vàng Danh Dự' },
];

export function calculateLevel(xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number; progress: number } {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || { level: current.level + 1, minXp: current.minXp + 800, title: 'Huyền Thoại Zero', reward: '+60 Sao' };
      break;
    }
  }

  const range = next.minXp - current.minXp;
  const inLevel = Math.max(0, xp - current.minXp);
  const progress = Math.min(100, Math.round((inLevel / (range || 1)) * 100));

  return {
    level: current.level,
    title: current.title,
    currentLevelXp: current.minXp,
    nextLevelXp: next.minXp,
    progress,
  };
}

export function getAllProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) {
      const defaultProfile: UserProfile = {
        id: 'default_zera',
        name: 'Zero Fan Nhí',
        avatar: '⚽',
        xp: 120,
        level: 2,
        stars: 35,
        streak: 2,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedActivities: {
          starter_vocab: true,
          unit1_vocab: true,
        },
        highScores: {
          unit1_quiz: 90,
        },
        unlockedBadges: ['first_step', 'vocab_master_1'],
      };
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([defaultProfile]));
      localStorage.setItem(STORAGE_KEY_CURRENT_ID, defaultProfile.id);
      return [defaultProfile];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCurrentProfile(): UserProfile {
  const profiles = getAllProfiles();
  const currentId = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
  const found = profiles.find((p) => p.id === currentId);
  return found || profiles[0];
}

export function saveCurrentProfile(updated: UserProfile): void {
  if (typeof window === 'undefined') return;
  const profiles = getAllProfiles();
  const index = profiles.findIndex((p) => p.id === updated.id);
  if (index >= 0) {
    profiles[index] = updated;
  } else {
    profiles.push(updated);
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, updated.id);
}

export function createNewProfile(name: string, avatarEmoji: string): UserProfile {
  const newProfile: UserProfile = {
    id: 'user_' + Date.now(),
    name: name.trim() || 'Học sinh Lớp 1',
    avatar: avatarEmoji || '⚽',
    xp: 0,
    level: 1,
    stars: 10,
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    completedActivities: {},
    highScores: {},
    unlockedBadges: [],
  };
  const profiles = getAllProfiles();
  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  localStorage.setItem(STORAGE_KEY_CURRENT_ID, newProfile.id);
  return newProfile;
}

export function switchProfile(id: string): UserProfile | null {
  const profiles = getAllProfiles();
  const found = profiles.find((p) => p.id === id);
  if (found) {
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
    return found;
  }
  return null;
}

export function awardPoints(
  xpToAdd: number,
  starsToAdd: number,
  activityKey?: string
): { updatedProfile: UserProfile; leveledUp: boolean; oldLevel: number; newLevel: number; newBadge?: Badge } {
  const current = getCurrentProfile();
  const oldLevelInfo = calculateLevel(current.xp);
  const oldLevel = oldLevelInfo.level;

  const newXp = current.xp + xpToAdd;
  const newStars = current.stars + starsToAdd;
  const newLevelInfo = calculateLevel(newXp);
  const leveledUp = newLevelInfo.level > oldLevel;

  const completedActivities = { ...current.completedActivities };
  if (activityKey) {
    completedActivities[activityKey] = true;
  }

  // Check badges
  const unlockedBadges = [...current.unlockedBadges];
  let newlyUnlockedBadge: Badge | undefined;

  const checkBadge = (badgeId: string) => {
    if (!unlockedBadges.includes(badgeId)) {
      unlockedBadges.push(badgeId);
      newlyUnlockedBadge = ALL_BADGES.find((b) => b.id === badgeId);
    }
  };

  checkBadge('first_step');
  if (newLevelInfo.level >= 5) checkBadge('level_5_master');
  if (newStars >= 100) checkBadge('star_collector');

  // Streak calculation
  const today = new Date().toISOString().split('T')[0];
  let streak = current.streak;
  if (current.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (current.lastActiveDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
  }
  if (streak >= 3) checkBadge('streak_3');

  const updated: UserProfile = {
    ...current,
    xp: newXp,
    level: newLevelInfo.level,
    stars: newStars,
    streak,
    lastActiveDate: today,
    completedActivities,
    unlockedBadges,
  };

  saveCurrentProfile(updated);

  return {
    updatedProfile: updated,
    leveledUp,
    oldLevel,
    newLevel: newLevelInfo.level,
    newBadge: newlyUnlockedBadge,
  };
}

export function toggleBookmarkWord(wordId: string): { updatedProfile: UserProfile; isBookmarked: boolean } {
  const current = getCurrentProfile();
  const bookmarked = current.bookmarkedWords || [];
  const exists = bookmarked.includes(wordId);
  const updatedList = exists
    ? bookmarked.filter((id) => id !== wordId)
    : [...bookmarked, wordId];

  const updated: UserProfile = {
    ...current,
    bookmarkedWords: updatedList,
  };

  saveCurrentProfile(updated);
  return { updatedProfile: updated, isBookmarked: !exists };
}

export function isWordBookmarked(wordId: string): boolean {
  const current = getCurrentProfile();
  return Boolean(current.bookmarkedWords?.includes(wordId));
}

export function saveExamResult(
  examId: string,
  record: MockExamRecord
): { updatedProfile: UserProfile; newBadge?: Badge } {
  const current = getCurrentProfile();
  const examResults = { ...(current.mockExamResults || {}), [examId]: record };

  const unlockedBadges = [...current.unlockedBadges];
  let newBadge: Badge | undefined;

  if (record.percent >= 90 && !unlockedBadges.includes('exam_hero')) {
    unlockedBadges.push('exam_hero');
    newBadge = ALL_BADGES.find((b) => b.id === 'exam_hero');
  }

  const updated: UserProfile = {
    ...current,
    mockExamResults: examResults,
    unlockedBadges,
  };

  saveCurrentProfile(updated);
  return { updatedProfile: updated, newBadge };
}

