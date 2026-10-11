import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface ChecklistItemDto {
  id: string;
  text: string;
  category: string;
  priority?: 'high' | 'normal';
  tip?: string;
  labName?: string;
  packagingAdvice?: string;
  labAdvice?: string;
  completed: boolean;
}

// Fallback smart forensic heuristic generator in Hebrew with Israeli Police lab routing
function generateFallbackChecklist(description: string, sceneType?: string): ChecklistItemDto[] {
  const descLower = (description + ' ' + (sceneType || '')).toLowerCase();
  const items: ChecklistItemDto[] = [
    {
      id: 'step-1',
      text: 'תיחום ובידוד הזירה בסרט סימון, קביעת נתיב תנועה סטרילי (Safe Path) ומניעת כניסת בלתי מורשים',
      category: 'בידוד ואבטחה',
      priority: 'high',
      tip: 'רשום כל אדם שנכנס לזירה ביומן כניסות זירה עם שעה ותפקיד.',
      completed: false,
    },
    {
      id: 'step-2',
      text: 'צילום ותיעוד הזירה במצבה הגולמי בטרם נגיעה (תמונות סקירה כללית, טווח בינוני ותקריב עם סרגל מידה)',
      category: 'צילום ותיעוד',
      priority: 'high',
      tip: 'צלם תמיד ממרחק, מזווית ישרה, ושלב סרגל מידה או קוביות מספרים.',
      completed: false,
    },
  ];

  if (
    descLower.includes('דם') ||
    descLower.includes('פציעה') ||
    descLower.includes('סכין') ||
    descLower.includes('גופה') ||
    descLower.includes('רצח') ||
    descLower.includes('דקירה')
  ) {
    items.push({
      id: 'step-3',
      text: 'דגימת כתמי דם ו-DNA מגע בסוואבים סטריליים טרם כל פעולת איבוק כימית',
      category: 'טביעות אצבע ודנ"א',
      priority: 'high',
      tip: 'יבש את המטוש באוויר פתוח בצל לפני הכנסתו לשפופרת למניעת עובש ופירוק דנ"א.',
      labName: 'מעבדת DNA וביולוגיה / מעבדת פיתוח טביעות אצבע',
      packagingAdvice: 'אריזה במעטפת נייר נושמת בלבד – חל איסור מוחלט על שקיות ניילון אטומות לדגימות לחות.',
      labAdvice: 'פיצול ניתוב מז"פ: להב/כתמי דם מועברים ישירות למעבדת DNA וביולוגיה; ידית האחיזה מועברת למעבדת פיתוח טביעות אצבע לאחר מיצוי דנ"א מגע.',
      completed: false,
    });
  }

  if (
    descLower.includes('נשק') ||
    descLower.includes('ירי') ||
    descLower.includes('תרמיל') ||
    descLower.includes('קליע') ||
    descLower.includes('אקדח')
  ) {
    items.push({
      id: 'step-4',
      text: 'סימון, מספור ואיסוף תרמילים, קליעים ובדיקת שרידי ירי (GSR)',
      category: 'איסוף ראיות',
      priority: 'high',
      tip: 'אחוז בתרמיל בכפפות סטריליות בשפתי הבסיס והימנע משריטת סימני שן נוקר ומחלץ.',
      labName: 'מעבדת נשק ותחמושת',
      packagingAdvice: 'אריזה בקופסה קשיחה מרופדת במטליות/ספוג – אין להשתמש במלקטת מתכת ישירה על סימני ירי.',
      labAdvice: 'ניתוב למעבדת נשק ותחמושת במז"פ להשוואת סימני ירי במערכת IBIS, בדיקת שרידי ירי ובדיקת DNA/טביעות אצבע טרם ירי מבחן.',
      completed: false,
    });
  }

  if (descLower.includes('רכב') || descLower.includes('מכונית') || descLower.includes('אופנוע')) {
    items.push({
      id: 'step-5',
      text: 'איתור ואיבוק טביעות אצבע על ידיות הדלת, חלונות, מראה מרכזית, הגה ותא כפפות',
      category: 'טביעות אצבע ודנ"א',
      priority: 'normal',
      tip: 'השתמש באבקה מגנטית למשטחים חלקים ובאבקה שחורה עדינה למראות וזכוכית.',
      labName: 'מעבדת פיתוח טביעות אצבע / מעבדת DNA וביולוגיה',
      packagingAdvice: 'קיבוע חפצים ניידים בקופסה קשיחה כך שמשטחי האחיזה לא יתחככו בדפנות.',
      labAdvice: 'סוואב DNA מגע (Touch DNA) מההגה וידית ההילוכים למעבדת DNA, ומשטחים חלקים למעבדת פיתוח טביעות אצבע לאיוד ציאנואקרילט.',
      completed: false,
    });
    items.push({
      id: 'step-6',
      text: 'סריקת פנים הרכב לאיתור פריטים אישיים נטושים (בדלי סיגריות, שובר חניה, קבלות, בקבוקים)',
      category: 'איסוף ראיות',
      priority: 'normal',
      tip: 'כל פריט אישי עשוי להכיל תאי אפיתל ודנ"א מגע יקר ערך.',
      labName: 'מעבדת DNA וביולוגיה',
      packagingAdvice: 'מעטפות נייר נפרדות לכל פריט עם רישום מיקום מדויק ברכב.',
      labAdvice: 'ניתוב בדלי סיגריות ופחיות שתייה למעבדת DNA וביולוגיה להפקת פרופיל גנטי מרוק.',
      completed: false,
    });
  } else if (
    descLower.includes('דירה') ||
    descLower.includes('בית') ||
    descLower.includes('חלון') ||
    descLower.includes('דלת') ||
    descLower.includes('פריצה')
  ) {
    items.push({
      id: 'step-5',
      text: 'בדיקת נקודת החדירה (חלון/סורג/צילינדר), תיעוד סימני כלים ויציקת סיליקון (מיקרוסיל)',
      category: 'סימונים ובדיקות שטח',
      priority: 'high',
      tip: 'אל תנסה להכניס כלי חשוד למגרעת כדי לא להרוס סימנים מיקרוסקופיים!',
      labName: 'מעבדת סימנים וחומרים',
      packagingAdvice: 'שמירת יציקת הסיליקון בקופסה קשיחה מוגנת מלחץ, ואריזת שבבי מתכת/עץ במעטפה נפרדת.',
      labAdvice: 'ניתוב למעבדת סימנים וחומרים במז"פ להשוואת פרופיל שיני לום/מברג (Striation Marks) לכלי פריצה שייתפסו.',
      completed: false,
    });
    items.push({
      id: 'step-6',
      text: 'איבוק לטביעות אצבע סמויות על משטחים שהוזזו (מגירות, קופסאות תכשיטים, בקבוקי שתייה)',
      category: 'טביעות אצבע ודנ"א',
      priority: 'normal',
      tip: 'קח טביעות השוואה ואלימינציה מבעלי הדירה לשלילת ממצאים.',
      labName: 'מעבדת פיתוח טביעות אצבע',
      packagingAdvice: 'אריזה במעטפת קשיחה המונעת מגע ישיר עם משטחי הטביעה.',
      labAdvice: 'ניתוב למעבדת פיתוח טביעות אצבע להעלאת ממצאים למאגר AFIS המשטרתי.',
      completed: false,
    });
  } else if (descLower.includes('אש') || descLower.includes('שריפה') || descLower.includes('הצתה')) {
    items.push({
      id: 'step-5',
      text: 'איתור מוקדי בעירה ותבניות התפשטות (V-pattern), תיעוד סימני חומרי האצה ודגימת פיח',
      category: 'איסוף ראיות',
      priority: 'high',
      tip: 'ארוז דגימות מפוחמות בצנצנות אטומות או פחיות ייעודיות לאדי פחמימנים.',
      labName: 'מעבדת הצתות ופחמימנים',
      packagingAdvice: 'פחיות מתכת חדשות ואטומות הרמטית או שקיות ניילון ייעודיות לפחמימנים (Nylon Kapak).',
      labAdvice: 'ניתוב למעבדת הצתות ופחמימנים במז"פ לזיהוי חומרי האצה (בנזין/סולר/מדלל) באמצעות גז-כרומטוגרף (GC-MS).',
      completed: false,
    });
  } else if (descLower.includes('מסמך') || descLower.includes('פתק') || descLower.includes('מכתב') || descLower.includes('כתב')) {
    items.push({
      id: 'step-5',
      text: 'תפיסת מסמכים ופתקים במלקטת סטרילית ללא קיפול או יצירת לחץ נוסף',
      category: 'איסוף ראיות',
      priority: 'high',
      tip: 'הימנע מלגעת במסמך בידיים חשופות או לסמן עליו.',
      labName: 'מעבדת מסמכים והשוואת כתבי יד / מעבדת פיתוח טביעות אצבע',
      packagingAdvice: 'מעטפת צלופן שקופה וקשיחה ללא קיפול.',
      labAdvice: 'סדר בדיקות: קודם בדיקה לא הרסנית במעבדת מסמכים (לחץ כתיבה, דיו, השוואת כתב), ורק לאחר מכן טיפול כימי בנינהידרין לפיתוח טביעות אצבע.',
      completed: false,
    });
  } else {
    items.push({
      id: 'step-5',
      text: 'איתור טביעות אצבע לטנטיות (באמצעות פנס בזווית אלכסונית ואבקות איבוק מתאימות)',
      category: 'טביעות אצבע ודנ"א',
      priority: 'normal',
      tip: 'תאורה אלכסונית (Oblique Lighting) חושפת טביעות סמויות לפני שימוש בכימיקלים.',
      labName: 'מעבדת פיתוח טביעות אצבע',
      packagingAdvice: 'קיבוע החפץ בקופסה למניעת שחיקה.',
      labAdvice: 'ניתוב למעבדת פיתוח טביעות אצבע במז"פ.',
      completed: false,
    });
    items.push({
      id: 'step-6',
      text: 'סריקה קפדנית לאיסוף ראיות זעירות (סיבים, שערות, חלקיקי צבע או עפר) באמצעות מלקטת',
      category: 'איסוף ראיות',
      priority: 'normal',
      tip: 'שמור כל ראיה במעטפה נפרדת כדי למנוע זיהום צולב.',
      labName: 'מעבדת סימנים וחומרים / מעבדת סיב וטקסטיל',
      packagingAdvice: 'אריזה במעטפת נייר ייעודית (Folded Paper Bindler) למניעת אובדן ראיות מיקרוסקופיות.',
      labAdvice: 'ניתוב למעבדת סיבים וחומרים במז"פ להשוואה מיקרוסקופית וספקטרומטרית.',
      completed: false,
    });
  }

  items.push({
    id: `step-${items.length + 1}`,
    text: 'אריזה, איטום, חתימה ורישום מלא של כל המוצגים בטפסי שרשרת מוצג (Chain of Custody)',
    category: 'איסוף ראיות',
    priority: 'high',
    tip: 'ודא שחתימת החוקר מופיעה על מדבקת האיטום (Tamper-evident seal).',
    labName: 'יועץ שרשרת מוצגים מז"פ',
    packagingAdvice: 'מדבקות איטום משטרתיות אדומות חתומות על כל שקית/קופסה.',
    labAdvice: 'העברה מבוקרת למחסן מוצגים תחנתי ומשם בליווי מאובטח למעבדות מז"פ במטה הארצי ירושלים.',
    completed: false,
  });

  return items;
}

// API endpoint to generate tailored forensic checklist with Israeli Police Lab Advisor
app.post('/api/generate-checklist', (req: Request, res: Response) => {
  const { description, sceneType } = req.body;
  if (!description && !sceneType) {
    return res.status(400).json({ error: 'Scene description or type is required' });
  }

  const items = generateFallbackChecklist(description || '', sceneType);
  return res.json({
    items,
    isAiGenerated: false,
    source: 'heuristic',
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
