import React from 'react';
import { Shield, Home, CheckSquare, History, AlertTriangle } from 'lucide-react';
import { ChecklistSession } from '../types';

interface HeaderProps {
  activeTab: 'new' | 'active' | 'history';
  setActiveTab: (tab: 'new' | 'active' | 'history') => void;
  activeDraft: ChecklistSession | null;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDraft,
  historyCount,
}) => {
  const activeCompletedCount = activeDraft ? activeDraft.items.filter((i) => i.completed).length : 0;
  const activeTotalCount = activeDraft ? activeDraft.items.length : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      {/* Required Yellow Banner */}
      <div className="w-full bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
        <span>סביבת הדגמה – נתוני דמה בלבד</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div
            onClick={() => setActiveTab('new')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-400 shadow-inner group-hover:border-amber-400 transition-colors">
              <Shield className="w-5 h-5" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-slate-950">
                ז
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-100">
                  צ'קליסט זירת עבירה
                </h1>
                <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  שלב 1 מתוך 6
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                מעקב שלבי עבודה פורנזיים לחוקרי וסיירי שטח
              </p>
            </div>
          </div>

          {/* Quick Active Draft Pill if exists */}
          {activeDraft && activeTab !== 'active' && (
            <button
              onClick={() => setActiveTab('active')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-medium"
              title="חזור לצ'קליסט הפעיל"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden xs:inline">זירה פעילה:</span>
              <span className="font-bold">{activeCompletedCount}/{activeTotalCount}</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs - Exactly as requested */}
        <nav className="flex items-center justify-center gap-1 sm:gap-2 mt-3 pt-1 border-t border-slate-800/80">
          {/* Tab 1: מסך הבית / יצירה */}
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'new'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>מסך הבית / יצירה</span>
          </button>

          {/* Tab 2: צ'קליסט פעיל */}
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 relative flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : activeDraft
                ? 'text-amber-300 hover:bg-slate-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>צ'קליסט פעיל</span>
            {activeDraft && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'active'
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {activeCompletedCount}/{activeTotalCount}
              </span>
            )}
          </button>

          {/* Tab 3: היסטוריה */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>היסטוריה</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'history'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {historyCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
