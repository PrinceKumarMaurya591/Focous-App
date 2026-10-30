import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { SoundscapeId, SoundscapeTrack } from '../types';
import { triggerHaptic } from '../services/haptics';

const TRACKS: SoundscapeTrack[] = [
  {
    id: 'alpha_binaural',
    name: '10Hz Alpha Waves',
    subtitle: 'Binaural beats for high-retention study',
    icon: 'pulse',
    color: Colors.emerald,
    description: 'Calculated 200Hz/210Hz frequencies to induce calm concentration.',
  },
  {
    id: 'rain_zen',
    name: 'Rain on Leaves',
    subtitle: 'Procedural pink noise rainstorm',
    icon: 'rainy',
    color: Colors.cyan,
    description: 'Filtered pink spectrum mimics calming drizzle to soothe overstimulation.',
  },
  {
    id: 'white_noise',
    name: 'Broadband Mask',
    subtitle: 'Deep white noise blocker',
    icon: 'radio',
    color: Colors.violet,
    description: 'Uniform sound envelope designed to block room talking and door knocks.',
  },
  {
    id: 'midnight_cafe',
    name: 'Midnight Flow',
    subtitle: 'Subtle atmospheric harmonics',
    icon: 'cafe',
    color: Colors.amber,
    description: 'Gentle low-register acoustic drone for extended late-night reading.',
  },
  {
    id: 'forest_flow',
    name: '432Hz Resonance',
    subtitle: 'Natural tuning harmonics',
    icon: 'leaf',
    color: Colors.emerald,
    description: 'Grounding frequency cluster to reduce study anxiety and mental fatigue.',
  },
];

export const SoundscapePlayerModal: React.FC = () => {
  const {
    isSoundscapeModalOpen,
    closeSoundscapeModal,
    activeSoundscape,
    selectSoundscape,
    soundscapeVolume,
    changeVolume,
  } = useFocus();

  if (!isSoundscapeModalOpen) return null;

  return (
    <Modal
      visible={isSoundscapeModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closeSoundscapeModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Ambient Focus Soundscapes</Text>
              <Text style={styles.subtitle}>
                Zero-distraction audio synthesis for deep study flow
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeSoundscapeModal}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Volume Presets */}
          <View style={styles.volumeBox}>
            <Text style={styles.volumeLabel}>Master Volume</Text>
            <View style={styles.volumeRow}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((vol) => (
                <TouchableOpacity
                  key={vol}
                  style={[
                    styles.volChip,
                    Math.abs(soundscapeVolume - vol) < 0.1 && styles.volChipActive,
                  ]}
                  onPress={() => {
                    triggerHaptic.light();
                    changeVolume(vol);
                  }}
                >
                  <Text
                    style={[
                      styles.volChipText,
                      Math.abs(soundscapeVolume - vol) < 0.1 && styles.volChipTextActive,
                    ]}
                  >
                    {Math.round(vol * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Soundscapes List */}
          <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
            {/* Mute Option */}
            <TouchableOpacity
              style={[
                styles.trackCard,
                activeSoundscape === 'none' && styles.trackCardActive,
              ]}
              onPress={() => selectSoundscape('none')}
              activeOpacity={0.8}
            >
              <View style={[styles.iconRing, { backgroundColor: Colors.surfaceLight }]}>
                <Ionicons name="volume-mute" size={22} color={Colors.textMuted} />
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>Silence / Mute</Text>
                <Text style={styles.trackSubtitle}>No background audio</Text>
              </View>
              {activeSoundscape === 'none' && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.emerald} />
              )}
            </TouchableOpacity>

            {TRACKS.map((track) => {
              const isActive = activeSoundscape === track.id;
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.trackCard, isActive && styles.trackCardActive]}
                  onPress={() => selectSoundscape(track.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconRing, { backgroundColor: `${track.color}20` }]}>
                    <Ionicons name={track.icon as any} size={22} color={track.color} />
                  </View>
                  <View style={styles.trackInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.trackName}>{track.name}</Text>
                      {isActive && (
                        <View style={styles.playingBadge}>
                          <Text style={styles.playingText}>PLAYING</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.trackSubtitle}>{track.subtitle}</Text>
                    <Text style={styles.trackDesc}>{track.description}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.emerald} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeBox: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  volumeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  volChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  volChipActive: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  volChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  volChipTextActive: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  trackList: {
    gap: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  trackCardActive: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldMuted,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  playingBadge: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playingText: {
    color: '#090B10',
    fontSize: 9,
    fontWeight: '800',
  },
  trackSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  trackDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
});
