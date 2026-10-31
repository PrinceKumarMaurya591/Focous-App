import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { StudyTask, TechCategory, PriorityLevel } from '../types';
import { triggerHaptic } from '../services/haptics';

interface CategoryConfig {
  key: TechCategory | 'all';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'all', label: 'All Topics', icon: 'grid', color: Colors.emerald },
  { key: 'dsa', label: 'DSA & LeetCode', icon: 'code-slash', color: Colors.cyan },
  { key: 'java', label: 'Java & JVM', icon: 'cafe', color: Colors.amber },
  { key: 'system_design', label: 'System Design', icon: 'git-network', color: Colors.violet },
  { key: 'kafka', label: 'Apache Kafka', icon: 'flash', color: Colors.coral },
  { key: 'spring_boot', label: 'Spring Boot', icon: 'leaf', color: '#10B981' },
  { key: 'databases', label: 'Databases & SQL', icon: 'server', color: '#3B82F6' },
  { key: 'cs_fundamentals', label: 'CS Fundamentals', icon: 'hardware-chip', color: '#6366F1' },
];

export const TechChecklistView: React.FC = () => {
  const {
    studyTasks,
    toggleStudyTask,
    addStudyTask,
    deleteStudyTask,
    resetStudyTasksToDefault,
    focusOnTopic,
  } = useFocus();

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TechCategory>('dsa');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('must_know');
  const [newDuration, setNewDuration] = useState('30');
  const [newNotes, setNewNotes] = useState('');

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return studyTasks.filter((task) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (task.category !== selectedCategory && task.subject.toLowerCase() !== selectedCategory) {
          return false;
        }
      }
      // Status filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchSubject = task.subject.toLowerCase().includes(query);
        const matchNotes = task.notes ? task.notes.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchSubject && !matchNotes) return false;
      }
      return true;
    });
  }, [studyTasks, selectedCategory, statusFilter, searchQuery]);

  // Statistics
  const totalCount = studyTasks.length;
  const completedCount = studyTasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Motivation tagline based on progress
  const getMotivation = (percent: number) => {
    if (percent >= 80) return '🏆 Senior SDE Ready — Crack Any Round!';
    if (percent >= 50) return '⚡ High Velocity — Halfway to Job Offers!';
    if (percent >= 25) return '🔥 Solid Momentum — Keep Cracking Topics Daily!';
    return '🚀 Foundations Phase — Start with Core DSA & Java!';
  };

  const handleCreateTopic = () => {
    if (!newTitle.trim()) {
      alert('Please enter a topic title');
      return;
    }
    const categoryConfig = CATEGORIES.find((c) => c.key === newCategory);
    const subjectName = categoryConfig?.label || 'Coding';
    const durationMins = parseInt(newDuration, 10) || 30;

    addStudyTask(
      newTitle.trim(),
      subjectName,
      durationMins,
      newCategory,
      newPriority,
      newNotes.trim()
    );

    setNewTitle('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleConfirmReset = () => {
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        'Reset Study Checklist?\nThis will restore all default curated SDE interview topics for DSA, Java, Kafka, System Design & Databases.'
      );
      if (ok) {
        resetStudyTasksToDefault();
      }
    } else {
      Alert.alert(
        'Reset Checklist',
        'Restore all default curated SDE interview topics for DSA, Java, Kafka, System Design & Databases?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset to Default',
            style: 'destructive',
            onPress: () => resetStudyTasksToDefault(),
          },
        ]
      );
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'dsa':
        return Colors.cyan;
      case 'java':
        return Colors.amber;
      case 'system_design':
        return Colors.violet;
      case 'kafka':
        return Colors.coral;
      case 'spring_boot':
        return '#10B981';
      case 'databases':
        return '#3B82F6';
      case 'cs_fundamentals':
        return '#6366F1';
      default:
        return Colors.emerald;
    }
  };

  const getPriorityBadge = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'must_know':
        return { label: 'MUST KNOW', bg: Colors.coralMuted, text: Colors.coral };
      case 'high':
        return { label: 'HIGH PRIORITY', bg: Colors.amberMuted, text: Colors.amber };
      default:
        return { label: 'CORE', bg: Colors.emeraldMuted, text: Colors.emerald };
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER STATS BANNER ================= */}
      <View style={styles.statsCard}>
        <View style={styles.statsTopRow}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeLabel}>JOB SEARCH PREPARATION</Text>
            </View>
            <Text style={styles.statsTitle}>
              {completedCount} of {totalCount} Topics Mastered
            </Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.statsBottomRow}>
          <Text style={styles.motivationText}>{getMotivation(progressPercent)}</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleConfirmReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={13} color={Colors.textMuted} />
            <Text style={styles.resetBtnText}>Defaults</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= SEARCH & ADD ROW ================= */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search DSA, Kafka, Java, System Design..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addTopicBtn}
          onPress={() => {
            triggerHaptic.light();
            setIsAddModalOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#090B10" />
          <Text style={styles.addTopicBtnText}>Topic</Text>
        </TouchableOpacity>
      </View>

      {/* ================= CATEGORY PILLS SCROLLER ================= */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count =
              cat.key === 'all'
                ? studyTasks.length
                : studyTasks.filter(
                    (t) => t.category === cat.key || t.subject.toLowerCase() === cat.key
                  ).length;

            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  isSelected && {
                    backgroundColor: cat.color + '22',
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.light();
                  setSelectedCategory(cat.key);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? cat.color : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && { color: cat.color, fontWeight: '700' },
                  ]}
                >
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= STATUS FILTER TABS ================= */}
      <View style={styles.statusTabsRow}>
        {(['all', 'pending', 'completed'] as const).map((status) => {
          const isActive = statusFilter === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.statusTab, isActive && styles.statusTabActive]}
              onPress={() => {
                triggerHaptic.light();
                setStatusFilter(status);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.statusTabText,
                  isActive && styles.statusTabTextActive,
                ]}
              >
                {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : 'Completed'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= CHECKLIST ITEMS LIST ================= */}
      <View style={styles.tasksContainer}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No topics found</Text>
            <Text style={styles.emptyStateDesc}>
              {searchQuery
                ? `No checklist items matched "${searchQuery}"`
                : 'All caught up! Add a new custom topic above.'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const catColor = getCategoryColor(task.category);
            const prio = getPriorityBadge(task.priority);

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.completed && styles.taskCardCompleted,
                ]}
              >
                {/* Top Row: Checkbox + Title + Delete */}
                <View style={styles.taskCardHeader}>
                  <TouchableOpacity
                    style={styles.checkboxTouchable}
                    onPress={() => toggleStudyTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={task.completed ? Colors.emerald : Colors.textMuted}
                    />
                  </TouchableOpacity>

                  <View style={styles.taskTitleCol}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskTitleCompleted,
                      ]}
                      numberOfLines={3}
                    >
                      {task.title}
                    </Text>

                    {/* Meta Badges Row */}
                    <View style={styles.taskMetaRow}>
                      <View
                        style={[
                          styles.categoryTag,
                          { backgroundColor: catColor + '18', borderColor: catColor + '44' },
                        ]}
                      >
                        <Text style={[styles.categoryTagText, { color: catColor }]}>
                          {task.subject || 'Prep'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.priorityTag,
                          { backgroundColor: prio.bg },
                        ]}
                      >
                        <Text style={[styles.priorityTagText, { color: prio.text }]}>
                          {prio.label}
                        </Text>
                      </View>

                      <View style={styles.durationTag}>
                        <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
                        <Text style={styles.durationTagText}>
                          {task.durationMinutes || 30}m
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteStudyTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Optional Interview Key Note */}
                {task.notes ? (
                  <View style={styles.notesContainer}>
                    <Ionicons name="bulb-outline" size={13} color={Colors.amber} />
                    <Text style={styles.notesText}>{task.notes}</Text>
                  </View>
                ) : null}

                {/* Bottom Action: Focus Timer Button */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.focusTimerBtn}
                    onPress={() => focusOnTopic(task)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="timer-outline" size={14} color={Colors.emerald} />
                    <Text style={styles.focusTimerBtnText}>
                      Focus on this ({task.durationMinutes || 25}m Pomodoro) ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ================= MODAL: ADD CUSTOM TOPIC ================= */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="create-outline" size={20} color={Colors.emerald} />
                <Text style={styles.modalTitle}>Add Study Checklist Topic</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Topic Title */}
              <Text style={styles.inputLabel}>Topic Title / Problem *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Kafka Consumer Rebalancing, Red-Black Trees..."
                placeholderTextColor={Colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Category Selector */}
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalChipsScroll}
              >
                {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => {
                  const isSelected = newCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.modalChip,
                        isSelected && {
                          backgroundColor: cat.color + '22',
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => setNewCategory(cat.key as TechCategory)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={13}
                        color={isSelected ? cat.color : Colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.modalChipText,
                          isSelected && { color: cat.color, fontWeight: '700' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Priority Selector */}
              <Text style={styles.inputLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {[
                  { key: 'must_know', label: 'Must Know', color: Colors.coral },
                  { key: 'high', label: 'High Priority', color: Colors.amber },
                  { key: 'medium', label: 'Core', color: Colors.emerald },
                ].map((p) => {
                  const isSelected = newPriority === p.key;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      style={[
                        styles.priorityPill,
                        isSelected && {
                          backgroundColor: p.color + '22',
                          borderColor: p.color,
                        },
                      ]}
                      onPress={() => setNewPriority(p.key as PriorityLevel)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          isSelected && { color: p.color, fontWeight: '700' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Duration Minutes */}
              <Text style={styles.inputLabel}>Estimated Study Time (Minutes)</Text>
              <View style={styles.durationPresetsRow}>
                {['15', '25', '35', '45', '60'].map((mins) => {
                  const isSelected = newDuration === mins;
                  return (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.durationChip,
                        isSelected && styles.durationChipActive,
                      ]}
                      onPress={() => setNewDuration(mins)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.durationChipText,
                          isSelected && styles.durationChipTextActive,
                        ]}
                      >
                        {mins}m
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Key Concept / Notes */}
              <Text style={styles.inputLabel}>Key Notes / Interview Pointer (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Key formulas, algorithmic time complexity, or concepts to remember..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={newNotes}
                onChangeText={setNewNotes}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.saveModalBtn}
              onPress={handleCreateTopic}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={18} color="#090B10" />
              <Text style={styles.saveModalBtnText}>Save to Phone Storage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  // Stats Card
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  percentBadge: {
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.emerald,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.emerald,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.emerald,
    borderRadius: 4,
  },
  statsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  motivationText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  resetBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Search & Add
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
  },
  addTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emerald,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  addTopicBtnText: {
    color: '#090B10',
    fontSize: 13,
    fontWeight: '700',
  },

  // Categories Scroller
  categoryScrollWrapper: {
    marginBottom: 10,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Status Filter Tabs
  statusTabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  statusTabActive: {
    backgroundColor: Colors.surfaceLight,
  },
  statusTabText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  statusTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Task Cards
  tasksContainer: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  taskCardCompleted: {
    opacity: 0.65,
    backgroundColor: '#0F131D',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxTouchable: {
    paddingRight: 10,
    paddingTop: 1,
  },
  taskTitleCol: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  categoryTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priorityTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
  },
  durationTagText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.amber,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    color: '#FCD34D',
    lineHeight: 16,
  },
  cardFooter: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 8,
  },
  focusTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusTimerBtnText: {
    fontSize: 12,
    color: Colors.emerald,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.modalBackdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorderLight,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  textAreaInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalChipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 5,
  },
  modalChipText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceLight,
  },
  priorityPillText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  durationPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceLight,
  },
  durationChipActive: {
    borderColor: Colors.emerald,
    backgroundColor: Colors.emeraldMuted,
  },
  durationChipText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  durationChipTextActive: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  saveModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emerald,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 18,
    gap: 8,
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#090B10',
  },
});
