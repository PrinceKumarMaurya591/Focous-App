import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FocusProvider, useFocus } from './src/context/FocusContext';
import { Colors } from './src/theme/colors';

import { ShieldHomeScreen } from './src/screens/ShieldHomeScreen';
import { StudyTimerScreen } from './src/screens/StudyTimerScreen';
import { BlockerConfigScreen } from './src/screens/BlockerConfigScreen';
import { NotificationVaultScreen } from './src/screens/NotificationVaultScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

import { BottomTabBar } from './src/components/BottomTabBar';
import { BreathingModal } from './src/components/BreathingModal';
import { DoomscrollSimulatorModal } from './src/components/DoomscrollSimulatorModal';
import { EmergencyUnlockModal } from './src/components/EmergencyUnlockModal';
import { SoundscapePlayerModal } from './src/components/SoundscapePlayerModal';

const MainNavigator: React.FC = () => {
  const { activeTab } = useFocus();

  return (
    <View style={styles.mainContent}>
      {activeTab === 'shield' && <ShieldHomeScreen />}
      {activeTab === 'timer' && <StudyTimerScreen />}
      {activeTab === 'blocker' && <BlockerConfigScreen />}
      {activeTab === 'notifications' && <NotificationVaultScreen />}
      {activeTab === 'analytics' && <AnalyticsScreen />}

      <BottomTabBar />

      {/* Interactive Regain Modals */}
      <BreathingModal />
      <DoomscrollSimulatorModal />
      <EmergencyUnlockModal />
      <SoundscapePlayerModal />
    </View>
  );
};

export default function App() {
  return (
    <FocusProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.rootWrapper}>
          <MainNavigator />
        </View>
      </SafeAreaView>
    </FocusProvider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  rootWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 460 : '100%',
    alignSelf: 'center',
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh' as any,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }
      : {}),
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
