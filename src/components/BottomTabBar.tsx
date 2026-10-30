import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { TabType } from '../types';
import { triggerHaptic } from '../services/haptics';

interface TabItem {
  key: TabType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, notifications, isTimerRunning } = useFocus();

  const unreadCount = notifications.filter((n) => !n.released).length;

  const tabs: TabItem[] = [
    { key: 'shield', label: 'Shield', icon: 'shield-checkmark' },
    { key: 'timer', label: 'Study', icon: isTimerRunning ? 'hourglass' : 'timer' },
    { key: 'blocker', label: 'Blocker', icon: 'apps' },
    { key: 'notifications', label: 'Vault', icon: 'notifications', badge: unreadCount },
    { key: 'analytics', label: 'Detox', icon: 'stats-chart' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => {
              triggerHaptic.light();
              setActiveTab(tab.key);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? Colors.emerald : Colors.textMuted}
              />
              {tab.badge && tab.badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? Colors.emerald : Colors.textMuted },
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: Colors.emeraldMuted,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: Colors.coral,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
