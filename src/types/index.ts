export type TabType = 'shield' | 'timer' | 'blocker' | 'notifications' | 'analytics';

export type FrictionLevel = 'gentle' | 'standard' | 'strict';

export interface BlockedApp {
  id: string;
  name: string;
  packageName: string;
  category: 'social' | 'video' | 'news' | 'game';
  icon: string;
  color: string;
  isBlocked: boolean;
  blockReelsOnly: boolean;
  frictionLevel: FrictionLevel;
  pauseDurationSec: number; // e.g. 5 or 10 seconds
  reelsLimitPerDay: number; // e.g. 3 reels or 5 minutes
  todayOpenedCount: number;
  todayReelsIntercepted: number;
  todayMinutesSaved: number;
}

export type TimerMode = 'pomodoro' | 'deep_study' | 'custom';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  completed: boolean;
}

export type SoundscapeId = 'none' | 'alpha_binaural' | 'rain_zen' | 'white_noise' | 'midnight_cafe' | 'forest_flow';

export interface SoundscapeTrack {
  id: SoundscapeId;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
}

export interface InterceptedNotification {
  id: string;
  appName: string;
  appIcon: string;
  title: string;
  message: string;
  timestamp: string;
  isDopamineSpike: boolean; // e.g., "Someone liked your reel" vs "Mom: call me back"
  released: boolean;
}

export interface DailyStat {
  date: string;
  dayLabel: string;
  focusMinutes: number;
  timeSavedMinutes: number;
  reelsIntercepted: number;
  dopamineScore: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 1
}
