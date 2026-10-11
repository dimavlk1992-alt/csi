import { ChecklistSession } from '../types';
import { SEED_SESSIONS } from '../data/presets';

export const STORAGE_KEY = 'scene_checklist_data_v1';

/**
 * Loads all sessions from localStorage under key "scene_checklist_data_v1".
 * On first load, if localStorage is empty, seeds it with 2 sample completed sessions.
 */
export function loadAllSessionsFromStorage(): ChecklistSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First load: seed with 2 sample completed sessions
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
      return [...SEED_SESSIONS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array or invalid, seed with initial 2 sample sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
    return [...SEED_SESSIONS];
  } catch (err) {
    console.error('Failed to load from localStorage, falling back to seed sessions:', err);
    return [...SEED_SESSIONS];
  }
}

/**
 * Saves all sessions (both active draft with isCompleted:false and completed sessions)
 * directly into localStorage under key "scene_checklist_data_v1".
 */
export function saveAllSessionsToStorage(sessions: ChecklistSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Restores initial sample data (2 sample completed sessions) into localStorage.
 */
export function resetStorageToDemoData(): ChecklistSession[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
    return [...SEED_SESSIONS];
  } catch (err) {
    console.error('Failed to reset demo data:', err);
    return [...SEED_SESSIONS];
  }
}

export function formatHebrewDateTime(isoString?: string): string {
  if (!isoString) return 'לא צוין';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatReportText(session: ChecklistSession): string {
  const completedItems = session.items.filter((i) => i.completed);
  const pendingItems = session.items.filter((i) => !i.completed);
  const completionPercentage = Math.round((completedItems.length / (session.items.length || 1)) * 100);

  let report = `=====================================================
דוח פעולות זירת עבירה - תיעוד פעולות חוקר מז"פ
=====================================================
מזהה דוח: ${session.id}
סוג זירה: ${session.sceneType}
מועד פתיחה: ${formatHebrewDateTime(session.createdAt)}
מועד סיום: ${session.completedAt ? formatHebrewDateTime(session.completedAt) : 'טרם נסגר'}
סטטוס ביצוע: ${session.isCompleted ? 'הושלם במלואו' : 'בתהליך'} (${completionPercentage}%)
`;

  if (session.location) {
    report += `מיקום הזירה: ${session.location}\n`;
  }
  if (session.examinerName) {
    report += `חוקר מז"פ מבצע: ${session.examinerName}\n`;
  }
  if (session.sceneDescription) {
    report += `תיאור ראשוני של הזירה:\n${session.sceneDescription}\n`;
  }

  report += `\n-----------------------------------------------------
פעולות ומשימות שבוצעו (${completedItems.length}/${session.items.length}):
-----------------------------------------------------\n`;

  if (completedItems.length === 0) {
    report += `[לא תועדו פעולות שהושלמו]\n`;
  } else {
    completedItems.forEach((item, index) => {
      report += `${index + 1}. [V] [${item.category}] ${item.text}\n`;
      if (item.completedAt) {
        report += `    שעת ביצוע: ${formatHebrewDateTime(item.completedAt)}\n`;
      }
      if (item.labName) {
        report += `    מעבדת מז"פ יעד: ${item.labName}\n`;
      }
      if (item.labAdvice) {
        report += `    הנחיית ניתוב ובדיקות: ${item.labAdvice}\n`;
      }
      if (item.packagingAdvice) {
        report += `    הנחיית אריזה ושימור: ${item.packagingAdvice}\n`;
      }
      if (item.note) {
        report += `    הערת חוקר / פירוט מוצג: ${item.note}\n`;
      }
    });
  }

  if (pendingItems.length > 0) {
    report += `\n-----------------------------------------------------
פעולות שלא בוצעו / טרם הושלמו (${pendingItems.length}):
-----------------------------------------------------\n`;
    pendingItems.forEach((item, index) => {
      report += `${index + 1}. [ ] [${item.category}] ${item.text}\n`;
      if (item.note) {
        report += `    הערה: ${item.note}\n`;
      }
    });
  }

  if (session.generalNotes && session.generalNotes.trim()) {
    report += `\n-----------------------------------------------------
רשמי חוקר, שרשרת מוצגים והערות מסכמות:
-----------------------------------------------------
${session.generalNotes.trim()}\n`;
  }

  report += `=====================================================
סוף דוח - הופק באמצעות "צ'קליסט זירת עבירה"
=====================================================`;

  return report;
}
