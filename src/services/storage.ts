import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyTask } from '../types';
import { DEFAULT_TECH_CHECKLIST } from '../data/codingChecklist';

const STORAGE_KEYS = {
  CHECKLIST: '@focus_app_study_checklist_v2',
  ACTIVE_SUBJECT: '@focus_app_active_subject_v1',
};

/**
 * Load persisted checklist items from AsyncStorage.
 * If first time running or empty, returns default tech interview checklist.
 */
export async function loadStudyChecklist(): Promise<StudyTask[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST);
    if (!raw) {
      // First time initialization: save defaults and return
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(DEFAULT_TECH_CHECKLIST));
      return DEFAULT_TECH_CHECKLIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TECH_CHECKLIST;
  } catch (error) {
    console.error('Error loading study checklist from local storage:', error);
    return DEFAULT_TECH_CHECKLIST;
  }
}

/**
 * Save updated checklist items to AsyncStorage.
 */
export async function saveStudyChecklist(tasks: StudyTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving study checklist to local storage:', error);
  }
}

/**
 * Reset checklist back to default curated list.
 */
export async function resetStudyChecklistToDefaults(): Promise<StudyTask[]> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(DEFAULT_TECH_CHECKLIST));
    return DEFAULT_TECH_CHECKLIST;
  } catch (error) {
    console.error('Error resetting study checklist:', error);
    return DEFAULT_TECH_CHECKLIST;
  }
}

/**
 * Load last active study subject.
 */
export async function loadActiveSubject(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT);
  } catch (error) {
    console.error('Error loading active subject:', error);
    return null;
  }
}

/**
 * Save current active study subject.
 */
export async function saveActiveSubject(subject: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SUBJECT, subject);
  } catch (error) {
    console.error('Error saving active subject:', error);
  }
}
