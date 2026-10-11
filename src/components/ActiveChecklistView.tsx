import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lightbulb,
  Plus,
  Save,
  Clock,
  MapPin,
  User,
  Trash2,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Edit3,
  FlaskConical,
  Package,
} from 'lucide-react';
import { ChecklistItem, ChecklistSession } from '../types';
import { formatHebrewDateTime } from '../utils/storage';

interface ActiveChecklistViewProps {
  session: ChecklistSession;
  onUpdateSession: (updated: ChecklistSession) => void;
  onFinishAndSave: (completedSession: ChecklistSession) => void;
  onDiscardDraft: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActiveChecklistView: React.FC<ActiveChecklistViewProps> = ({
  session,
  onUpdateSession,
  onFinishAndSave,
  onDiscardDraft,
  showToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newCustomText, setNewCustomText] = useState<string>('');
  const [newCustomCategory, setNewCustomCategory] = useState<string>('איסוף ראיות');
  const [newCustomPriority, setNewCustomPriority] = useState<'high' | 'normal'>('normal');
  const [openTips, setOpenTips] = useState<Record<string, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({});

  const completedCount = session.items.filter((i) => i.completed).length;
  const totalCount = session.items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Extract unique categories for filter tabs
  const categories = ['הכל', ...Array.from(new Set(session.items.map((i) => i.category)))];

  const handleToggleItem = (itemId: string) => {
    const nowIso = new Date().toISOString();
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? nowIso : undefined,
        };
      }
      return item;
    });

    const updatedSession: ChecklistSession = {
      ...session,
      items: updatedItems,
    };

    onUpdateSession(updatedSession);
  };

  const handleUpdateItemNote = (itemId: string, noteText: string) => {
    const updatedItems = session.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, note: noteText };
      }
      return item;
    });

    onUpdateSession({
      ...session,
      items: updatedItems,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = session.items.filter((item) => item.id !== itemId);
    onUpdateSession({
      ...session,
      items: updatedItems,
    });
    showToast('המשימה הוסרה מהצ\'קליסט', 'info');
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomText.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newCustomText.trim(),
      category: newCustomCategory,
      priority: newCustomPriority,
      completed: false,
    };

    const updatedSession: ChecklistSession = {
      ...session,
      items: [...session.items, newItem],
    };

    onUpdateSession(updatedSession);
    setNewCustomText('');
    setShowAddCustomModal(false);
    showToast('משימה חדשה נוספה לצ\'קליסט', 'success');
  };

  const toggleTip = (itemId: string) => {
    setOpenTips((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleNoteEditor = (itemId: string) => {
    setEditingNotes((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleGeneralNotesChange = (text: string) => {
    onUpdateSession({
      ...session,
      generalNotes: text,
    });
  };

  const handleFinish = () => {
    if (completedCount === 0) {
      if (!confirm('טרם סימנת אף משימה כהושלמה. האם בכל זאת ברצונך לסיים ולשמור את הדוח?')) {
        return;
      }
    }
    const completedSession: ChecklistSession = {
      ...session,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    onFinishAndSave(completedSession);
  };

  const filteredItems = session.items.filter((item) => {
    if (selectedCategory === 'הכל') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Top Scene Overview Card */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold">
                {session.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                זירה פעילה בטיפול
              </span>
              {session.isAiGenerated && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  מותאם לתיאור
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              {session.sceneType}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                if (confirm('האם אתה בטוח שברצונך למחוק טיוטה זו? הפעולה אינה הפיכה.')) {
                  onDiscardDraft();
                  showToast('הטיוטה בוטלה', 'info');
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors flex items-center gap-1"
              title="ביטול טיוטה"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">בטל טיוטה</span>
            </button>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>נפתח: {formatHebrewDateTime(session.createdAt)}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
          )}
          {session.examinerName && (
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{session.examinerName}</span>
            </div>
          )}
        </div>

        {/* Review disclaimer for legacy AI-flagged checklists */}
        {session.isAiGenerated && (
          <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold">
                הצעה אוטומטית – נדרשת בדיקה אנושית
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 hidden sm:inline">
              שיקול דעת החוקר בשטח קובע תמיד
            </span>
          </div>
        )}

        {/* Dynamic Progress Bar (BR-2) */}
        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">התקדמות בדיקה:</span>
              <span className="font-mono text-amber-400 font-bold">
                {completedCount} מתוך {totalCount} שלבים הושלמו
              </span>
            </div>
            <span className="font-bold text-slate-300">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                progressPercent === 100
                  ? 'bg-emerald-500 shadow-emerald-500/40 shadow-sm'
                  : progressPercent > 50
                  ? 'bg-amber-400'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Add Custom Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddCustomModal(true)}
          className="self-end sm:self-center px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף משימה מותאמת</span>
        </button>
      </div>

      {/* Interactive Checklist Items List */}
      <div className="space-y-2.5">
        {filteredItems.map((item, index) => {
          const isDone = item.completed;
          const isTipOpen = !!openTips[item.id];
          const isNoteOpen = !!editingNotes[item.id] || !!item.note;

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 ${
                isDone
                  ? 'bg-slate-900/60 border-slate-800 opacity-85'
                  : 'bg-slate-800/90 border-slate-700 hover:border-slate-600 shadow-sm'
              }`}
            >
              <div className="p-3.5 sm:p-4 flex items-start gap-3">
                {/* Large Checkbox Target */}
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className={`mt-0.5 rounded-lg p-1.5 transition-colors shrink-0 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 hover:text-amber-400 hover:bg-slate-700 border border-slate-700'
                  }`}
                  aria-label={isDone ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>

                    {session.isAiGenerated && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                        הצעה אוטומטית – נדרשת בדיקה אנושית
                      </span>
                    )}

                    {item.priority === 'high' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        קריטי / דחוף
                      </span>
                    )}

                    {isDone && item.completedAt && (
                      <span className="text-[10px] text-emerald-400 font-medium mr-auto">
                        בוצע בשעה {new Date(item.completedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-snug transition-all ${
                      isDone
                        ? 'line-through text-slate-400'
                        : 'text-slate-100 font-medium'
                    }`}
                  >
                    {item.text}
                  </p>

                  {/* Actions under task: Tip, Note, Delete */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 pt-1">
                    {item.tip && (
                      <button
                        type="button"
                        onClick={() => toggleTip(item.id)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>טיפ מז"פ</span>
                        {isTipOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleNoteEditor(item.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        item.note ? 'text-blue-400 font-medium' : 'hover:text-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{item.note ? 'ערוך הערה' : '+ הוסף הערה / מוצג'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 mr-auto transition-colors"
                      title="הסר סעיף"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expandable Tip Box */}
                  {item.tip && isTipOpen && (
                    <div className="mt-2.5 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-300 font-semibold mb-0.5">
                          טיפ מקצועי מהשטח:
                        </strong>
                        <p>{item.tip}</p>
                      </div>
                    </div>
                  )}

                  {/* Forensic Lab Advisor Box (Israeli Police Laboratories) */}
                  {(item.labName || item.labAdvice || item.packagingAdvice) && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                          <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>יועץ מעבדות מז"פ</span>
                          {item.labName && (
                            <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-500/40">
                              {item.labName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-medium">
                          הצעה אוטומטית – נדרשת בדיקה אנושית
                        </span>
                      </div>

                      {item.labAdvice && (
                        <div className="text-slate-200 leading-relaxed text-right">
                          <span className="font-semibold text-cyan-200">הנחיית ניתוב וסדר בדיקות: </span>
                          <span>{item.labAdvice}</span>
                        </div>
                      )}

                      {item.packagingAdvice && (
                        <div className="text-slate-300 flex items-start gap-1.5 pt-0.5 text-right">
                          <Package className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-300">אריזה ושימור: </span>
                            <span>{item.packagingAdvice}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note input/view */}
                  {isNoteOpen && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handleUpdateItemNote(item.id, e.target.value)}
                        placeholder="רשום הערה (למשל: סוואב מס' 2, נתפס ע&quot;י רס&quot;ר לוי, שקית אטומה)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-400 text-sm">
            לא נמצאו משימות בקטגוריה זו.
          </div>
        )}
      </div>

      {/* General Scene Notes & Chain of Custody Box */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>רשמי חוקר, שרשרת מוצגים והערות מסכמות ליומן</span>
        </label>
        <textarea
          value={session.generalNotes || ''}
          onChange={(e) => handleGeneralNotesChange(e.target.value)}
          placeholder="רשום כאן סיכום ממצאים, רשימת מוצגים שנתפסו, שמות עדים/שוטרים ששהו בזירה, או הערות מיוחדות להעברה למעבדות המטה הארצי..."
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-400"
        />
      </div>

      {/* Sticky Bottom Finish Bar for Mobile (BR-3) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-200">{completedCount}/{totalCount}</span> הושלמו ({progressPercent}%)
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>סיים ושמור</span>
          </button>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              הוספת משימה מותאמת אישית לצ'קליסט
            </h3>

            <form onSubmit={handleAddCustomItem} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  תיאור המשימה הפורנזית
                </label>
                <textarea
                  value={newCustomText}
                  onChange={(e) => setNewCustomText(e.target.value)}
                  placeholder="למשל: סריקה עם גלאי מתכות בחצר האחורית, בדיקת מצלמת דרך ברכב הסמוך..."
                  rows={2}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    קטגוריה
                  </label>
                  <select
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="בידוד ואבטחה">בידוד ואבטחה</option>
                    <option value="צילום ותיעוד">צילום ותיעוד</option>
                    <option value="איסוף ראיות">איסוף ראיות</option>
                    <option value="טביעות אצבע ודנ&quot;א">טביעות אצבע ודנ"א</option>
                    <option value="סימונים ובדיקות שטח">סימונים ובדיקות שטח</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    דחיפות
                  </label>
                  <select
                    value={newCustomPriority}
                    onChange={(e) => setNewCustomPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="normal">רגילה</option>
                    <option value="high">קריטית / דחופה</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow"
                >
                  הוסף לצ'קליסט
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
