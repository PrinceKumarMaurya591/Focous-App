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
import { useFocus } from '../context/FocusContext';
import { Header } from '../components/Header';
import { triggerHaptic } from '../services/haptics';

export const NotificationVaultScreen: React.FC = () => {
  const {
    isNotificationShieldActive,
    toggleNotificationShield,
    notifications,
    releaseNotificationBatch,
    dismissNotification,
    nextBatchTime,
  } = useFocus();

  const unreleased = notifications.filter((n) => !n.released);
  const released = notifications.filter((n) => n.released);

  return (
    <View style={styles.container}>
      <Header title="Notification Vault" subtitle="Dopamine Shield" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Silencer Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroLeft}>
              <View
                style={[
                  styles.iconRing,
                  {
                    backgroundColor: isNotificationShieldActive
                      ? Colors.emeraldMuted
                      : Colors.surfaceLight,
                  },
                ]}
              >
                <Ionicons
                  name={
                    isNotificationShieldActive
                      ? 'notifications-off'
                      : 'notifications-outline'
                  }
                  size={24}
                  color={
                    isNotificationShieldActive ? Colors.emerald : Colors.textMuted
                  }
                />
              </View>
              <View>
                <Text style={styles.heroTitle}>Notification Shield</Text>
                <Text style={styles.heroSubtitle}>
                  {isNotificationShieldActive
                    ? 'Catching & batching alerts during study'
                    : 'Alerts are sounding immediately'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                isNotificationShieldActive ? styles.toggleOn : styles.toggleOff,
              ]}
              onPress={toggleNotificationShield}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  {
                    color: isNotificationShieldActive
                      ? Colors.emerald
                      : Colors.textMuted,
                  },
                ]}
              >
                {isNotificationShieldActive ? 'ACTIVE' : 'MUTED'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Batch Delivery Schedule Pill */}
          <View style={styles.batchPillBox}>
            <Ionicons name="time" size={16} color={Colors.cyan} />
            <Text style={styles.batchPillText}>
              Next Batched Delivery: <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{nextBatchTime}</Text>
            </Text>
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionsBar}>
          <Text style={styles.sectionHeader}>
            Intercepted Vault ({unreleased.length} pending)
          </Text>
          {unreleased.length > 0 && (
            <TouchableOpacity
              style={styles.releaseBatchBtn}
              onPress={releaseNotificationBatch}
              activeOpacity={0.8}
            >
              <Ionicons name="eye" size={14} color="#090B10" />
              <Text style={styles.releaseBatchText}>Review Batch Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {unreleased.length > 0 ? (
          <View style={styles.notifList}>
            {unreleased.map((notif) => (
              <View key={notif.id} style={styles.notifCard}>
                <View style={styles.notifHeader}>
                  <View style={styles.notifAppGroup}>
                    <Ionicons
                      name={notif.appIcon as any}
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.notifAppName}>{notif.appName}</Text>
                    <Text style={styles.notifTimestamp}>• {notif.timestamp}</Text>
                  </View>

                  {notif.isDopamineSpike && (
                    <View style={styles.dopamineSpikeBadge}>
                      <Ionicons name="flash" size={10} color={Colors.coral} />
                      <Text style={styles.dopamineSpikeText}>Dopamine Bait</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>

                <View style={styles.notifFooter}>
                  <Text style={styles.shieldProtectedNotice}>
                    🛡️ Silenced to preserve study focus
                  </Text>
                  <TouchableOpacity
                    onPress={() => dismissNotification(notif.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyVaultBox}>
            <Ionicons name="checkmark-done-circle" size={48} color={Colors.emerald} />
            <Text style={styles.emptyVaultTitle}>Zero Distraction Clean Slate</Text>
            <Text style={styles.emptyVaultSubtitle}>
              All incoming notification noise has been reviewed. Your study environment is calm.
            </Text>
          </View>
        )}

        {/* Previously Released Section */}
        {released.length > 0 && (
          <View style={styles.releasedSection}>
            <Text style={styles.releasedHeader}>Released in Previous Breaks</Text>
            {released.map((notif) => (
              <View key={notif.id} style={styles.releasedItem}>
                <Ionicons name="checkmark" size={14} color={Colors.emerald} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.releasedAppName}>{notif.appName}: {notif.title}</Text>
                  <Text style={styles.releasedMsg}>{notif.message}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: 190,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  toggleOff: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.surfaceBorder,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  batchPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  batchPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  releaseBatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emerald,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  releaseBatchText: {
    color: '#090B10',
    fontSize: 11,
    fontWeight: '800',
  },
  notifList: {
    gap: 10,
  },
  notifCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifAppGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifAppName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  notifTimestamp: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dopamineSpikeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coralMuted,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  dopamineSpikeText: {
    color: Colors.coral,
    fontSize: 9,
    fontWeight: '700',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notifMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  shieldProtectedNotice: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyVaultBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyVaultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyVaultSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  releasedSection: {
    gap: 8,
    marginTop: 6,
  },
  releasedHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  releasedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    opacity: 0.6,
  },
  releasedAppName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  releasedMsg: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
