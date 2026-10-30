import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const {
    isShieldActive,
    toggleShield,
    todayStats,
    activeSoundscape,
    openSoundscapeModal,
  } = useFocus();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={16} color={Colors.emerald} />
        </View>
        <View>
          <Text style={styles.title}>{title || 'Regain Focus'}</Text>
          <Text style={styles.subtitle}>{subtitle || 'Study & Reels Shield'}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Ambient Soundscape Pill */}
        <TouchableOpacity
          style={[
            styles.soundPill,
            activeSoundscape !== 'none' && styles.soundPillActive,
          ]}
          onPress={openSoundscapeModal}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeSoundscape !== 'none' ? 'volume-high' : 'volume-mute-outline'}
            size={16}
            color={activeSoundscape !== 'none' ? Colors.emerald : Colors.textSecondary}
          />
          {activeSoundscape !== 'none' && <View style={styles.soundDot} />}
        </TouchableOpacity>

        {/* Streak Badge */}
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={Colors.amber} />
          <Text style={styles.streakText}>{todayStats.streakDays}d</Text>
        </View>

        {/* Master Shield Toggle */}
        <TouchableOpacity
          style={[
            styles.shieldPill,
            isShieldActive ? styles.shieldActive : styles.shieldInactive,
          ]}
          onPress={toggleShield}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isShieldActive ? 'shield-checkmark' : 'shield-outline'}
            size={16}
            color={isShieldActive ? Colors.emerald : Colors.textMuted}
          />
          <Text
            style={[
              styles.shieldText,
              { color: isShieldActive ? Colors.emerald : Colors.textMuted },
            ]}
          >
            {isShieldActive ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: Colors.emeraldGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  soundPillActive: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  soundDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberMuted,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.amber,
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
  },
  shieldActive: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  shieldInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
  },
  shieldText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
