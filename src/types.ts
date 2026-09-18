export type ActiveGame = 'sliding' | 'memory' | 'pipes';

export type GridSize = 3 | 4 | 5;

export type GameMode = 'numbers' | 'images';

export interface PuzzleImage {
  id: string;
  name: string;
  url: string;
  category: string;
}

export interface BestRecord {
  moves: number;
  timeSeconds: number;
  date: string;
}

export interface BestRecords {
  [key: string]: BestRecord | undefined; // e.g. "3x3-numbers", "4x4-images"
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'speed' | 'persistence' | 'mastery' | 'explore';
  rewardPoints: number;
}

export interface UserAchievementStats {
  totalWins: number;
  unlockedIds: string[];
  totalHintsUsed: number;
  consecutiveWins: number;
}

export interface GameStats {
  moves: number;
  timeSeconds: number;
  isPlaying: boolean;
  isWon: boolean;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  answered: boolean;
}
