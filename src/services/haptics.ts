import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = {
  light: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(10);
        }
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  },
  medium: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}
  },
  heavy: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(45);
        }
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {}
  },
  success: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([20, 50, 30]);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}
  },
  warning: () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([30, 60, 30]);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {}
  },
};
