import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BlockedApp,
  DailyStat,
  FrictionLevel,
  InterceptedNotification,
  SoundscapeId,
  StudyTask,
  TabType,
  TimerMode,
} from '../types';
import { playZenChime, setSoundscapeVolume, startSoundscape, stopSoundscape } from '../services/soundscape';
import { triggerHaptic } from '../services/haptics';

interface FocusContextType {
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Master Shield
  isShieldActive: boolean;
  toggleShield: () => void;
  isNotificationShieldActive: boolean;
  toggleNotificationShield: () => void;

  // Apps & Reels Blocker
  blockedApps: BlockedApp[];
  toggleAppBlock: (id: string) => void;
  updateAppFriction: (id: string, friction: Partial<BlockedApp>) => void;
  
  // Friction / Regain Breath Modal
  activeFrictionApp: BlockedApp | null;
  triggerFrictionPause: (app: BlockedApp) => void;
  closeFrictionModal: () => void;
  confirmFrictionPass: (appId: string, intention: string) => void;
  dismissFrictionToStudy: (appId: string) => void;

  // Doomscroll Simulator
  isDoomscrollModalOpen: boolean;
  openDoomscrollSimulator: () => void;
  closeDoomscrollSimulator: () => void;
  recordDoomscrollIntercept: () => void;

  // Timer & Deep Work
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  secondsRemaining: number;
  totalDurationSeconds: number;
  isTimerRunning: boolean;
  isStrictMode: boolean;
  toggleStrictMode: () => void;
  activeSubject: string;
  setActiveSubject: (subject: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (minutes?: number) => void;
  studyTasks: StudyTask[];
  addStudyTask: (title: string, subject: string, durationMinutes: number) => void;
  toggleStudyTask: (id: string) => void;

  // Emergency Unlock
  isUnlockModalOpen: boolean;
  openUnlockModal: () => void;
  closeUnlockModal: () => void;
  confirmEmergencyUnlock: () => void;

  // Ambient Soundscapes
  activeSoundscape: SoundscapeId;
  soundscapeVolume: number;
  isSoundscapeModalOpen: boolean;
  openSoundscapeModal: () => void;
  closeSoundscapeModal: () => void;
  selectSoundscape: (id: SoundscapeId) => void;
  changeVolume: (vol: number) => void;

  // Notifications Vault
  notifications: InterceptedNotification[];
  releaseNotificationBatch: () => void;
  dismissNotification: (id: string) => void;
  nextBatchTime: string;

  // Analytics & Stats
  todayStats: {
    focusMinutes: number;
    timeSavedMinutes: number;
    reelsIntercepted: number;
    dopamineScore: number;
    streakDays: number;
  };
  weeklyStats: DailyStat[];
}

const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social',
    icon: 'logo-instagram',
    color: '#E1306C',
    isBlocked: true,
    blockReelsOnly: true,
    frictionLevel: 'standard',
    pauseDurationSec: 5,
    reelsLimitPerDay: 3,
    todayOpenedCount: 8,
    todayReelsIntercepted: 14,
    todayMinutesSaved: 56,
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    packageName: 'com.google.android.youtube',
    category: 'video',
    icon: 'logo-youtube',
    color: '#FF0000',
    isBlocked: true,
    blockReelsOnly: true,
    frictionLevel: 'standard',
    pauseDurationSec: 5,
    reelsLimitPerDay: 3,
    todayOpenedCount: 5,
    todayReelsIntercepted: 9,
    todayMinutesSaved: 42,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'video',
    icon: 'musical-notes',
    color: '#00F2FE',
    isBlocked: true,
    blockReelsOnly: false,
    frictionLevel: 'strict',
    pauseDurationSec: 10,
    reelsLimitPerDay: 0,
    todayOpenedCount: 2,
    todayReelsIntercepted: 7,
    todayMinutesSaved: 35,
  },
  {
    id: 'reddit',
    name: 'Reddit Feed',
    packageName: 'com.reddit.frontpage',
    category: 'social',
    icon: 'logo-reddit',
    color: '#FF4500',
    isBlocked: true,
    blockReelsOnly: false,
    frictionLevel: 'gentle',
    pauseDurationSec: 3,
    reelsLimitPerDay: 5,
    todayOpenedCount: 4,
    todayReelsIntercepted: 3,
    todayMinutesSaved: 18,
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    category: 'social',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    isBlocked: false,
    blockReelsOnly: false,
    frictionLevel: 'gentle',
    pauseDurationSec: 5,
    reelsLimitPerDay: 5,
    todayOpenedCount: 1,
    todayReelsIntercepted: 1,
    todayMinutesSaved: 8,
  },
  {
    id: 'snapchat',
    name: 'Snapchat Spotlight',
    packageName: 'com.snapchat.android',
    category: 'social',
    icon: 'logo-snapchat',
    color: '#FFFC00',
    isBlocked: true,
    blockReelsOnly: true,
    frictionLevel: 'standard',
    pauseDurationSec: 5,
    reelsLimitPerDay: 2,
    todayOpenedCount: 2,
    todayReelsIntercepted: 4,
    todayMinutesSaved: 16,
  },
];

