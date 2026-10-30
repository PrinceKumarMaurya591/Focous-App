import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { Header } from '../components/Header';
import { AchievementBadge } from '../types';

const BADGES: AchievementBadge[] = [
  {
    id: 'b1',
    title: 'Reels Slayer',
    description: 'Blocked 25+ short-form video temptations',
    icon: 'shield-checkmark',
    unlocked: true,
    progress: 1,
  },
  {
    id: 'b2',
    title: 'Dopamine Monk',
    description: 'Maintained 7 consecutive days of 90+ focus score',
    icon: 'leaf',
    unlocked: true,
    progress: 1,
  },
  {
    id: 'b3',
    title: 'Deep Study Titan',
    description: 'Completed 10 hours of uninterrupted study blocks',
    icon: 'school',
    unlocked: true,
    progress: 1,
  },
  {
    id: 'b4',
    title: 'Zero Scroll Champion',
    description: 'Complete 3 full days without opening any social feeds',
    icon: 'trophy',
    unlocked: false,
    progress: 0.7,
  },
];

export const AnalyticsScreen: React.FC = () => {
  const { todayStats, weeklyStats, blockedApps } = useFocus();

  const maxWeeklyMinutes = Math.max(...weeklyStats.map((w) => w.focusMinutes + w.timeSavedMinutes));

  return (
    <View style={styles.container}>
      <Header title="Detox Analytics" subtitle="Reclaimed Attention" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Highlight Banner */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightBadge}>
            <Ionicons name="sparkles" size={16} color={Colors.emerald} />
            <Text style={styles.highlightBadgeText}>Weekly Reclaimed Time</Text>
          </View>
          <Text style={styles.highlightNumber}>14h 45m</Text>
          <Text style={styles.highlightSubtitle}>
            Time previously lost to algorithm feeds, now channeled into exam prep & deep study.
          </Text>

          <View style={styles.quickStatPillsRow}>
            <View style={styles.quickStatPill}>
              <Text style={styles.quickStatPillNumber}>182</Text>
              <Text style={styles.quickStatPillLabel}>Reels Blocked</Text>
            </View>
            <View style={styles.quickStatPill}>
              <Text style={styles.quickStatPillNumber}>98%</Text>
              <Text style={styles.quickStatPillLabel}>Focus Purity</Text>
            </View>
            <View style={styles.quickStatPill}>
              <Text style={styles.quickStatPillNumber}>7 Days</Text>
              <Text style={styles.quickStatPillLabel}>Clean Streak</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Activity Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartTitle}>7-Day Focus & Time Saved</Text>
              <Text style={styles.chartSubtitle}>
                Study minutes (Green) vs Reels blocked (Violet)
              </Text>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            {weeklyStats.map((item, idx) => {
              const focusHeight = Math.max(12, (item.focusMinutes / maxWeeklyMinutes) * 110);
              const savedHeight = Math.max(8, (item.timeSavedMinutes / maxWeeklyMinutes) * 110);

              return (
                <View key={idx} style={styles.barCol}>
                  <View style={styles.barsPair}>
                    {/* Time saved bar */}
                    <View
                      style={[
                        styles.barFill,
                        { height: savedHeight, backgroundColor: Colors.violet },
                      ]}
                    />
                    {/* Focus study bar */}
                    <View
                      style={[
                        styles.barFill,
                        { height: focusHeight, backgroundColor: Colors.emerald },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{item.dayLabel}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.emerald }]} />
              <Text style={styles.legendText}>Study Sessions</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.violet }]} />
              <Text style={styles.legendText}>Reclaimed from Reels</Text>
            </View>
          </View>
        </View>

        {/* App Distraction Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.chartTitle}>Interception Breakdown</Text>
          <Text style={styles.chartSubtitle}>
            Where your attention was guarded most today
          </Text>

          <View style={styles.breakdownList}>
            {blockedApps.map((app) => (
              <View key={app.id} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.miniAppIcon, { backgroundColor: app.color }]}>
                      <Ionicons name={app.icon as any} size={14} color="#FFF" />
                    </View>
                    <Text style={styles.breakdownAppName}>{app.name}</Text>
                  </View>
                  <Text style={styles.breakdownMinutes}>
                    {app.todayMinutesSaved}m saved ({app.todayReelsIntercepted} intercepts)
                  </Text>
                </View>

                <View style={styles.breakdownTrack}>
                  <View
                    style={[
                      styles.breakdownBar,
                      {
                        width: `${Math.min(100, (app.todayMinutesSaved / 60) * 100)}%`,
                        backgroundColor: app.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={styles.sectionCard}>
          <Text style={styles.chartTitle}>Detox Achievements</Text>
          <Text style={styles.chartSubtitle}>
            Milestones of psychological resistance and deep work habits
          </Text>

          <View style={styles.badgesList}>
            {BADGES.map((b) => (
              <View
                key={b.id}
                style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}
              >
                <View
                  style={[
                    styles.badgeIconRing,
                    {
                      backgroundColor: b.unlocked
                        ? Colors.emeraldMuted
                        : Colors.surfaceLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={b.icon as any}
                    size={22}
                    color={b.unlocked ? Colors.emerald : Colors.textMuted}
                  />
                </View>
                <View style={styles.badgeInfo}>
                  <View style={styles.badgeTitleRow}>
                    <Text style={styles.badgeTitle}>{b.title}</Text>
                    {b.unlocked ? (
                      <View style={styles.unlockedTag}>
                        <Text style={styles.unlockedTagText}>UNLOCKED</Text>
                      </View>
                    ) : (
                      <Text style={styles.progressPercentText}>
                        {Math.round(b.progress * 100)}%
                      </Text>
                    )}
                  </View>
                  <Text style={styles.badgeDesc}>{b.description}</Text>
                </View>
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
    gap: 18,
  },
  highlightCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.emeraldGlow,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightBadgeText: {
    color: Colors.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  highlightNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  highlightSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  quickStatPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  quickStatPill: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  quickStatPillNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  quickStatPillLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  chartHeaderRow: {
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 16,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  barCol: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  barFill: {
    width: 8,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  breakdownList: {
    gap: 12,
    marginTop: 6,
  },
  breakdownItem: {
    gap: 6,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAppIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownAppName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  breakdownMinutes: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  breakdownTrack: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    borderRadius: 3,
  },
  badgesList: {
    gap: 10,
    marginTop: 6,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  unlockedTag: {
    backgroundColor: Colors.emerald,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unlockedTagText: {
    color: '#090B10',
    fontSize: 8,
    fontWeight: '800',
  },
  progressPercentText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  badgeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
