import { Linking, Platform } from 'react-native';

export interface AndroidPermissionStatus {
  overlayGranted: boolean;
  usageStatsGranted: boolean;
  dndGranted: boolean;
  callsWhitelisted: boolean;
}

export const openAndroidSettings = {
  // Opens the app's details page in Android Settings
  appSettings: async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.openSettings();
      }
    } catch {}
  },

  // Open "Display over other apps" permission screen
  overlayPermission: async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.openURL('package:com.princekumar.regainfocus');
      }
    } catch {
      await Linking.openSettings();
    }
  },

  // Open "Usage Access" settings
  usageAccessSettings: async () => {
    try {
      if (Platform.OS === 'android') {
        await Linking.openSettings();
      }
    } catch {}
  },
};
