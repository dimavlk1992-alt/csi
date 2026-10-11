import React, { useState } from 'react';
import {
  X,
  Copy,
  Printer,
  Check,
  Download,
  FileText,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Sparkles,
  FlaskConical,
} from 'lucide-react';
import { ChecklistSession } from '../types';
import { formatHebrewDateTime, formatReportText } from '../utils/storage';

interface ReportModalProps {
  session: ChecklistSession | null;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  session,
  onClose,
  showToast,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'formatted' | 'raw'>('formatted');
  const [copied, setCopied] = useState<boolean>(false);

  if (!session) return null;

  const rawReportText = formatReportText(session);
  const completedItems = session.items.filter((i) => i.completed);
  const totalItems = session.items.length;
  const completionPercent = Math.round((completedItems.length / (totalItems || 1)) * 100);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(rawReportText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = rawReportText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('הדוח הועתק ללוח בהצלחה! ניתן להדביק ביומן האירועים/תיק החקירה.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('שגיאה בהעתקה ללוח', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([rawReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `דוח_זירה_${session.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('קובץ הדוח ירד למחשב', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  פרטי סיכום זירה
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {session.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">{session.sceneType}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveViewTab('formatted')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeViewTab === 'formatted'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              תצוגת דוח רשמי
            </button>
            <button
              onClick={() => setActiveViewTab('raw')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeViewTab === 'raw'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              טקסט להעתקה מהירה
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="הדפס דוח"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">הדפס</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="שמור קובץ טקסט"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">הורד</span>
            </button>

            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק ללוח!' : 'העתק דוח ללוח'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeViewTab === 'formatted' ? (
            <div className="space-y-4 text-right">
              {/* Official Report Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold tracking-wider">
                      מעבדת זיהוי פלילי (מז"פ) - תיעוד שטח
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                      הושלם ({completionPercent}%)
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-100 mt-1">
                    {session.sceneType}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>פתיחה: {formatHebrewDateTime(session.createdAt)}</span>
                  </div>
                  {session.completedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>סיום: {formatHebrewDateTime(session.completedAt)}</span>
                    </div>
                  )}
                  {session.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>מיקום: {session.location}</span>
                    </div>
                  )}
                  {session.examinerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>חוקר: {session.examinerName}</span>
                    </div>
                  )}
                </div>

                {session.isAiGenerated && (
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>הצעה אוטומטית – נדרשת בדיקה אנושית (שיקול דעת החוקר בשטח קובע)</span>
                  </div>
                )}
              </div>

              {/* Tasks Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  פעולות ומוצגים שתועדו ({completedItems.length}/{totalItems})
                </h4>

                <div className="space-y-2">
                  {session.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs ${
                        item.completed
                          ? 'bg-slate-900/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 p-0.5 rounded ${
                            item.completed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-200">
                              {idx + 1}. {item.text}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 mr-auto">
                              {item.category}
                            </span>
                          </div>

                          {item.completedAt && (
                            <div className="text-[10px] text-slate-500">
                              שעת ביצוע: {formatHebrewDateTime(item.completedAt)}
                            </div>
                          )}

                          {(item.labName || item.labAdvice || item.packagingAdvice) && (
                            <div className="mt-1.5 p-2 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-[11px] space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                                <FlaskConical className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>ניתוב מז"פ: {item.labName || 'מעבדות מז"פ'}</span>
                              </div>
                              {item.labAdvice && (
                                <div className="text-slate-300">
                                  <span className="font-semibold text-cyan-200">הנחיית ניתוב ובדיקות: </span>
                                  {item.labAdvice}
                                </div>
                              )}
                              {item.packagingAdvice && (
                                <div className="text-slate-300">
                                  <span className="font-semibold text-amber-300">אריזה ושימור: </span>
                                  {item.packagingAdvice}
                                </div>
                              )}
                            </div>
                          )}

                          {item.note && (
                            <div className="mt-1 p-2 rounded bg-slate-800/80 border border-slate-700/60 text-amber-200 text-xs">
                              <strong>הערת חוקר / מוצג:</strong> {item.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Notes if any */}
              {session.generalNotes && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-amber-300">
                    רשמי חוקר ושרשרת מוצגים מסכמת:
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {session.generalNotes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  טקסט מוכן להדבקה במערכת מנ"ע / יומן חקירות:
                </span>
              </div>
              <pre className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-amber-500 selection:text-slate-950 text-right dir-rtl">
                {rawReportText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            מתאים לשימוש בחקירות ומשפט
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            סגור חלון
          </button>
        </div>
      </div>
    </div>
  );
};
