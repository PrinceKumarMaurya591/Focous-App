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
import { TimerMode } from '../types';
import { triggerHaptic } from '../services/haptics';

export const StudyTimerScreen: React.FC = () => {
  const {
    timerMode,
    setTimerMode,
    secondsRemaining,
    totalDurationSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    isStrictMode,
    toggleStrictMode,
    activeSubject,
    setActiveSubject,
    studyTasks,
    addStudyTask,
    toggleStudyTask,
    activeSoundscape,
    openSoundscapeModal,
  } = useFocus();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Progress percentage
  const progressPercent = Math.max(0, Math.min(100, ((totalDurationSeconds - secondsRemaining) / totalDurationSeconds) * 100));

  const handleAddNewTask = () => {
    if (newTaskTitle.trim()) {
      addStudyTask(newTaskTitle.trim(), activeSubject, 25);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Deep Study Station" subtitle="Distraction-Free Work" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Switcher */}
        <View style={styles.modeTabs}>
          {(['pomodoro', 'deep_study', 'custom'] as TimerMode[]).map((mode) => {
            const isActive = timerMode === mode;
            const label =
              mode === 'pomodoro'
                ? '25m Pomodoro'
                : mode === 'deep_study'
                ? '50m Deep Flow'
                : '60m Custom';
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.modeTab, isActive && styles.modeTabActive]}
                onPress={() => setTimerMode(mode)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    isActive && styles.modeTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Subject Pill */}
        <View style={styles.subjectBox}>
          <Ionicons name="book" size={16} color={Colors.emerald} />
          <TextInput
            style={styles.subjectInput}
            value={activeSubject}
            onChangeText={setActiveSubject}
            placeholder="What are you studying right now?"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Ambient Sound Bar Quick Access */}
        <TouchableOpacity
          style={styles.soundBar}
          onPress={openSoundscapeModal}
          activeOpacity={0.8}
        >
          <View style={styles.soundBarLeft}>
            <Ionicons
              name={activeSoundscape !== 'none' ? 'pulse' : 'volume-mute-outline'}
              size={18}
              color={activeSoundscape !== 'none' ? Colors.emerald : Colors.textMuted}
            />
            <Text style={styles.soundBarText}>
              Soundscape:{' '}
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>
                {activeSoundscape === 'none'
                  ? 'Mute (Tap to play 10Hz Alpha Waves)'
                  : activeSoundscape.replace('_', ' ').toUpperCase()}
              </Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Circular Timer Visual Display */}
        <View style={styles.timerCircleContainer}>
          <View style={styles.outerGlowRing}>
            <View style={styles.innerTimerDisc}>
              <Text style={styles.timerCountdown}>{timeFormatted}</Text>
              <Text style={styles.timerStatusLabel}>
                {isTimerRunning ? 'FOCUS SESSION ACTIVE' : 'READY TO STUDY'}
              </Text>

              {/* Progress Bar inside circle */}
              <View style={styles.circularProgressTrack}>
                <View
                  style={[
                    styles.circularProgressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentText}>{Math.round(progressPercent)}% done</Text>
            </View>
          </View>
        </View>

        {/* Main Controls: Play / Pause / Reset */}
        <View style={styles.timerButtonsRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => resetTimer()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playPauseButton,
              isTimerRunning ? styles.pauseButton : styles.playButton,
            ]}
            onPress={isTimerRunning ? pauseTimer : startTimer}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isTimerRunning ? 'pause' : 'play'}
              size={28}
              color={isTimerRunning ? Colors.textPrimary : '#090B10'}
            />
            <Text
              style={[
                styles.playPauseButtonText,
                { color: isTimerRunning ? Colors.textPrimary : '#090B10' },
              ]}
            >
              {isTimerRunning ? 'PAUSE' : 'START FOCUS'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Strict Mode Protection Toggle */}
        <View style={styles.strictModeCard}>
          <View style={styles.strictModeLeft}>
            <View style={[styles.strictIcon, { backgroundColor: isStrictMode ? Colors.amberMuted : Colors.surfaceLight }]}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={isStrictMode ? Colors.amber : Colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.strictTitle}>Strict Lockdown Mode</Text>
              <Text style={styles.strictDesc}>
                Prevents leaving session early without passing brain quiz
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.strictToggle,
              isStrictMode ? styles.strictToggleActive : styles.strictToggleInactive,
            ]}
            onPress={toggleStrictMode}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.strictKnob,
                isStrictMode && styles.strictKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Study Tasks Checklist */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeaderRow}>
            <Text style={styles.tasksTitle}>Study Checklist</Text>
            <TouchableOpacity
              onPress={() => setIsAddingTask(!isAddingTask)}
              activeOpacity={0.7}
            >
              <Text style={styles.addTaskBtnText}>
                {isAddingTask ? 'Cancel' : '+ Add Task'}
              </Text>
            </TouchableOpacity>
          </View>

          {isAddingTask && (
            <View style={styles.newTaskInputRow}>
              <TextInput
                style={styles.newTaskInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="e.g., Complete 10 physics questions"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveTaskBtn}
                onPress={handleAddNewTask}
                activeOpacity={0.8}
              >
                <Text style={styles.saveTaskBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tasksList}>
            {studyTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, task.completed && styles.taskItemCompleted]}
                onPress={() => toggleStudyTask(task.id)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={task.completed ? Colors.emerald : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.taskText,
                    task.completed && styles.taskTextCompleted,
                  ]}
                >
                  {task.title}
                </Text>
                <View style={styles.taskSubjectBadge}>
                  <Text style={styles.taskSubjectText}>{task.subject}</Text>
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
    gap: 18,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorderLight,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeTabTextActive: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  subjectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  subjectInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  soundBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  soundBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soundBarText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timerCircleContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  outerGlowRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 2,
    borderColor: Colors.emeraldGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerTimerDisc: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    paddingHorizontal: 16,
  },
  timerCountdown: {
    fontSize: 46,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  timerStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emerald,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  circularProgressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 14,
  },
  circularProgressFill: {
    height: '100%',
    backgroundColor: Colors.emerald,
  },
  progressPercentText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  timerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  resetButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    height: 54,
    borderRadius: 27,
    gap: 10,
  },
  playButton: {
    backgroundColor: Colors.emerald,
    shadowColor: Colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  pauseButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorderLight,
  },
  playPauseButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  strictModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 14,
  },
  strictModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  strictIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strictTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  strictDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  strictToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  strictToggleActive: {
    backgroundColor: Colors.amber,
  },
  strictToggleInactive: {
    backgroundColor: Colors.surfaceLight,
  },
  strictKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  strictKnobActive: {
    alignSelf: 'flex-end',
  },
  tasksSection: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
  newTaskInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  newTaskInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  saveTaskBtn: {
    backgroundColor: Colors.emerald,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  saveTaskBtnText: {
    color: '#090B10',
    fontWeight: '700',
    fontSize: 12,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskSubjectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  taskSubjectText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
