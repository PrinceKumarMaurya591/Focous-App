import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { triggerHaptic } from '../services/haptics';

export const BreathingModal: React.FC = () => {
  const {
    activeFrictionApp,
    closeFrictionModal,
    confirmFrictionPass,
    dismissFrictionToStudy,
  } = useFocus();

  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [canProceed, setCanProceed] = useState<boolean>(false);
  const [selectedIntention, setSelectedIntention] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  const defaultIntentions = [
    'Quick urgent message to a friend',
    'Look up specific study reference',
    'Just reflex / habit (bored)',
  ];

  // Reset and start countdown when modal opens
  useEffect(() => {
    if (activeFrictionApp) {
      const duration = activeFrictionApp.pauseDurationSec || 5;
      setSecondsRemaining(duration);
      setCanProceed(false);
      setSelectedIntention('');
      setCustomReason('');
      setPhase('inhale');

      // Breathing animation loop
      const runBreathingLoop = () => {
        // Inhale (scale up)
        setPhase('inhale');
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.4,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.9,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Hold
          setPhase('hold');
          setTimeout(() => {
            // Exhale (scale down)
            setPhase('exhale');
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.4,
                duration: 2500,
                useNativeDriver: true,
              }),
            ]).start(() => {
              runBreathingLoop();
            });
          }, 1500);
        });
      };

      runBreathingLoop();

      // Countdown interval
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            triggerHaptic.light();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        scaleAnim.stopAnimation();
        opacityAnim.stopAnimation();
      };
    }
  }, [activeFrictionApp, opacityAnim, scaleAnim]);

  if (!activeFrictionApp) return null;

  const handleReturnToStudy = () => {
    dismissFrictionToStudy(activeFrictionApp.id);
  };

  const handleContinue = () => {
    const finalReason = customReason.trim() || selectedIntention || 'Intentional visit';
    confirmFrictionPass(activeFrictionApp.id, finalReason);
  };

  const phaseInstruction =
    phase === 'inhale'
      ? 'Inhale slowly...'
      : phase === 'hold'
      ? 'Hold your breath gently...'
      : 'Exhale tension...';

  return (
    <Modal
      visible={!!activeFrictionApp}
      animationType="fade"
      transparent={false}
      onRequestClose={closeFrictionModal}
    >
      <View style={styles.container}>
        {/* Top Dismiss Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={closeFrictionModal}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Header App Banner */}
        <View style={styles.appBanner}>
          <View style={[styles.appIconBadge, { backgroundColor: activeFrictionApp.color }]}>
            <Ionicons name={activeFrictionApp.icon as any} size={20} color="#FFF" />
          </View>
          <Text style={styles.appBannerText}>
            Attempting to open <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{activeFrictionApp.name}</Text>
          </Text>
        </View>

        {/* Breathing Animation Core */}
        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathingHaloOuter,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.breathingHaloInner,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
          <View style={styles.breathingCenterCircle}>
            <Ionicons name="leaf" size={28} color={Colors.emerald} />
            <Text style={styles.breathingPhaseText}>{phaseInstruction}</Text>
            {secondsRemaining > 0 ? (
              <Text style={styles.countdownSec}>{secondsRemaining}s</Text>
            ) : (
              <Text style={styles.readyText}>Centered</Text>
            )}
          </View>
        </View>

        {/* Mindful Question */}
        <View style={styles.intentionsBox}>
          <Text style={styles.questionTitle}>Is this worth interrupting your focus?</Text>
          <Text style={styles.questionSubtitle}>
            A 5-minute break scrolling reels usually turns into 45 minutes of lost study flow.
          </Text>

          {/* Intention Options */}
          <View style={styles.intentionOptionsList}>
            {defaultIntentions.map((intent, idx) => {
              const isSelected = selectedIntention === intent;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.intentionChip,
                    isSelected && styles.intentionChipSelected,
                  ]}
                  onPress={() => {
                    triggerHaptic.light();
                    setSelectedIntention(intent);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={isSelected ? Colors.emerald : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.intentionChipText,
                      isSelected && styles.intentionChipTextSelected,
                    ]}
                  >
                    {intent}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsFooter}>
          {/* Main Action: Close & Protect Focus */}
          <TouchableOpacity
            style={styles.protectButton}
            onPress={handleReturnToStudy}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            <Text style={styles.protectButtonText}>Protect My Focus (+15 Dopamine)</Text>
          </TouchableOpacity>

          {/* Secondary Action: Proceed with Limit */}
          {canProceed ? (
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.proceedButtonText}>
                I have an urgent task (60s limit)
              </Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.disabledProceed}>
              <Text style={styles.disabledProceedText}>
                Pause for {secondsRemaining} more seconds to reflect
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    zIndex: 10,
  },
  appBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 8,
  },
  appIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBannerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breathingContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  breathingHaloOuter: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: Colors.emeraldGlow,
  },
  breathingHaloInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  breathingCenterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  breathingPhaseText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  countdownSec: {
    color: Colors.emerald,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  readyText: {
    color: Colors.emerald,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  intentionsBox: {
    width: '100%',
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  questionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  intentionOptionsList: {
    width: '100%',
    gap: 8,
  },
  intentionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  intentionChipSelected: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldMuted,
  },
  intentionChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  intentionChipTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  actionsFooter: {
    width: '100%',
    gap: 12,
  },
  protectButton: {
    backgroundColor: Colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  protectButtonText: {
    color: '#090B10',
    fontSize: 15,
    fontWeight: '800',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  proceedButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  disabledProceed: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  disabledProceedText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
