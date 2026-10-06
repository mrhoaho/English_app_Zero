// Audio and Speech Utilities for Zero Mbappe

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Ting-ting when answer is correct!
  public playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // AudioContext not allowed or errored silently
    }
  }

  // Soft buzz when wrong, encouraging to retry
  public playWrong() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  // Star ding
  public playStar() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  // Fanfare for level up!
  public playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {
      // ignore
    }
  }
}

export const sfx = new SoundEffects();

// Text to Speech
export function speakEnglish(text: string, rate: number = 0.88) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 0.88 is pleasant and easily understood by grade 4 pupils
    utterance.pitch = 1.05; // slightly friendly kid pitch

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Guy')));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // fallback safe
  }
}

// Speech Recognition Assessment
export interface SpeechAssessmentResult {
  score: number; // 0 - 100
  recognizedText: string;
  feedback: string;
  passed: boolean;
}

// Normalize string for clean phonetic text comparison
function cleanText(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

// Levenshtein distance for spelling/speech similarity
function getSimilarity(s1: string, s2: string): number {
  const str1 = cleanText(s1);
  const str2 = cleanText(s2);
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;

  // Word level check
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  let matchedWords = 0;
  for (const w of words1) {
    if (words2.includes(w)) matchedWords++;
  }
  const wordRatio = (matchedWords / Math.max(words1.length, words2.length)) * 100;

  // Character level distance
  const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const distance = track[str2.length][str1.length];
  const maxLen = Math.max(str1.length, str2.length);
  const charScore = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));

  return Math.round(0.6 * charScore + 0.4 * wordRatio);
}

export function startSpeechRecognition(
  targetPhrase: string,
  onResult: (result: SpeechAssessmentResult) => void,
  onError: (err: string) => void
): { stop: () => void } {
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Trình duyệt chưa hỗ trợ nhận diện giọng nói. Bé có thể gõ hoặc nghe phát âm mẫu nhé!');
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event: any) => {
    let bestScore = 0;
    let bestTranscript = '';

    for (let i = 0; i < event.results[0].length; i++) {
      const transcript = event.results[0][i].transcript;
      const score = getSimilarity(targetPhrase, transcript);
      if (score >= bestScore) {
        bestScore = score;
        bestTranscript = transcript;
      }
    }

    let feedback = '';
    let passed = false;

    if (bestScore >= 80) {
      bestScore = Math.max(90, bestScore);
      feedback = '🌟 Tuyệt vời! Zero khen bé phát âm rất chuẩn và tự tin!';
      passed = true;
      sfx.playCorrect();
    } else if (bestScore >= 55) {
      feedback = '👍 Khá tốt rồi! Bé hãy nhấn nghe mẫu và đọc to, tròn vành rõ chữ hơn một xíu nữa nhé!';
      passed = true;
      sfx.playStar();
    } else {
      feedback = '💪 Cố lên nhé! Bé hãy bấm vào biểu tượng Loa để nghe Zero phát âm lại rồi thử đọc lại nha!';
      passed = false;
      sfx.playWrong();
    }

    onResult({
      score: bestScore,
      recognizedText: bestTranscript || '(chưa nghe rõ)',
      feedback,
      passed,
    });
  };

  recognition.onerror = (event: any) => {
    if (event.error === 'no-speech') {
      onError('Zero chưa nghe thấy tiếng bé. Bé hãy nhấn lại và nói to rõ ràng vào mic nhé!');
    } else if (event.error === 'not-allowed') {
      onError('Chưa được cấp quyền Micro. Ba mẹ hãy cho phép trình duyệt dùng micro để bé luyện nói nhé!');
    } else {
      onError(`Lỗi mic: ${event.error}. Bé thử lại nhé!`);
    }
  };

  try {
    recognition.start();
  } catch (err) {
    onError('Không thể khởi động micro lúc này.');
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}
