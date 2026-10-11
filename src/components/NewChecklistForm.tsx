import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Home,
  Car,
  Skull,
  Flame,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
  Shield,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { STANDARD_SCENE_TEMPLATES } from '../data/presets';
import { ChecklistItem, ChecklistSession } from '../types';

interface NewChecklistFormProps {
  onChecklistGenerated: (session: ChecklistSession) => void;
  activeDraft: ChecklistSession | null;
  onResumeActiveDraft: () => void;
  existingSessions: ChecklistSession[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onResetDemoData?: () => void;
}

// Quick suggestions chips for the free text field
const QUICK_SUGGESTIONS = [
  'סכין עם כתמי דם ליד הדלת ותרמיל 9 מ"מ',
  'שברי זכוכית וכתמי דם על אדן החלון',
  'רכב עם שמשה משולשת שבורה ותא כפפות הפוך',
  'דלת כניסה פרוצה עם סימני מברג ומסמך קרוע',
  'מוקד בעירה מפויח עם ריח חריף של בנזין',
];

export const NewChecklistForm: React.FC<NewChecklistFormProps> = ({
  onChecklistGenerated,
  activeDraft,
  onResumeActiveDraft,
  existingSessions,
  showToast,
  onResetDemoData,
}) => {
  const [selectedSceneType, setSelectedSceneType] = useState<string>('');
  const [freeTextDescription, setFreeTextDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Client-side tailored fallback generator in Hebrew
  const generateClientFallbackChecklist = (sceneType: string, description: string): ChecklistItem[] => {
    // Check if matches standard template
    const matchedTemplate = STANDARD_SCENE_TEMPLATES.find(
      (t) => t.title.includes(sceneType) || sceneType.includes(t.title)
    );

    if (matchedTemplate && !description.trim()) {
      return matchedTemplate.items.map((item, idx) => ({
        ...item,
        id: `item-${idx + 1}`,
        completed: false,
      }));
    }

    const descLower = (sceneType + ' ' + description).toLowerCase();
    const items: ChecklistItem[] = [
      {
        id: 'ai-step-1',
        text: 'תיחום ובידוד הזירה בסרט אדום-לבן, הגדרת ציר תנועה נקי (Safe Path) ומניעת זיהום ראיות',
        category: 'בידוד ואבטחה',
        priority: 'high',
        tip: 'הקפד לרשום כל אדם שנכנס לזירה ביומן כניסות ייעודי.',
        completed: false,
      },
      {
        id: 'ai-step-2',
        text: 'צילום ותיעוד מקיף של הזירה במצבה הראשוני (צילום סקירה היקפי, צילום בינוני ותקריב עם סרגל מידה)',
        category: 'צילום ותיעוד',
        priority: 'high',
        tip: 'צלם תמיד בזווית ישרה של 90 מעלות לכל מוצג משמעותי.',
        completed: false,
      },
    ];

    if (descLower.includes('סכין') || descLower.includes('דם') || descLower.includes('דקירה') || descLower.includes('פציעה')) {
      items.push(
        {
          id: 'ai-step-3',
          text: 'דגימת כתמי דם ו-DNA מגע בסוואבים סטריליים טרם כל פעולת איבוק כימית',
          category: 'טביעות אצבע ודנ"א',
          priority: 'high',
          tip: 'יבש את המטוש באוויר פתוח בצל לפני הכנסתו לשפופרת למניעת עובש ופירוק דנ"א.',
          labName: 'מעבדת DNA וביולוגיה / מעבדת פיתוח טביעות אצבע',
          packagingAdvice: 'אריזה במעטפת נייר נושמת בלבד – חל איסור מוחלט על שקיות ניילון אטומות לדגימות לחות.',
          labAdvice: 'פיצול ניתוב מז"פ: להב/כתמי דם מועברים ישירות למעבדת DNA וביולוגיה; ידית האחיזה מועברת למעבדת פיתוח טביעות אצבע לאחר מיצוי דנ"א מגע.',
          completed: false,
        }
      );
    }

    if (descLower.includes('רכב')) {
      items.push(
        {
          id: 'ai-step-4',
          text: 'בדיקת נקודת החדירה: שברי חלון, ידית דלת, מנעול צילינדר ומצב תא הכפפות',
          category: 'סימונים ובדיקות שטח',
          priority: 'high',
          labName: 'מעבדת סימנים וחומרים',
          packagingAdvice: 'שמירת שברי זכוכית במעטפה קשיחה למניעת פציעה ואובדן שברים.',
          labAdvice: 'ניתוב שברי זכוכית למעבדת סימנים וחומרים במז"פ להשוואת מקדם שבירה לצורך שיוך רכב.',
          completed: false,
        },
        {
          id: 'ai-step-5',
          text: 'איבוק לטביעות אצבע לטנטיות: ידיות פתיחה חיצוניות, מראה מרכזית, מסגרת החלון והגה',
          category: 'טביעות אצבע ודנ"א',
          priority: 'normal',
          tip: 'השתמש באבקה מגנטית למשטחים חלקים ובאבקה שחורה עדינה למראות וזכוכית.',
          labName: 'מעבדת פיתוח טביעות אצבע',
          packagingAdvice: 'קיבוע חפצים ניידים בקופסה קשיחה כך שמשטחי האחיזה לא יתחככו בדפנות.',
          labAdvice: 'ניתוב למעבדת פיתוח טביעות אצבע להשוואה מול מאגר AFIS המשטרתי.',
          completed: false,
        },
        {
          id: 'ai-step-6',
          text: 'דגימת דנ"א מגע (Touch DNA) מההגה, ידית ההילוכים וכפתור ההתנעה באמצעות סוואב סטרילי',
          category: 'טביעות אצבע ודנ"א',
          priority: 'high',
          labName: 'מעבדת DNA וביולוגיה',
          packagingAdvice: 'אריזה במעטפת נייר לאחר ייבוש באוויר.',
          labAdvice: 'ניתוב סוואבים ישירות למעבדת DNA וביולוגיה להפקת פרופיל גנטי ממאגר ה-CODIS המשטרתי.',
          completed: false,
        }
      );
    } else if (descLower.includes('דירה') || descLower.includes('בית')) {
      items.push(
        {
          id: 'ai-step-4',
          text: 'בדיקת נקודת החדירה: איתור סימני כלים (לום/מברג), יציקת סיליקון (Mikrosil)',
          category: 'סימונים ובדיקות שטח',
          priority: 'high',
          labName: 'מעבדת סימנים וחומרים',
          packagingAdvice: 'שמירת יציקת הסיליקון בקופסה קשיחה מוגנת מלחץ, ושבבי מתכת/עץ במעטפה נפרדת.',
          labAdvice: 'ניתוב למעבדת סימנים וחומרים במז"פ להשוואת פרופיל שיני לום/מברג (Striation Marks) לכלי פריצה שייתפסו.',
          completed: false,
        },
        {
          id: 'ai-step-5',
          text: 'איתור טביעות אצבע סמויות על משטחים שהוזזו (מגירות, קופסאות תכשיטים, משקופי דלתות)',
          category: 'טביעות אצבע ודנ"א',
          priority: 'normal',
          labName: 'מעבדת פיתוח טביעות אצבע',
          packagingAdvice: 'אריזה במעטפת קשיחה המונעת מגע ישיר עם משטחי הטביעה.',
          labAdvice: 'ניתוב למעבדת פיתוח טביעות אצבע במז"פ לאיוד ציאנואקרילט וצילום פלואורסצנטי.',
          completed: false,
        },
        {
          id: 'ai-step-6',
          text: 'איתור והרמת עקבות נעליים על אדני חלונות, מרצפות או אדמה חיצונית',
          category: 'סימונים ובדיקות שטח',
          priority: 'normal',
          labName: 'מעבדת סימנים וחומרים',
          packagingAdvice: 'הרמת עקבות באמצעות ג\'ל ליפטר או יציקת גבס דנטלי עם סרגל מידה.',
          labAdvice: 'ניתוב למעבדת סימנים וחומרים להשוואה מול מאגר סוליות נעליים במז"פ.',
          completed: false,
        }
      );
    } else if (descLower.includes('רצח') || descLower.includes('גופה') || descLower.includes('מוות')) {
      items.push(
        {
          id: 'ai-step-4',
          text: 'לבישת חליפת מיגון מלאה (Tyvek), כפפות כפולות, ערדליים ומסכה למניעת זיהום צולב',
          category: 'בידוד ואבטחה',
          priority: 'high',
          completed: false,
        },
        {
          id: 'ai-step-5',
          text: 'תיעוד וניתוח תבניות כתמי דם (BPA - Bloodstain Pattern Analysis) וכיוון נתזים',
          category: 'סימונים ובדיקות שטח',
          priority: 'high',
          labName: 'מעבדת DNA וביולוגיה',
          packagingAdvice: 'דגימת כתמים נבחרים בסוואב סטרילי וייבוש מלא בצל.',
          labAdvice: 'ניתוב למעבדת DNA וביולוגיה לצורך הצלבת מקור הדם של המנוח והתוקף.',
          completed: false,
        },
        {
          id: 'ai-step-6',
          text: 'דגימות דנ"א מתחת לציפורני המנוח (Fingernail Swabs) לאיתור רקמות תוקף אפשריות ממאבק',
          category: 'טביעות אצבע ודנ"א',
          priority: 'high',
          labName: 'מעבדת DNA וביולוגיה',
          packagingAdvice: 'סוואבים ייעודיים בכל שפופרת נפרדת לכל יד (ימין/שמאל).',
          labAdvice: 'ניתוב דחוף למעבדת DNA וביולוגיה לבידוד פרופיל DNA זר מתחת לציפורניים.',
          completed: false,
        }
      );
    } else if (descLower.includes('שריפה') || descLower.includes('הצתה') || descLower.includes('אש')) {
      items.push(
        {
          id: 'ai-step-4',
          text: 'איתור מוקדי בעירה נפרדים (Multiple Points of Origin) המעידים על הצתה מכוונת',
          category: 'סימונים ובדיקות שטח',
          priority: 'high',
          completed: false,
        },
        {
          id: 'ai-step-5',
          text: 'דגימת פיח ושפכי נוזלים במוקדים הנמוכים ביותר באמצעות פחיות צבע חדשות ואטומות לאדי בנזין',
          category: 'איסוף ראיות',
          priority: 'high',
          labName: 'מעבדת הצתות ופחמימנים',
          packagingAdvice: 'פחיות מתכת חדשות ואטומות הרמטית או שקיות ניילון ייעודיות לאדי בנזין (Nylon Kapak).',
          labAdvice: 'ניתוב למעבדת הצתות ופחמימנים במז"פ לזיהוי חומרי האצה (בנזין/סולר/מדלל) באמצעות גז-כרומטוגרף (GC-MS).',
          completed: false,
        }
      );
    } else {
      items.push(
        {
          id: 'ai-step-4',
          text: 'איתור טביעות אצבע לטנטיות באמצעות תאורה אלכסונית ואבקות איבוק מתאימות',
          category: 'טביעות אצבע ודנ"א',
          priority: 'normal',
          labName: 'מעבדת פיתוח טביעות אצבע',
          packagingAdvice: 'קיבוע החפץ בקופסה למניעת שחיקה.',
          labAdvice: 'ניתוב למעבדת פיתוח טביעות אצבע במז"פ.',
          completed: false,
        },
        {
          id: 'ai-step-5',
          text: 'סריקה לאיסוף ראיות זעירות (סיבים, שערות, שברי חומר) באמצעות מלקטת סטרילית',
          category: 'איסוף ראיות',
          priority: 'normal',
          labName: 'מעבדת סימנים וחומרים / מעבדת סיב וטקסטיל',
          packagingAdvice: 'אריזה במעטפת נייר ייעודית (Bindler) למניעת אובדן ראיות.',
          labAdvice: 'ניתוב למעבדת סיבים וחומרים במז"פ להשוואה מיקרוסקופית וספקטרומטרית.',
          completed: false,
        }
      );
    }

    items.push({
      id: `ai-step-${items.length + 1}`,
      text: 'אריזה, איטום, חתימה ורישום מלא של כל המוצגים בטפסי שרשרת מוצג (Chain of Custody)',
      category: 'איסוף ראיות',
      priority: 'high',
      tip: 'ודא שחתימת החוקר מופיעה על מדבקת האיטום (Tamper-evident seal).',
      completed: false,
    });

    return items;
  };

  const handleGenerate = async () => {
    // Validation: selecting a standard type OR entering text is required
    if (!selectedSceneType && !freeTextDescription.trim()) {
      setValidationError('נא לבחור סוג זירה מהתפריט או להזין תיאור חופשי של מה שאתה רואה.');
      return;
    }

    // Prevent silent overwriting if an active draft is currently in progress
    if (activeDraft) {
      const confirmed = window.confirm("יש לך צ'קליסט פעיל פתוח. האם ברצונך להחליף אותו בצ'קליסט חדש?");
      if (!confirmed) {
        return;
      }
    }

    setValidationError(null);

    const effectiveTitle = selectedSceneType || (freeTextDescription.slice(0, 32) + (freeTextDescription.length > 32 ? '...' : ''));
    const sessionId = `CHK-2026-${String(existingSessions.length + 1).padStart(4, '0')}`;

    // If free-text is entered, ask the server for a tailored checklist (Claude, or keyword fallback)
    if (freeTextDescription.trim()) {
      setIsLoadingAi(true);
      try {
        const response = await fetch('/api/generate-checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: freeTextDescription.trim(),
            sceneType: selectedSceneType || 'זירת עבירה',
          }),
        });

        if (!response.ok) {
          throw new Error('Server returned an error status');
        }

        const data = await response.json();
        const items: ChecklistItem[] = (data.items || []).map((item: any, idx: number) => ({
          id: item.id || `ai-step-${idx + 1}`,
          text: item.text,
          category: item.category || 'איסוף ראיות',
          priority: item.priority || 'normal',
          tip: item.tip,
          labName: item.labName,
          packagingAdvice: item.packagingAdvice,
          labAdvice: item.labAdvice,
          completed: false,
        }));

        if (items.length === 0) {
          throw new Error('Empty items returned');
        }

        const newSession: ChecklistSession = {
          id: sessionId,
          sceneType: effectiveTitle,
          sceneDescription: freeTextDescription.trim(),
          createdAt: new Date().toISOString(),
          isCompleted: false,
          isAiGenerated: data.isAiGenerated === true,
          generatedBy: data.isAiGenerated === true ? data.source : undefined,
          items,
        };

        setIsLoadingAi(false);
        onChecklistGenerated(newSession);
        if (newSession.isAiGenerated) {
          showToast('צ\'קליסט הופק ע"י Claude – נדרשת בדיקה אנושית', 'success');
        } else {
          showToast('צ\'קליסט הופק לפי מילות מפתח (מצב גיבוי)', 'info');
        }
        return;
      } catch (err) {
        console.warn('Server call failed or offline, falling back to smart forensic checklist:', err);
        // Graceful fallback to rich forensic checklist without breaking app
        const fallbackItems = generateClientFallbackChecklist(selectedSceneType, freeTextDescription);
        const newSession: ChecklistSession = {
          id: sessionId,
          sceneType: effectiveTitle,
          sceneDescription: freeTextDescription.trim(),
          createdAt: new Date().toISOString(),
          isCompleted: false,
          isAiGenerated: false,
          items: fallbackItems,
        };

        setIsLoadingAi(false);
        onChecklistGenerated(newSession);
        showToast('צ\'קליסט פורנזי מותאם הופק בהצלחה (מצב גיבוי)', 'info');
        return;
      }
    } else {
      // Standard template generation (no free-text entered)
      const matchedTemplate = STANDARD_SCENE_TEMPLATES.find(
        (t) => t.title.includes(selectedSceneType) || selectedSceneType.includes(t.title)
      ) || STANDARD_SCENE_TEMPLATES[0];

      const items: ChecklistItem[] = matchedTemplate.items.map((item, idx) => ({
        ...item,
        id: `step-${idx + 1}`,
        completed: false,
      }));

      const newSession: ChecklistSession = {
        id: sessionId,
        sceneType: effectiveTitle,
        createdAt: new Date().toISOString(),
        isCompleted: false,
        isAiGenerated: false,
        items,
      };

      onChecklistGenerated(newSession);
      showToast(`צ'קליסט עבור "${effectiveTitle}" נוצר בהצלחה!`, 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Existing Active Draft Alert if present */}
      {activeDraft && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-300">קיימת זירה פעילה: </span>
              <span>{activeDraft.sceneType}</span>
            </div>
          </div>
          <button
            onClick={onResumeActiveDraft}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0"
          >
            חזור לזירה
          </button>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100">
              פתיחת צ'קליסט לזירת עבירה
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            בחר סוג זירה תקני מהרשימה או הזן תיאור חופשי של מה שאתה רואה בשטח:
          </p>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Option 1: Standard Scene Type Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            אפשרות 1: בחירת סוג זירה תקני (תפריט נפתח)
          </label>
          <div className="relative">
            <select
              value={selectedSceneType}
              onChange={(e) => {
                setSelectedSceneType(e.target.value);
                setValidationError(null);
              }}
              className="w-full appearance-none bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl px-4 py-3 pr-4 pl-10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            >
              <option value="">-- בחר סוג זירה מהרשימה --</option>
              <option value="התפרצות לרכב">התפרצות לרכב</option>
              <option value="התפרצות לדירה">התפרצות לדירה</option>
              <option value="רצח">רצח / מוות בלתי טבעי</option>
              <option value="שריפה">שריפה / הצתה חשודה</option>
              <option value="זירת ירי / שימוש בנשק חם">זירת ירי / שימוש בנשק חם</option>
              <option value="שוד מזוין / תקיפה חמורה">שוד מזוין / תקיפה חמורה</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Divider with "OR" */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
            או
          </span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Option 2: Free Text Description with keyword-based tailoring */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>אפשרות 2: תיאור חופשי של מה שאתה רואה בזירה</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </label>
            <span className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              ניתוח Claude AI
            </span>
          </div>

          <textarea
            value={freeTextDescription}
            onChange={(e) => {
              setFreeTextDescription(e.target.value);
              setValidationError(null);
            }}
            placeholder="לדוגמה: רכב בחניון עם שמשה שבורה, כתמי דם על המושב, תרמיל 9 מ&quot;מ על הכביש ותא כפפות פרוץ..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />

          {/* Quick Suggestions Chips */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block mb-1">
              רעיונות מהירים להדגמה (לחץ להזנה מהירה):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFreeTextDescription(chip);
                    setValidationError(null);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors text-right"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button: צור צ'קליסט */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoadingAi}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              isLoadingAi
                ? 'bg-amber-600/70 text-slate-950 cursor-wait'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Claude מנתח את תיאור הזירה ומפיק שלבים... (עד 40 שניות)</span>
              </>
            ) : (
              <>
                {freeTextDescription.trim() ? (
                  <Sparkles className="w-4 h-4 text-slate-950" />
                ) : (
                  <Zap className="w-4 h-4 text-slate-950" />
                )}
                <span>צור צ'קליסט</span>
                <ArrowLeft className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Accessible Reset Demo Data button on Home Screen */}
      {onResetDemoData && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
          <span>סביבת הדגמה: מעוניין לאפס את הנתונים למצב ברירת המחדל?</span>
          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold rounded-lg border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס נתוני דמה</span>
          </button>
        </div>
      )}
    </div>
  );
};
