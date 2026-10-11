/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NewChecklistForm } from './components/NewChecklistForm';
import { ActiveChecklistView } from './components/ActiveChecklistView';
import { HistoryView } from './components/HistoryView';
import { ReportModal } from './components/ReportModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ChecklistSession } from './types';
import {
  loadAllSessionsFromStorage,
  saveAllSessionsToStorage,
  resetStorageToDemoData,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('new');
  const [allSessions, setAllSessions] = useState<ChecklistSession[]>([]);
  const [activeDraft, setActiveDraft] = useState<ChecklistSession | null>(null);
  const [selectedReportSession, setSelectedReportSession] = useState<ChecklistSession | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize data on mount from localStorage (key "scene_checklist_data_v1")
  useEffect(() => {
    const loaded = loadAllSessionsFromStorage();
    setAllSessions(loaded);

    // Look for any existing in-progress active checklist
    const active = loaded.find((s) => !s.isCompleted);
    if (active) {
      setActiveDraft(active);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to persist updated list of all sessions to localStorage
  const persistSessions = (updated: ChecklistSession[]) => {
    setAllSessions(updated);
    saveAllSessionsToStorage(updated);
  };

  // When a new checklist is generated from Home screen
  const handleChecklistGenerated = (newSession: ChecklistSession) => {
    // Remove any previous incomplete draft and add new active session
    const filtered = allSessions.filter((s) => s.isCompleted);
    const updated = [newSession, ...filtered];

    persistSessions(updated);
    setActiveDraft(newSession);
    setActiveTab('active');
  };

  // When active checklist is updated (checking off items, adding notes, etc.)
  const handleUpdateActiveSession = (updatedSession: ChecklistSession) => {
    setActiveDraft(updatedSession);

    // Update in allSessions and save immediately to localStorage (key: "scene_checklist_data_v1")
    const existingIndex = allSessions.findIndex((s) => s.id === updatedSession.id);
    let updatedList: ChecklistSession[];
    if (existingIndex >= 0) {
      updatedList = [...allSessions];
      updatedList[existingIndex] = updatedSession;
    } else {
      updatedList = [updatedSession, ...allSessions];
    }

    persistSessions(updatedList);
  };

  // When "סיים ושמור" is clicked in Active Checklist: save to history and lock
  const handleFinishAndSave = (completedSession: ChecklistSession) => {
    const lockedSession: ChecklistSession = {
      ...completedSession,
      isCompleted: true,
      completedAt: completedSession.completedAt || new Date().toISOString(),
    };

    // Update in list
    const existingIndex = allSessions.findIndex((s) => s.id === lockedSession.id);
    let updatedList: ChecklistSession[];

    if (existingIndex >= 0) {
      updatedList = [...allSessions];
      updatedList[existingIndex] = lockedSession;
    } else {
      updatedList = [lockedSession, ...allSessions.filter((s) => s.id !== lockedSession.id)];
    }

    persistSessions(updatedList);
    setActiveDraft(null);

    // Switch to history screen and open summary modal for reporting
    setSelectedReportSession(lockedSession);
    setActiveTab('history');
    showToast(`זירה ${lockedSession.id} נשמרה וננעלה בהצלחה בהיסטוריה!`, 'success');
  };

  const handleDiscardDraft = () => {
    if (activeDraft) {
      const updated = allSessions.filter((s) => s.id !== activeDraft.id);
      persistSessions(updated);
    }
    setActiveDraft(null);
    setActiveTab('new');
    showToast('הזירה בוטלה', 'info');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = allSessions.filter((s) => s.id !== sessionId);
    persistSessions(updated);
    if (activeDraft && activeDraft.id === sessionId) {
      setActiveDraft(null);
    }
    showToast(`הזירה ${sessionId} נמחקה`, 'info');
  };

  const handleResetDemoData = () => {
    const restored = resetStorageToDemoData();
    setAllSessions(restored);
    setActiveDraft(null);
    setActiveTab('history');
    showToast('נתוני הדמה אופסו בהצלחה ל-2 זירות הדוגמה הראשוניות', 'info');
  };

  // Completed sessions for History display
  const completedSessions = allSessions.filter((s) => s.isCompleted);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDraft={activeDraft}
        historyCount={completedSessions.length}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {/* Tab 1: Home / New Checklist */}
        {activeTab === 'new' && (
          <NewChecklistForm
            onChecklistGenerated={handleChecklistGenerated}
            activeDraft={activeDraft}
            onResumeActiveDraft={() => setActiveTab('active')}
            existingSessions={allSessions}
            showToast={showToast}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {/* Tab 2: Active Checklist */}
        {activeTab === 'active' && (
          <>
            {activeDraft ? (
              <ActiveChecklistView
                session={activeDraft}
                onUpdateSession={handleUpdateActiveSession}
                onFinishAndSave={handleFinishAndSave}
                onDiscardDraft={handleDiscardDraft}
                showToast={showToast}
              />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 text-center bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-700/60 flex items-center justify-center mx-auto text-amber-400">
                  📋
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  אין צ'קליסט פעיל כרגע
                </h3>
                <p className="text-xs text-slate-400">
                  בחר סוג זירה במסך הבית או הזן תיאור חופשי ליצירת צ'קליסט חדש.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('new')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    עבור למסך הבית ליצירה
                  </button>
                  <button
                    onClick={() => {
                      const sampleSession: ChecklistSession = {
                        id: `DEMO-CHK-000${allSessions.length + 1}`,
                        sceneType: 'התפרצות לרכב (זירת הדגמה)',
                        location: 'רחוב הרצל 45, תל אביב',
                        examinerName: 'חוקר שטח מז"פ',
                        createdAt: new Date().toISOString(),
                        isCompleted: false,
                        items: [
                          {
                            id: 's-1',
                            text: 'תיחום ובידוד הזירה בסרט אדום-לבן וקביעת ציר גישה סטרילי',
                            category: 'בידוד ואבטחה',
                            priority: 'high',
                            completed: true,
                            completedAt: new Date().toISOString(),
                          },
                          {
                            id: 's-2',
                            text: 'צילום היקפי של הרכב (לוחית רישוי, זווית חניה ושמשה שבורה) עם סרגל מידה',
                            category: 'צילום ותיעוד',
                            priority: 'high',
                            completed: true,
                            completedAt: new Date().toISOString(),
                          },
                          {
                            id: 's-3',
                            text: 'איבוק לטביעות אצבע לטנטיות על ידית הדלת החיצונית והמראה המרכזית',
                            category: 'טביעות אצבע ודנ"א',
                            priority: 'normal',
                            completed: false,
                          },
                          {
                            id: 's-4',
                            text: 'דגימת דנ"א מגע (Touch DNA) מסוואב סטרילי מגלגל ההגה וידית ההילוכים',
                            category: 'טביעות אצבע ודנ"א',
                            priority: 'high',
                            completed: false,
                          },
                          {
                            id: 's-5',
                            text: 'סריקת רצפת הרכב ותא הכפפות לאיתור חפצים שהושארו ע"י הפורץ',
                            category: 'איסוף ראיות',
                            priority: 'normal',
                            completed: false,
                          },
                          {
                            id: 's-6',
                            text: 'אריזה, איטום ורישום מוצגים בטופס שרשרת מוצג',
                            category: 'איסוף ראיות',
                            priority: 'high',
                            completed: false,
                          },
                        ],
                      };
                      handleChecklistGenerated(sampleSession);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl border border-slate-600 transition-colors"
                  >
                    טען זירת הדגמה מיידית
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <HistoryView
            sessions={completedSessions}
            onOpenReport={(session) => setSelectedReportSession(session)}
            onDeleteSession={handleDeleteSession}
            onResetDemoData={handleResetDemoData}
            onResumeSession={(session) => {
              if (activeDraft && activeDraft.id !== session.id) {
                const confirmed = window.confirm("יש לך צ'קליסט פעיל פתוח. האם ברצונך להחליף אותו בצ'קליסט חדש?");
                if (!confirmed) return;
              }
              setActiveDraft(session);
              setActiveTab('active');
            }}
          />
        )}
      </main>

      {/* Summary / Report Modal */}
      {selectedReportSession && (
        <ReportModal
          session={selectedReportSession}
          onClose={() => setSelectedReportSession(null)}
          showToast={showToast}
        />
      )}

      {/* Subtle Demo Footer */}
      <footer className="py-3 px-4 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950/60 select-none">
        אב-טיפוס להדגמה – האקתון מז"פ 2026 – נתוני דמה בלבד
      </footer>
    </div>
  );
}
