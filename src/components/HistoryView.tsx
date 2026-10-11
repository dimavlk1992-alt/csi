import React, { useState } from 'react';
import {
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Eye,
  Trash2,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
  FileCheck,
  X,
  History,
} from 'lucide-react';
import { ChecklistSession } from '../types';
import { formatHebrewDateTime, isClaudeGenerated } from '../utils/storage';

interface HistoryViewProps {
  sessions: ChecklistSession[];
  onOpenReport: (session: ChecklistSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onResetDemoData: () => void;
  onResumeSession?: (session: ChecklistSession) => void;
  onGoHome?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onOpenReport,
  onDeleteSession,
  onResetDemoData,
  onResumeSession,
  onGoHome,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.isCompleted).length;
  const totalCompletedTasks = sessions.reduce(
    (acc, s) => acc + s.items.filter((i) => i.completed).length,
    0
  );

  const filteredSessions = sessions.filter((session) => {
    // Status filter
    if (filterType === 'completed' && !session.isCompleted) return false;
    if (filterType === 'in_progress' && session.isCompleted) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchType = session.sceneType.toLowerCase().includes(q);
    const matchId = session.id.toLowerCase().includes(q);
    const matchLocation = session.location?.toLowerCase().includes(q);
    const matchExaminer = session.examinerName?.toLowerCase().includes(q);
    const matchNotes = session.generalNotes?.toLowerCase().includes(q);
    return matchType || matchId || matchLocation || matchExaminer || matchNotes;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Quick Reset Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>היסטוריית זירות ודוחות</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            מאגר דוחות חקירה פורנזיים שנשמרו מקומית במכשיר
          </p>
        </div>

        {/* Easily accessible Reset Button at top */}
        <div className="self-end sm:self-center">
          {confirmReset ? (
            <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/50 p-1.5 rounded-xl text-xs">
              <span className="text-rose-200">לאפס נתוני דמה?</span>
              <button
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg transition"
              >
                אישור
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-slate-200 hover:text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="שחזור 2 זירות הדוגמה המקוריות"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>איפוס נתוני דמה</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">סה"כ זירות שנשמרו</span>
            <div className="text-xl font-black text-slate-100">{totalSessions}</div>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">זירות שהושלמו</span>
            <div className="text-xl font-black text-slate-100">{completedSessions}</div>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">משימות וראיות שתועדו</span>
            <div className="text-xl font-black text-slate-100">{totalCompletedTasks}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי סוג זירה, מזהה, כתובת או שם חוקר..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                title="נקה חיפוש"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              הכל ({totalSessions})
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'completed'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              הושלמו ({completedSessions})
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const completedCount = session.items.filter((i) => i.completed).length;
          const totalCount = session.items.length;
          const percent = Math.round((completedCount / (totalCount || 1)) * 100);

          return (
            <div
              key={session.id}
              onClick={() => onOpenReport(session)}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-sm transition-all text-right group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 font-bold">
                      {session.id}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        session.isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {session.isCompleted ? 'הושלם במלואו' : 'פתוח בטיפול'}
                    </span>

                    {session.isAiGenerated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        {isClaudeGenerated(session) ? 'Claude' : 'מותאם'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {session.sceneType}
                  </h3>

                  {session.sceneDescription && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {session.sceneDescription}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatHebrewDateTime(session.createdAt)}</span>
                    </div>

                    {session.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{session.location}</span>
                      </div>
                    )}

                    {session.examinerName && (
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{session.examinerName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicator & Actions */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                  <div className="text-right sm:text-left">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {completedCount}/{totalCount} משימות ({percent}%)
                    </span>
                    <div className="w-28 bg-slate-900 h-2 rounded-full overflow-hidden mt-1 border border-slate-700">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReport(session);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow"
                      title="הצג פרטי סיכום של הזירה"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>הצג פרטי סיכום</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`האם למחוק את תיעוד הזירה ${session.id}?`)) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
                      title="מחק זירה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Friendly Empty State when search returns no matches */}
        {filteredSessions.length === 0 && sessions.length > 0 && (
          <div className="p-8 text-center bg-slate-800/40 border border-slate-700/80 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                לא נמצאו זירות התואמות לחיפוש
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                לא אותרו תוצאות התואמות למילים שהוזנו. נסה לחפש לפי מילת מפתח אחרת (למשל: רכב, דירה, חיפה) או אפס את החיפוש.
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                נקה חיפוש
              </button>
            )}
          </div>
        )}

        {/* Friendly Empty State when history is completely empty */}
        {sessions.length === 0 && (
          <div className="p-10 text-center bg-slate-800/40 border border-slate-700/80 rounded-2xl space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">
                עדיין לא נשמרו דוחות זירה בהיסטוריה
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                לאחר שתבדוק זירה במסך הצ'קליסט הפעיל ותלחץ על "סיים ושמור", הדוח יינעל ויישמר כאן באופן קבוע לעיון והעתקה ליומן החקירות.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={onResetDemoData}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
              >
                טען מחדש 2 זירות דמה לדוגמה
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Demo Data Footer Area */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>הנתונים נשמרים מקומית במכשיר שלך (localStorage: scene_checklist_data_v1)</span>
        </div>

        <button
          onClick={() => setConfirmReset(true)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>איפוס נתוני דמה</span>
        </button>
      </div>
    </div>
  );
};