const DEFAULT_NOTIFICATIONS: InterceptedNotification[] = [
  {
    id: 'notif-1',
    appName: 'Instagram',
    appIcon: 'logo-instagram',
    title: 'New Reel for you',
    message: 'viral_study_hacks just posted: "How I scored 99% in 3 days"',
    timestamp: '12 min ago',
    isDopamineSpike: true,
    released: false,
  },
  {
    id: 'notif-2',
    appName: 'YouTube',
    appIcon: 'logo-youtube',
    title: 'Shorts recommendation',
    message: 'Watch: "Most satisfying chemistry reaction in 4K"',
    timestamp: '28 min ago',
    isDopamineSpike: true,
    released: false,
  },
  {
    id: 'notif-3',
    appName: 'Snapchat',
    appIcon: 'logo-snapchat',
    title: 'Marcus is typing...',
    message: 'Sent you a new snap video',
    timestamp: '45 min ago',
    isDopamineSpike: true,
    released: false,
  },
  {
    id: 'notif-4',
    appName: 'Study Group',
    appIcon: 'chatbubbles',
    title: 'Study WhatsApp Group',
    message: 'Priya shared: Chapter 6 revision PDF notes',
    timestamp: '1 hr ago',
    isDopamineSpike: false,
    released: false,
  },
];

