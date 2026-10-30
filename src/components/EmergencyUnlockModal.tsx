import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { triggerHaptic } from '../services/haptics';

export const EmergencyUnlockModal: React.FC = () => {
  const {
    isUnlockModalOpen,
    closeUnlockModal,
    confirmEmergencyUnlock,
  } = useFocus();

  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Math challenges
  const q1 = { text: '24 + 19 = ?', expected: '43' };
  const q2 = { text: '8 × 7 = ?', expected: '56' };

  if (!isUnlockModalOpen) return null;

  const handleVerifyAndUnlock = () => {
    if (answer1.trim() === q1.expected && answer2.trim() === q2.expected) {
      triggerHaptic.warning();
      setErrorMsg('');
      confirmEmergencyUnlock();
    } else {
      triggerHaptic.warning();
      setErrorMsg('Incorrect answers. Take a breath and finish your focus session.');
    }
  };

  return (
    <Modal
      visible={isUnlockModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={closeUnlockModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <Ionicons name="lock-closed" size={32} color={Colors.amber} />
          </View>

          <Text style={styles.title}>Strict Study Lock Active</Text>
          <Text style={styles.subtitle}>
            To break your deep study session early, solve these 2 problems to engage your rational prefrontal cortex:
          </Text>

          <View style={styles.mathContainer}>
            <View style={styles.mathRow}>
              <Text style={styles.questionText}>{q1.text}</Text>
              <TextInput
                style={styles.mathInput}
                keyboardType="numeric"
                value={answer1}
                onChangeText={setAnswer1}
                placeholder="Answer"
                placeholderTextColor={Colors.textMuted}
                maxLength={4}
              />
            </View>

            <View style={styles.mathRow}>
              <Text style={styles.questionText}>{q2.text}</Text>
              <TextInput
                style={styles.mathInput}
                keyboardType="numeric"
                value={answer2}
                onChangeText={setAnswer2}
                placeholder="Answer"
                placeholderTextColor={Colors.textMuted}
                maxLength={4}
              />
            </View>
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.resumeStudyBtn}
              onPress={closeUnlockModal}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#090B10" />
              <Text style={styles.resumeStudyBtnText}>Never mind, Keep Studying</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forceUnlockBtn}
              onPress={handleVerifyAndUnlock}
              activeOpacity={0.8}
            >
              <Text style={styles.forceUnlockBtnText}>Verify & End Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.amberMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  mathContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 4,
  },
  mathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mathInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 10,
    width: 80,
    height: 38,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.coral,
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  resumeStudyBtn: {
    backgroundColor: Colors.emerald,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resumeStudyBtnText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '800',
  },
  forceUnlockBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forceUnlockBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
