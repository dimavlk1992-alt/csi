// Checks that a DNA swab of an item comes before chemical fingerprint development of the same item,
// since ninhydrin / cyanoacrylate destroy genetic material.

export interface OrderCheckStep {
  text: string;
  labName?: string;
}

const DNA_LAB = 'מעבדת DNA וביולוגיה';
const FINGERPRINT_LAB = 'מעבדת פיתוח טביעות אצבע';

const DNA_TERMS = /DNA|דנ"א|סוואב|מטוש|swab/i;
const CHEMICAL_TERMS = /נינהידרין|ninhydrin|ציאנואקרילט|cyanoacrylate|סופר.?גלו|super.?glue|DFO|אינדנדיון|indandione/i;

// Evidence items a step can refer to. Matched as substrings so Hebrew prefixes (ה/ב/מ/ל/ו/ש) still match.
const ITEM_TERMS = [
  'פתק', 'מסמך', 'מכתב', 'מעטפה', 'נייר', 'סכין', 'להב', 'ידית', 'בקבוק', 'כוס', 'פחית', 'תרמיל',
  'קליע', 'נשק', 'אקדח', 'הגה', 'דלת', 'חלון', 'מראה', 'מצית', 'מיכל', 'בדל', 'טלפון', 'משטח',
];

// Only the action text is classified: labAdvice routinely restates the whole sequence ("DNA, then ninhydrin").
function kind(step: OrderCheckStep): 'dna' | 'chemical' | 'both' | null {
  const lab = step.labName ?? '';
  const dna = DNA_TERMS.test(step.text) && lab.includes(DNA_LAB);
  const chemical = CHEMICAL_TERMS.test(step.text) && lab.includes(FINGERPRINT_LAB);
  if (dna && chemical) return 'both'; // one combined step; its text states the internal order
  return dna ? 'dna' : chemical ? 'chemical' : null;
}

function itemsIn(text: string): Set<string> {
  return new Set(ITEM_TERMS.filter((term) => text.includes(term)));
}

// A step that names no recognizable item may concern any item, so it is treated as overlapping.
function sameItem(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return true;
  return [...a].some((term) => b.has(term));
}

/** Returns a reason string if a chemical step precedes a DNA step for the same item, otherwise null. */
export function findDnaAfterChemicalViolation(steps: OrderCheckStep[]): string | null {
  const classified = steps.map((step, index) => ({ index, kind: kind(step), items: itemsIn(step.text) }));
  for (const chemical of classified.filter((s) => s.kind === 'chemical')) {
    const laterDna = classified.find((s) => s.kind === 'dna' && s.index > chemical.index && sameItem(s.items, chemical.items));
    if (laterDna) {
      const shared = [...chemical.items].filter((term) => laterDna.items.has(term));
      const item = shared.length ? shared.join(', ') : 'unspecified item';
      return `chemical fingerprint step ${chemical.index + 1} comes before DNA step ${laterDna.index + 1} (${item})`;
    }
  }
  return null;
}
