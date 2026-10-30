import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { Header } from '../components/Header';
import { BlockedApp, FrictionLevel } from '../types';
import { triggerHaptic } from '../services/haptics';

export const BlockerConfigScreen: React.FC = () => {
  const {
    blockedApps,
    toggleAppBlock,
    updateAppFriction,
    triggerFrictionPause,
  } = useFocus();

  const [customAppName, setCustomAppName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('morning');

  return (
    <View style={styles.container}>
      <Header title="Shield & Reels Blocker" subtitle="Manage Friction Rules" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Concept Explainer */}
        <View style={styles.infoBanner}>
          <Ionicons name="sparkles" size={20} color={Colors.emerald} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>How Regain Shield Blocks Reels</Text>
            <Text style={styles.infoSubtitle}>
              When enabled, opening Instagram Reels or YouTube Shorts triggers a breathing pause.
              Infinite feeds are automatically locked once you hit your daily limit.
            </Text>
          </View>
        </View>

        {/* Schedule Automation */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Scheduled Study Windows</Text>
          <View style={styles.scheduleRow}>
            {[
              { id: 'morning', label: 'Morning', time: '09:00 - 12:00', icon: 'sunny' },
              { id: 'evening', label: 'Evening', time: '17:00 - 21:00', icon: 'moon' },
              { id: 'all_day', label: 'Exam Mode', time: 'Strict 24/7', icon: 'flash' },
            ].map((sched) => {
              const isSelected = selectedSchedule === sched.id;
              return (
                <TouchableOpacity
                  key={sched.id}
                  style={[styles.schedCard, isSelected && styles.schedCardActive]}
                  onPress={() => {
                    triggerHaptic.light();
                    setSelectedSchedule(sched.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={sched.icon as any}
                    size={18}
                    color={isSelected ? Colors.emerald : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.schedLabel,
                      isSelected && styles.schedLabelActive,
                    ]}
                  >
                    {sched.label}
                  </Text>
                  <Text style={styles.schedTime}>{sched.time}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Apps Config List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Distraction Apps & Feeds</Text>

          <View style={styles.appsList}>
            {blockedApps.map((app) => (
              <View key={app.id} style={styles.appCard}>
                {/* Header Row */}
                <View style={styles.appCardHeader}>
                  <View style={styles.appCardLeft}>
                    <View style={[styles.appIconCircle, { backgroundColor: app.color }]}>
                      <Ionicons name={app.icon as any} size={18} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.appName}>{app.name}</Text>
                      <Text style={styles.appCategory}>
                        {app.todayMinutesSaved}m reclaimed today
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      app.isBlocked ? styles.toggleOn : styles.toggleOff,
                    ]}
                    onPress={() => toggleAppBlock(app.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        app.isBlocked && styles.toggleThumbOn,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                {app.isBlocked && (
                  <View style={styles.appSettingsDrawer}>
                    {/* Scope: Reels Only vs Entire App */}
                    <View style={styles.scopeRow}>
                      <Text style={styles.settingLabel}>Blocking Scope:</Text>
                      <View style={styles.scopeTogglePill}>
                        <TouchableOpacity
                          style={[
                            styles.scopeOption,
                            app.blockReelsOnly && styles.scopeOptionActive,
                          ]}
                          onPress={() => {
                            triggerHaptic.light();
                            updateAppFriction(app.id, { blockReelsOnly: true });
                          }}
                        >
                          <Text
                            style={[
                              styles.scopeOptionText,
                              app.blockReelsOnly && styles.scopeOptionTextActive,
                            ]}
                          >
                            Reels / Shorts Only
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.scopeOption,
                            !app.blockReelsOnly && styles.scopeOptionActive,
                          ]}
                          onPress={() => {
                            triggerHaptic.light();
                            updateAppFriction(app.id, { blockReelsOnly: false });
                          }}
                        >
                          <Text
                            style={[
                              styles.scopeOptionText,
                              !app.blockReelsOnly && styles.scopeOptionTextActive,
                            ]}
                          >
                            Full App
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Friction Pause Duration */}
                    <View style={styles.frictionRow}>
                      <Text style={styles.settingLabel}>Breathing Pause:</Text>
                      <View style={styles.pausePills}>
                        {[3, 5, 10].map((sec) => {
                          const isSelected = app.pauseDurationSec === sec;
                          return (
                            <TouchableOpacity
                              key={sec}
                              style={[
                                styles.pausePill,
                                isSelected && styles.pausePillActive,
                              ]}
                              onPress={() => {
                                triggerHaptic.light();
                                updateAppFriction(app.id, { pauseDurationSec: sec });
                              }}
                            >
                              <Text
                                style={[
                                  styles.pausePillText,
                                  isSelected && styles.pausePillTextActive,
                                ]}
                              >
                                {sec}s
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Reels Scroll Budget */}
                    <View style={styles.frictionRow}>
                      <Text style={styles.settingLabel}>Doomscroll Budget:</Text>
                      <View style={styles.pausePills}>
                        {[0, 3, 5].map((count) => {
                          const isSelected = app.reelsLimitPerDay === count;
                          return (
                            <TouchableOpacity
                              key={count}
                              style={[
                                styles.pausePill,
                                isSelected && styles.pausePillActive,
                              ]}
                              onPress={() => {
                                triggerHaptic.light();
                                updateAppFriction(app.id, { reelsLimitPerDay: count });
                              }}
                            >
                              <Text
                                style={[
                                  styles.pausePillText,
                                  isSelected && styles.pausePillTextActive,
                                ]}
                              >
                                {count === 0 ? '0 (Zero)' : `${count} reels`}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Test Button */}
                    <TouchableOpacity
                      style={styles.testFrictionBtn}
                      onPress={() => triggerFrictionPause(app)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="leaf" size={14} color={Colors.emerald} />
                      <Text style={styles.testFrictionText}>
                        Test Breathing Pause on {app.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.emeraldGlow,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.emerald,
  },
  infoSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  schedCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  schedCardActive: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldMuted,
  },
  schedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  schedLabelActive: {
    color: Colors.emerald,
  },
  schedTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  appsList: {
    gap: 12,
  },
  appCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 14,
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appCategory: {
    fontSize: 11,
    color: Colors.emerald,
    marginTop: 1,
    fontWeight: '600',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: Colors.emerald,
  },
  toggleOff: {
    backgroundColor: Colors.surfaceLight,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  appSettingsDrawer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    gap: 12,
  },
  settingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scopeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scopeTogglePill: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 2,
  },
  scopeOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scopeOptionActive: {
    backgroundColor: Colors.emerald,
  },
  scopeOptionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  scopeOptionTextActive: {
    color: '#090B10',
    fontWeight: '700',
  },
  frictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pausePills: {
    flexDirection: 'row',
    gap: 6,
  },
  pausePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pausePillActive: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  pausePillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pausePillTextActive: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  testFrictionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 8,
    gap: 6,
    marginTop: 2,
  },
  testFrictionText: {
    fontSize: 11,
    color: Colors.emerald,
    fontWeight: '700',
  },
});
