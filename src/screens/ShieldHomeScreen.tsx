import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { useFocus } from '../context/FocusContext';
import { triggerHaptic } from '../services/haptics';
import { openAndroidSettings } from '../services/permissions';

export const ShieldHomeScreen: React.FC = () => {
  const {
    isShieldActive,
    toggleShield,
    todayStats,
    blockedApps,
    triggerFrictionPause,
    openDoomscrollSimulator,
    setActiveTab,
    startTimer,
    setTimerMode,
  } = useFocus();

  const activeBlockedCount = blockedApps.filter((a) => a.isBlocked).length;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Shield Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.shieldStatusLeft}>
              <View
                style={[
                  styles.pulseOrb,
                  { backgroundColor: isShieldActive ? Colors.emerald : Colors.coral },
                ]}
              >
                <Ionicons
                  name={isShieldActive ? 'shield-checkmark' : 'shield-outline'}
                  size={26}
                  color="#FFF"
                />
              </View>
              <View>
                <Text style={styles.heroTitle}>
                  {isShieldActive ? 'Regain Shield Active' : 'Shield Suspended'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {isShieldActive
                    ? `${activeBlockedCount} apps protected against reels & doomscrolling`
                    : 'Friction pauses and reels blocking are turned off'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.masterToggleBtn,
                isShieldActive ? styles.masterToggleOn : styles.masterToggleOff,
              ]}
              onPress={toggleShield}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.masterToggleText,
                  { color: isShieldActive ? Colors.emerald : Colors.textMuted },
                ]}
              >
                {isShieldActive ? 'DISARM' : 'ENGAGE'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dopamine Score Bar */}
          <View style={styles.dopamineScoreBox}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreTitleGroup}>
                <Ionicons name="sparkles" size={16} color={Colors.emerald} />
                <Text style={styles.scoreHeading}>Dopamine Detox Score</Text>
              </View>
              <Text style={styles.scoreValue}>{todayStats.dopamineScore}/100</Text>
            </View>
            <View style={styles.scoreTrack}>
              <View
                style={[
                  styles.scoreFill,
                  { width: `${todayStats.dopamineScore}%` },
                ]}
              />
            </View>
            <Text style={styles.scoreCaption}>
              Elite Focus Zone: You resisted 94% of subconscious scroll triggers today!
            </Text>
          </View>
        </View>

        {/* Quick Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: Colors.emeraldMuted }]}>
              <Ionicons name="time" size={18} color={Colors.emerald} />
            </View>
            <Text style={styles.statNumber}>
              {Math.floor(todayStats.timeSavedMinutes / 60)}h {todayStats.timeSavedMinutes % 60}m
            </Text>
            <Text style={styles.statLabel}>Reclaimed from Reels</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: Colors.violetMuted }]}>
              <Ionicons name="hand-left" size={18} color={Colors.violet} />
            </View>
            <Text style={styles.statNumber}>{todayStats.reelsIntercepted}</Text>
            <Text style={styles.statLabel}>Scrolls Intercepted</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: Colors.cyanGlow }]}>
              <Ionicons name="school" size={18} color={Colors.cyan} />
            </View>
            <Text style={styles.statNumber}>
              {Math.floor(todayStats.focusMinutes / 60)}h {todayStats.focusMinutes % 60}m
            </Text>
            <Text style={styles.statLabel}>Deep Study Time</Text>
          </View>
        </View>

        {/* Call Protection & Native Shield Status Card */}
        <View style={styles.callProtectionCard}>
          <View style={styles.callProtectionTopRow}>
            <View style={styles.callBadgeIcon}>
              <Ionicons name="call" size={18} color={Colors.emerald} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.callProtectionTitle}>Phone Calls 100% Whitelisted</Text>
              <Text style={styles.callProtectionSubtitle}>
                Reels, Shorts, and social media notifications are blocked, but incoming phone calls will ALWAYS ring through.
              </Text>
            </View>
            <View style={styles.whitelistedPill}>
              <Text style={styles.whitelistedPillText}>ALLOWED</Text>
            </View>
          </View>

          <View style={styles.nativePermissionsChecklist}>
            <View style={styles.permCheckItem}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.emerald} />
              <Text style={styles.permCheckText}>Instagram & YouTube Shorts Blocker configured</Text>
            </View>
            <View style={styles.permCheckItem}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.emerald} />
              <Text style={styles.permCheckText}>Spam & Reel Notifications Silenced</Text>
            </View>
            <View style={styles.permCheckItem}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.emerald} />
              <Text style={styles.permCheckText}>Native Overlay Privileges (SYSTEM_ALERT_WINDOW)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.openSettingsBtn}
            onPress={() => openAndroidSettings.appSettings()}
            activeOpacity={0.8}
          >
            <Ionicons name="shield" size={16} color="#090B10" />
            <Text style={styles.openSettingsBtnText}>Check Phone Blocker Permissions</Text>
          </TouchableOpacity>
        </View>

        {/* Live Regain Simulations Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Test Your Shield Live</Text>
          <Text style={styles.sectionDescription}>
            Experience how Regain intercepts subconscious phone pickups and infinite scrolling:
          </Text>

          <View style={styles.simulationsRow}>
            {/* Simulation 1: Friction Pause */}
            <TouchableOpacity
              style={styles.simCard}
              onPress={() => {
                const ig = blockedApps.find((a) => a.id === 'instagram') || blockedApps[0];
                triggerFrictionPause(ig);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.simIconRing, { backgroundColor: 'rgba(225, 48, 108, 0.2)' }]}>
                <Ionicons name="leaf" size={22} color="#E1306C" />
              </View>
              <View style={styles.simTextContainer}>
                <Text style={styles.simTitle}>Simulate Opening Reels</Text>
                <Text style={styles.simSubtitle}>
                  Triggers the breathing pause & mindful intention question
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Simulation 2: Doomscroll Breaker */}
            <TouchableOpacity
              style={styles.simCard}
              onPress={openDoomscrollSimulator}
              activeOpacity={0.8}
            >
              <View style={[styles.simIconRing, { backgroundColor: Colors.coralMuted }]}>
                <Ionicons name="infinite" size={22} color={Colors.coral} />
              </View>
              <View style={styles.simTextContainer}>
                <Text style={styles.simTitle}>Test Doomscroll Breaker</Text>
                <Text style={styles.simSubtitle}>
                  Swiping past 3 reels locks the feed and reclaims focus
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Launch Study Modes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Quick Study Lock</Text>
            <TouchableOpacity
              onPress={() => setActiveTab('timer')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Open Timer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.studyModesRow}>
            <TouchableOpacity
              style={styles.studyModeCard}
              onPress={() => {
                triggerHaptic.medium();
                setTimerMode('pomodoro');
                startTimer();
                setActiveTab('timer');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="timer" size={22} color={Colors.emerald} />
              <Text style={styles.studyModeName}>25m Pomodoro</Text>
              <Text style={styles.studyModeDesc}>High intensity sprint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.studyModeCard}
              onPress={() => {
                triggerHaptic.medium();
                setTimerMode('deep_study');
                startTimer();
                setActiveTab('timer');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flame" size={22} color={Colors.violet} />
              <Text style={styles.studyModeName}>50m Deep Flow</Text>
              <Text style={styles.studyModeDesc}>Complete lockdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Monitored Apps Snapshot */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Shielded Distractions</Text>
            <TouchableOpacity
              onPress={() => setActiveTab('blocker')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>Configure ({blockedApps.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appsSnapshotList}>
            {blockedApps.slice(0, 4).map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.appSnapshotItem}
                onPress={() => triggerFrictionPause(app)}
                activeOpacity={0.75}
              >
                <View style={[styles.appSnapIcon, { backgroundColor: app.color }]}>
                  <Ionicons name={app.icon as any} size={16} color="#FFF" />
                </View>
                <View style={styles.appSnapDetails}>
                  <Text style={styles.appSnapName}>{app.name}</Text>
                  <Text style={styles.appSnapStatus}>
                    {app.blockReelsOnly ? 'Reels & Shorts Only' : 'Entire App Blocked'}
                  </Text>
                </View>
                <View style={styles.appSnapStats}>
                  <Text style={styles.appSnapSaved}>{app.todayMinutesSaved}m saved</Text>
                  <Text style={styles.appSnapCount}>{app.todayReelsIntercepted} blocked</Text>
                </View>
              </TouchableOpacity>
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
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shieldStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pulseOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: 180,
  },
  masterToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  masterToggleOn: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  masterToggleOff: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.surfaceBorder,
  },
  masterToggleText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dopamineScoreBox: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreHeading: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  scoreValue: {
    color: Colors.emerald,
    fontSize: 15,
    fontWeight: '800',
  },
  scoreTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: Colors.emerald,
    borderRadius: 4,
  },
  scoreCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionContainer: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  seeAllText: {
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: '700',
  },
  simulationsRow: {
    gap: 10,
  },
  simCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  simIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simTextContainer: {
    flex: 1,
  },
  simTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  simSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  studyModesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  studyModeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  studyModeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  studyModeDesc: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  appsSnapshotList: {
    gap: 8,
  },
  appSnapshotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  appSnapIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appSnapDetails: {
    flex: 1,
  },
  appSnapName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  appSnapStatus: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  appSnapStats: {
    alignItems: 'flex-end',
  },
  appSnapSaved: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
  appSnapCount: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  callProtectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  callProtectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  callBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.emeraldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callProtectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  callProtectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  whitelistedPill: {
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: Colors.emerald,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  whitelistedPillText: {
    color: Colors.emerald,
    fontSize: 10,
    fontWeight: '800',
  },
  nativePermissionsChecklist: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  permCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permCheckText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  openSettingsBtn: {
    backgroundColor: Colors.emerald,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  openSettingsBtnText: {
    color: '#090B10',
    fontSize: 12,
    fontWeight: '800',
  },
});