const DEFAULT_WEEKLY_STATS: DailyStat[] = [
  { date: '2026-10-24', dayLabel: 'Sat', focusMinutes: 180, timeSavedMinutes: 110, reelsIntercepted: 22, dopamineScore: 88 },
  { date: '2026-10-25', dayLabel: 'Sun', focusMinutes: 140, timeSavedMinutes: 95, reelsIntercepted: 18, dopamineScore: 82 },
  { date: '2026-10-26', dayLabel: 'Mon', focusMinutes: 240, timeSavedMinutes: 130, reelsIntercepted: 26, dopamineScore: 92 },
  { date: '2026-10-27', dayLabel: 'Tue', focusMinutes: 210, timeSavedMinutes: 145, reelsIntercepted: 29, dopamineScore: 94 },
  { date: '2026-10-28', dayLabel: 'Wed', focusMinutes: 270, timeSavedMinutes: 160, reelsIntercepted: 31, dopamineScore: 96 },
  { date: '2026-10-29', dayLabel: 'Thu', focusMinutes: 230, timeSavedMinutes: 150, reelsIntercepted: 28, dopamineScore: 95 },
  { date: '2026-10-30', dayLabel: 'Today', focusMinutes: 195, timeSavedMinutes: 175, reelsIntercepted: 38, dopamineScore: 98 },
];

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('shield');
  const [isShieldActive, setIsShieldActive] = useState<boolean>(true);
  const [isNotificationShieldActive, setIsNotificationShieldActive] = useState<boolean>(true);
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>(DEFAULT_BLOCKED_APPS);

  // Friction modal
  const [activeFrictionApp, setActiveFrictionApp] = useState<BlockedApp | null>(null);

  // Doomscroll simulator modal
  const [isDoomscrollModalOpen, setIsDoomscrollModalOpen] = useState<boolean>(false);

  // Unlock modal
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);

  // Soundscape
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeId>('none');
  const [soundscapeVolume, setSoundscapeVolumeState] = useState<number>(0.6);
  const [isSoundscapeModalOpen, setIsSoundscapeModalOpen] = useState<boolean>(false);

  // Timer
  const [timerMode, setTimerModeState] = useState<TimerMode>('pomodoro');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(true);
  const [activeSubject, setActiveSubject] = useState<string>('Organic Chemistry Chapter 4');
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([
    { id: '1', title: 'Review Reaction Mechanisms', subject: 'Chemistry', durationMinutes: 25, completed: true },
    { id: '2', title: 'Solve 15 Practice Questions', subject: 'Chemistry', durationMinutes: 45, completed: false },
    { id: '3', title: 'Active Recall Flashcards', subject: 'Biology', durationMinutes: 20, completed: false },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<InterceptedNotification[]>(DEFAULT_NOTIFICATIONS);
  const nextBatchTime = '5:30 PM (in 1 hr 15m)';

  // Stats
  const [todayStats, setTodayStats] = useState({
    focusMinutes: 195,
    timeSavedMinutes: 175,
    reelsIntercepted: 38,
    dopamineScore: 98,
    streakDays: 7,
  });

  const [weeklyStats, setWeeklyStats] = useState<DailyStat[]>(DEFAULT_WEEKLY_STATS);

  // Timer Tick Interval
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playZenChime();
            triggerHaptic.success();
            // Award focus time
            const addedMinutes = Math.round(totalDurationSeconds / 60);
            setTodayStats((s) => ({
              ...s,
              focusMinutes: s.focusMinutes + addedMinutes,
              dopamineScore: Math.min(100, s.dopamineScore + 2),
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, totalDurationSeconds]);

  // Master shield toggle
  const toggleShield = useCallback(() => {
    setIsShieldActive((prev) => {
      const next = !prev;
      triggerHaptic.medium();
      return next;
    });
  }, []);

  const toggleNotificationShield = useCallback(() => {
    setIsNotificationShieldActive((prev) => {
      const next = !prev;
      triggerHaptic.light();
      return next;
    });
  }, []);

  const toggleAppBlock = useCallback((id: string) => {
    setBlockedApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isBlocked: !app.isBlocked } : app))
    );
    triggerHaptic.light();
  }, []);

  const updateAppFriction = useCallback((id: string, friction: Partial<BlockedApp>) => {
    setBlockedApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...friction } : app))
    );
  }, []);

  // Friction modal trigger
  const triggerFrictionPause = useCallback((app: BlockedApp) => {
    triggerHaptic.warning();
    setActiveFrictionApp(app);
  }, []);

  const closeFrictionModal = useCallback(() => {
    setActiveFrictionApp(null);
  }, []);

  const confirmFrictionPass = useCallback((appId: string, intention: string) => {
    triggerHaptic.medium();
    // User insisted on passing through with intention
    setBlockedApps((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              todayOpenedCount: app.todayOpenedCount + 1,
            }
          : app
      )
    );
    setActiveFrictionApp(null);
  }, []);

  const dismissFrictionToStudy = useCallback((appId: string) => {
    triggerHaptic.success();
    // User chose mindfully to close the app and protect focus!
    setBlockedApps((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              todayReelsIntercepted: app.todayReelsIntercepted + 1,
              todayMinutesSaved: app.todayMinutesSaved + 15,
            }
          : app
      )
    );
    setTodayStats((prev) => ({
      ...prev,
      reelsIntercepted: prev.reelsIntercepted + 1,
      timeSavedMinutes: prev.timeSavedMinutes + 15,
      dopamineScore: Math.min(100, prev.dopamineScore + 3),
    }));
    setActiveFrictionApp(null);
  }, []);

  // Doomscroll simulator
  const openDoomscrollSimulator = useCallback(() => {
    triggerHaptic.light();
    setIsDoomscrollModalOpen(true);
  }, []);

  const closeDoomscrollSimulator = useCallback(() => {
    setIsDoomscrollModalOpen(false);
  }, []);

  const recordDoomscrollIntercept = useCallback(() => {
    triggerHaptic.heavy();
    setTodayStats((prev) => ({
      ...prev,
      reelsIntercepted: prev.reelsIntercepted + 1,
      timeSavedMinutes: prev.timeSavedMinutes + 10,
      dopamineScore: Math.min(100, prev.dopamineScore + 2),
    }));
  }, []);

  // Timer controls
  const setTimerMode = useCallback((mode: TimerMode) => {
    setTimerModeState(mode);
    setIsTimerRunning(false);
    let seconds = 25 * 60;
    if (mode === 'deep_study') seconds = 50 * 60;
    else if (mode === 'custom') seconds = 60 * 60;
    setTotalDurationSeconds(seconds);
    setSecondsRemaining(seconds);
    triggerHaptic.light();
  }, []);

  const startTimer = useCallback(() => {
    triggerHaptic.medium();
    playZenChime();
    setIsTimerRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    if (isStrictMode && isTimerRunning && secondsRemaining > 60) {
      // Trigger emergency unlock challenge!
      openUnlockModal();
      return;
    }
    triggerHaptic.light();
    setIsTimerRunning(false);
  }, [isStrictMode, isTimerRunning, secondsRemaining]);

  const resetTimer = useCallback(
    (minutes?: number) => {
      setIsTimerRunning(false);
      const secs = (minutes || (timerMode === 'pomodoro' ? 25 : timerMode === 'deep_study' ? 50 : 60)) * 60;
      setTotalDurationSeconds(secs);
      setSecondsRemaining(secs);
      triggerHaptic.light();
    },
    [timerMode]
  );

  const toggleStrictMode = useCallback(() => {
    setIsStrictMode((prev) => {
      const next = !prev;
      triggerHaptic.medium();
      return next;
    });
  }, []);

  const addStudyTask = useCallback((title: string, subject: string, durationMinutes: number) => {
    const newTask: StudyTask = {
      id: Date.now().toString(),
      title,
      subject,
      durationMinutes,
      completed: false,
    };
    setStudyTasks((prev) => [newTask, ...prev]);
    triggerHaptic.light();
  }, []);

  const toggleStudyTask = useCallback((id: string) => {
    setStudyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    triggerHaptic.success();
  }, []);

  // Emergency unlock
  const openUnlockModal = useCallback(() => {
    triggerHaptic.warning();
    setIsUnlockModalOpen(true);
  }, []);

  const closeUnlockModal = useCallback(() => {
    setIsUnlockModalOpen(false);
  }, []);

  const confirmEmergencyUnlock = useCallback(() => {
    triggerHaptic.medium();
    setIsTimerRunning(false);
    setIsUnlockModalOpen(false);
  }, []);

  // Soundscape
  const selectSoundscape = useCallback(
    (id: SoundscapeId) => {
      setActiveSoundscape(id);
      if (id === 'none') {
        stopSoundscape();
      } else {
        startSoundscape(id, soundscapeVolume);
      }
      triggerHaptic.light();
    },
    [soundscapeVolume]
  );

  const changeVolume = useCallback((vol: number) => {
    setSoundscapeVolumeState(vol);
    setSoundscapeVolume(vol);
  }, []);

  const openSoundscapeModal = useCallback(() => {
    setIsSoundscapeModalOpen(true);
  }, []);

  const closeSoundscapeModal = useCallback(() => {
    setIsSoundscapeModalOpen(false);
  }, []);

  // Notifications vault
  const releaseNotificationBatch = useCallback(() => {
    triggerHaptic.success();
    setNotifications((prev) => prev.map((n) => ({ ...n, released: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    triggerHaptic.light();
  }, []);

  return (
    <FocusContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isShieldActive,
        toggleShield,
        isNotificationShieldActive,
        toggleNotificationShield,
        blockedApps,
        toggleAppBlock,
        updateAppFriction,
        activeFrictionApp,
        triggerFrictionPause,
        closeFrictionModal,
        confirmFrictionPass,
        dismissFrictionToStudy,
        isDoomscrollModalOpen,
        openDoomscrollSimulator,
        closeDoomscrollSimulator,
        recordDoomscrollIntercept,
        timerMode,
        setTimerMode,
        secondsRemaining,
        totalDurationSeconds,
        isTimerRunning,
        isStrictMode,
        toggleStrictMode,
        activeSubject,
        setActiveSubject,
        startTimer,
        pauseTimer,
        resetTimer,
        studyTasks,
        addStudyTask,
        toggleStudyTask,
        isUnlockModalOpen,
        openUnlockModal,
        closeUnlockModal,
        confirmEmergencyUnlock,
        activeSoundscape,
        soundscapeVolume,
        isSoundscapeModalOpen,
        openSoundscapeModal,
        closeSoundscapeModal,
        selectSoundscape,
        changeVolume,
        notifications,
        releaseNotificationBatch,
        dismissNotification,
        nextBatchTime,
        todayStats,
        weeklyStats,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = (): FocusContextType => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
