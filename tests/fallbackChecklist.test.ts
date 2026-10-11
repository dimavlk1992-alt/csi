import { describe, expect, it } from 'vitest';
import { generateFallbackChecklist } from '../fallbackChecklist';
import { findDnaAfterChemicalViolation } from '../forensicOrder';

// Covers every heuristic branch plus scenes that trigger more than one branch
const SCENES = [
  'סכין עם כתמי דם ליד גופה במטבח',
  'ירי באקדח, תרמיל וקליע על המדרכה',
  'הצתה של רכב בחניון',
  'רכב עם תרמיל ודם על המושב',
  'פריצה לדירה דרך חלון',
  'שריפה במחסן עם ריח של חומר האצה',
  'פתק איום עם טביעת אצבע',
  'מכתב סחיטה עם כתמי דם',
  'חפץ חשוד שנמצא בפארק',
];

const SEQUENCE = 'מסמכים ← DNA ← נינהידרין';

describe('generateFallbackChecklist', () => {
  describe.each(SCENES)('%s', (description) => {
    const items = generateFallbackChecklist(description, 'זירת עבירה');

    it('never puts chemical fingerprint development before a DNA swab of the same item', () => {
      expect(findDnaAfterChemicalViolation(items)).toBeNull();
    });

    it('numbers steps sequentially with unique ids', () => {
      expect(items.map((item) => item.id)).toEqual(items.map((_, index) => `step-${index + 1}`));
    });

    it('starts with scene isolation and ends with chain of custody', () => {
      expect(items[0].category).toBe('בידוד ואבטחה');
      expect(items.at(-1)?.text).toContain('Chain of Custody');
    });
  });

  it.each(['פתק איום עם טביעת אצבע', 'מכתב סחיטה עם כתמי דם'])(
    'routes documents in rule-10 order with the full sequence in labAdvice: %s',
    (description) => {
      const items = generateFallbackChecklist(description, 'זירת עבירה');
      const documentLabs = ['מעבדת מסמכים והשוואת כתבי יד', 'מעבדת DNA וביולוגיה', 'מעבדת פיתוח טביעות אצבע'];
      const documentSteps = items.filter((item) => item.labAdvice?.includes(SEQUENCE));

      expect(documentSteps.map((item) => item.labName)).toEqual(documentLabs);
      expect(documentSteps[2].text).toContain('נינהידרין');
      // The three steps are in this order in the full list
      const positions = documentSteps.map((step) => items.indexOf(step));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    },
  );
});
