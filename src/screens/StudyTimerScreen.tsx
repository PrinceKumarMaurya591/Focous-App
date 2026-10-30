import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { Header } from '../components/Header';
import { ClockSubTab, TimerMode, StudyAlarm } from '../types';
import { triggerHaptic } from '../services/haptics';

export const StudyTimerScreen: React.FC = () => {
  const {
    clockTab,
    setClockTab,
    timerMode,
    setTimerMode,
    secondsRemaining,
    totalDurationSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    setCustomMinutes,
    adjustTimerMinutes,
    isStrictMode,
    toggleStrictMode,
    activeSubject,
    setActiveSubject,
    studyTasks,
    addStudyTask,
    toggleStudyTask,
    activeSoundscape,
    openSoundscapeModal,
    // Stopwatch
    stopwatchMs,
    isStopwatchRunning,
    stopwatchLaps,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    lapStopwatch,
    // Alarms
    alarms,
    toggleAlarm,
    addAlarm,
    deleteAlarm,
    testAlarm,
    activeRingingAlarm,
    dismissRingingAlarm,
  } = useFocus();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Custom Minutes Modal states
  const [isCustomMinModal, setIsCustomMinModal] = useState(false);
  const [typedMins, setTypedMins] = useState('10');

  // New Alarm modal states
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState('07:00 AM');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');

  // Format MM:SS for Timer
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, ((totalDurationSeconds - secondsRemaining) / totalDurationSeconds) * 100));

  // Format Stopwatch: HH:MM:SS.cs
  const swHours = Math.floor(stopwatchMs / 3600000);
  const swMinutes = Math.floor((stopwatchMs % 3600000) / 60000);
  const swSeconds = Math.floor((stopwatchMs % 60000) / 1000);
  const swCentis = Math.floor((stopwatchMs % 1000) / 10);
  const formatStopwatch = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${c.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${c.toString().padStart(2, '0')}`;
  };

  const handleAddNewTask = () => {
    if (newTaskTitle.trim()) {
      addStudyTask(newTaskTitle.trim(), activeSubject, 25);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleSaveAlarm = () => {
    if (newAlarmTime.trim()) {
      addAlarm(newAlarmLabel.trim() || 'Study Session', newAlarmTime.trim(), ['Daily'], 'Zen Bell');
      setNewAlarmLabel('');
      setIsAddingAlarm(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={clockTab === 'timer' ? 'Study Focus Timer' : clockTab === 'stopwatch' ? 'Study Stopwatch' : 'Study Alarms'}
        subtitle={clockTab === 'timer' ? 'Pomodoro & Deep Work' : clockTab === 'stopwatch' ? 'Track Continuous Study' : 'Wakeup & Schedule Alerts'}
      />

      {/* Clock Feature Sub-Tabs: Timer / Stopwatch / Alarm */}
      <View style={styles.clockSubTabsRow}>
        <TouchableOpacity
          style={[styles.subTabButton, clockTab === 'timer' && styles.subTabButtonActive]}
          onPress={() => {
            triggerHaptic.light();
            setClockTab('timer');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="timer"
            size={16}
            color={clockTab === 'timer' ? Colors.emerald : Colors.textMuted}
          />
          <Text
            style={[styles.subTabButtonText, clockTab === 'timer' && styles.subTabButtonTextActive]}
          >
            Timer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabButton, clockTab === 'stopwatch' && styles.subTabButtonActive]}
          onPress={() => {
            triggerHaptic.light();
            setClockTab('stopwatch');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="stopwatch"
            size={16}
            color={clockTab === 'stopwatch' ? Colors.cyan : Colors.textMuted}
          />
          <Text
            style={[styles.subTabButtonText, clockTab === 'stopwatch' && styles.subTabButtonTextActive]}
          >
            Stopwatch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabButton, clockTab === 'alarm' && styles.subTabButtonActive]}
          onPress={() => {
            triggerHaptic.light();
            setClockTab('alarm');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="alarm"
            size={16}
            color={clockTab === 'alarm' ? Colors.amber : Colors.textMuted}
          />
          <Text
            style={[styles.subTabButtonText, clockTab === 'alarm' && styles.subTabButtonTextActive]}
          >
            Alarms ({alarms.filter((a) => a.isActive).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= VIEW 1: TIMER ================= */}
        {clockTab === 'timer' && (
          <>
            {/* Quick Time Preset Selector */}
            <View style={styles.quickPresetContainer}>
              <View style={styles.quickPresetHeaderRow}>
                <Text style={styles.quickPresetLabel}>Target Focus Time:</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTypedMins(Math.round(totalDurationSeconds / 60).toString());
                    setIsCustomMinModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.customLinkText}>Custom (e.g. 10m, 5m)</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickPresetsScroll}
              >
                {[5, 10, 15, 20, 25, 30, 45, 50, 60, 90].map((m) => {
                  const currentMins = Math.round(totalDurationSeconds / 60);
                  const isSelected = currentMins === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                      onPress={() => {
                        triggerHaptic.light();
                        setCustomMinutes(m);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        {m}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={styles.customExactButton}
                  onPress={() => {
                    triggerHaptic.light();
                    setTypedMins(Math.round(totalDurationSeconds / 60).toString());
                    setIsCustomMinModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="options" size={13} color={Colors.emerald} />
                  <Text style={styles.customExactText}>More...</Text>
                </TouchableOpacity>
              </ScrollView>
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

            {/* Stepper Fine-Tuning Buttons (-5m, -1m, +1m, +5m) */}
            {!isTimerRunning && (
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustTimerMinutes(-5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>-5m</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustTimerMinutes(-1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>-1m</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.currentDurationPill}
                  onPress={() => {
                    setTypedMins(Math.round(totalDurationSeconds / 60).toString());
                    setIsCustomMinModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={13} color={Colors.emerald} />
                  <Text style={styles.currentDurationPillText}>
                    {Math.round(totalDurationSeconds / 60)} min
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustTimerMinutes(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+1m</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustTimerMinutes(5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+5m</Text>
                </TouchableOpacity>
              </View>
            )}

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
          </>
        )}

        {/* ================= VIEW 2: STOPWATCH ================= */}
        {clockTab === 'stopwatch' && (
          <>
            <View style={styles.timerCircleContainer}>
              <View style={[styles.outerGlowRing, { borderColor: Colors.cyanGlow }]}>
                <View style={[styles.innerTimerDisc, { borderColor: Colors.cyan }]}>
                  <Text style={styles.stopwatchDisplay}>{formatStopwatch(stopwatchMs)}</Text>
                  <Text style={[styles.timerStatusLabel, { color: Colors.cyan }]}>
                    {isStopwatchRunning ? 'STUDY CLOCK RUNNING' : 'STOPWATCH PAUSED'}
                  </Text>
                  <Text style={styles.stopwatchSubText}>
                    {swHours > 0 ? `${swHours}h ${swMinutes}m logged` : `${swMinutes} min ${swSeconds} sec`}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stopwatch Buttons */}
            <View style={styles.timerButtonsRow}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetStopwatch}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.playPauseButton,
                  { backgroundColor: isStopwatchRunning ? Colors.surfaceLight : Colors.cyan },
                ]}
                onPress={isStopwatchRunning ? pauseStopwatch : startStopwatch}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isStopwatchRunning ? 'pause' : 'play'}
                  size={26}
                  color={isStopwatchRunning ? Colors.textPrimary : '#090B10'}
                />
                <Text
                  style={[
                    styles.playPauseButtonText,
                    { color: isStopwatchRunning ? Colors.textPrimary : '#090B10' },
                  ]}
                >
                  {isStopwatchRunning ? 'PAUSE' : 'START CLOCK'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetButton, !isStopwatchRunning && { opacity: 0.5 }]}
                onPress={lapStopwatch}
                disabled={!isStopwatchRunning}
                activeOpacity={0.8}
              >
                <Ionicons name="flag" size={20} color={Colors.cyan} />
              </TouchableOpacity>
            </View>

            {/* Laps List */}
            <View style={styles.tasksSection}>
              <View style={styles.tasksHeaderRow}>
                <Text style={styles.tasksTitle}>Study Intervals / Laps ({stopwatchLaps.length})</Text>
                {stopwatchLaps.length > 0 && (
                  <TouchableOpacity onPress={resetStopwatch}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {stopwatchLaps.length === 0 ? (
                <Text style={styles.emptyLapsText}>
                  Tap the flag button while studying to record split intervals (e.g. Chapter 1, Chapter 2).
                </Text>
              ) : (
                <View style={styles.lapsList}>
                  {stopwatchLaps.map((lap) => (
                    <View key={lap.lapNumber} style={styles.lapRow}>
                      <Text style={styles.lapNumText}>Lap #{lap.lapNumber}</Text>
                      <Text style={styles.lapSplitText}>+{formatStopwatch(lap.lapTimeMs)}</Text>
                      <Text style={styles.lapTotalText}>{formatStopwatch(lap.totalTimeMs)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* ================= VIEW 3: STUDY ALARMS ================= */}
        {clockTab === 'alarm' && (
          <>
            <View style={styles.alarmTopBar}>
              <View>
                <Text style={styles.sectionTitleText}>Study Schedules & Alarms</Text>
                <Text style={styles.sectionSubtitleText}>
                  Gentle chimes to wake you up and start focus blocks on time
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addAlarmBtn}
                onPress={() => setIsAddingAlarm(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#090B10" />
                <Text style={styles.addAlarmBtnText}>New Alarm</Text>
              </TouchableOpacity>
            </View>

            {/* Alarms List */}
            <View style={styles.alarmsList}>
              {alarms.map((alarm) => (
                <View key={alarm.id} style={styles.alarmCard}>
                  <View style={styles.alarmCardLeft}>
                    <View style={styles.alarmTimeRow}>
                      <Text style={styles.alarmTimeText}>{alarm.time}</Text>
                      <View style={styles.alarmSoundTag}>
                        <Ionicons name="notifications" size={12} color={Colors.amber} />
                        <Text style={styles.alarmSoundTagText}>{alarm.sound}</Text>
                      </View>
                    </View>
                    <Text style={styles.alarmLabelText}>{alarm.label}</Text>
                    <View style={styles.alarmDaysRow}>
                      {alarm.days.map((d, i) => (
                        <View key={i} style={styles.alarmDayBadge}>
                          <Text style={styles.alarmDayBadgeText}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.alarmCardRight}>
                    {/* Test Sound Button */}
                    <TouchableOpacity
                      style={styles.previewSoundBtn}
                      onPress={() => testAlarm(alarm)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="volume-high" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Toggle Switch */}
                    <TouchableOpacity
                      style={[
                        styles.strictToggle,
                        alarm.isActive ? styles.alarmToggleActive : styles.strictToggleInactive,
                      ]}
                      onPress={() => toggleAlarm(alarm.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.strictKnob,
                          alarm.isActive && styles.strictKnobActive,
                        ]}
                      />
                    </TouchableOpacity>

                    {/* Delete button */}
                    <TouchableOpacity
                      style={styles.deleteAlarmBtn}
                      onPress={() => deleteAlarm(alarm.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* New Alarm Creation Modal */}
      {isAddingAlarm && (
        <Modal
          visible={isAddingAlarm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAddingAlarm(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Set Study Alarm</Text>
                <TouchableOpacity onPress={() => setIsAddingAlarm(false)}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalInputLabel}>Alarm Time (e.g. 06:30 AM)</Text>
              <TextInput
                style={styles.modalInput}
                value={newAlarmTime}
                onChangeText={setNewAlarmTime}
                placeholder="06:30 AM"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.modalInputLabel}>Study Session Purpose</Text>
              <TextInput
                style={styles.modalInput}
                value={newAlarmLabel}
                onChangeText={setNewAlarmLabel}
                placeholder="e.g., Morning Organic Chemistry Revision"
                placeholderTextColor={Colors.textMuted}
              />

              <View style={styles.quickTimePills}>
                {['05:30 AM', '06:30 AM', '02:00 PM', '06:00 PM', '10:00 PM'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.quickTimePill, newAlarmTime === t && styles.quickTimePillActive]}
                    onPress={() => setNewAlarmTime(t)}
                  >
                    <Text style={[styles.quickTimePillText, newAlarmTime === t && styles.quickTimePillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveAlarmButton}
                onPress={handleSaveAlarm}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={18} color="#090B10" />
                <Text style={styles.saveAlarmButtonText}>Set Study Alarm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Ringing Alarm Modal */}
      {activeRingingAlarm && (
        <Modal
          visible={!!activeRingingAlarm}
          transparent={true}
          animationType="slide"
          onRequestClose={dismissRingingAlarm}
        >
          <View style={styles.ringingBackdrop}>
            <View style={styles.ringingCard}>
              <View style={styles.ringingOrb}>
                <Ionicons name="alarm" size={44} color={Colors.amber} />
              </View>
              <Text style={styles.ringingTime}>{activeRingingAlarm.time}</Text>
              <Text style={styles.ringingLabel}>{activeRingingAlarm.label}</Text>
              <Text style={styles.ringingDesc}>
                Time to step away from reels and start your deep study session!
              </Text>

              <TouchableOpacity
                style={styles.dismissAlarmBtn}
                onPress={dismissRingingAlarm}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={20} color="#090B10" />
                <Text style={styles.dismissAlarmBtnText}>Start Studying Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Custom Duration Input Modal */}
      {isCustomMinModal && (
        <Modal
          visible={isCustomMinModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsCustomMinModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Set Custom Study Minutes</Text>
                <TouchableOpacity onPress={() => setIsCustomMinModal(false)}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalInputLabel}>Enter exact minutes (e.g. 5, 10, 12, 35, 75)</Text>
              <TextInput
                style={[styles.modalInput, { fontSize: 28, textAlign: 'center', fontWeight: '800', color: Colors.emerald }]}
                keyboardType="numeric"
                value={typedMins}
                onChangeText={setTypedMins}
                placeholder="10"
                placeholderTextColor={Colors.textMuted}
                maxLength={3}
                autoFocus
              />

              <View style={styles.quickTimePills}>
                {[5, 10, 15, 20, 25, 30, 45, 60, 90].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.quickTimePill, typedMins === num.toString() && styles.quickTimePillActive]}
                    onPress={() => setTypedMins(num.toString())}
                  >
                    <Text style={[styles.quickTimePillText, typedMins === num.toString() && styles.quickTimePillTextActive]}>
                      {num}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveAlarmButton, { backgroundColor: Colors.emerald }]}
                onPress={() => {
                  const parsed = parseInt(typedMins, 10);
                  if (!isNaN(parsed) && parsed > 0) {
                    setCustomMinutes(parsed);
                  }
                  setIsCustomMinModal(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle" size={18} color="#090B10" />
                <Text style={styles.saveAlarmButtonText}>Set Timer ({typedMins} min)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  clockSubTabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    gap: 8,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    backgroundColor: Colors.surfaceLight,
  },
  subTabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorderLight,
  },
  subTabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  subTabButtonTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
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
    marginVertical: 10,
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
  stopwatchDisplay: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  stopwatchSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
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
  alarmToggleActive: {
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
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coral,
  },
  emptyLapsText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    paddingVertical: 10,
  },
  lapsList: {
    gap: 8,
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  lapNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lapSplitText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cyan,
  },
  lapTotalText: {
    fontSize: 12,
    color: Colors.textMuted,
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
  alarmTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitleText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    maxWidth: 240,
  },
  addAlarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amber,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  addAlarmBtnText: {
    color: '#090B10',
    fontSize: 12,
    fontWeight: '700',
  },
  alarmsList: {
    gap: 12,
  },
  alarmCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 18,
    padding: 16,
  },
  alarmCardLeft: {
    flex: 1,
    gap: 4,
  },
  alarmTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alarmTimeText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  alarmSoundTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.amberMuted,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  alarmSoundTagText: {
    fontSize: 10,
    color: Colors.amber,
    fontWeight: '600',
  },
  alarmLabelText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  alarmDaysRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  alarmDayBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alarmDayBadgeText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  alarmCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewSoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAlarmBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 20,
    gap: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickTimePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  quickTimePill: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  quickTimePillActive: {
    backgroundColor: Colors.amberMuted,
    borderColor: Colors.amber,
  },
  quickTimePillText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  quickTimePillTextActive: {
    color: Colors.amber,
    fontWeight: '700',
  },
  saveAlarmButton: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveAlarmButtonText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '800',
  },
  ringingBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 11, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ringingCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  ringingOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.amberMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.amber,
  },
  ringingTime: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ringingLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.amber,
    textAlign: 'center',
  },
  ringingDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  dismissAlarmBtn: {
    backgroundColor: Colors.amber,
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  dismissAlarmBtnText: {
    color: '#090B10',
    fontSize: 15,
    fontWeight: '800',
  },
  quickPresetContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 8,
  },
  quickPresetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickPresetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  customLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
  quickPresetsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  presetChipActive: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetChipTextActive: {
    color: Colors.emerald,
    fontWeight: '800',
  },
  customExactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  customExactText: {
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: -4,
    marginBottom: 4,
  },
  stepperBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  stepperBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  currentDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: Colors.emeraldGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentDurationPillText: {
    color: Colors.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
});
