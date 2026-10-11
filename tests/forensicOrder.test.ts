import { describe, expect, it } from 'vitest';
import { findDnaAfterChemicalViolation, type OrderCheckStep } from '../forensicOrder';

const DOCS = 'מעבדת מסמכים והשוואת כתבי יד';
const DNA = 'מעבדת DNA וביולוגיה';
const FP = 'מעבדת פיתוח טביעות אצבע';
const isolation: OrderCheckStep = { text: 'בידוד ואבטחת הזירה' };

describe('findDnaAfterChemicalViolation', () => {
  it('accepts the correct note order: documents → DNA → ninhydrin', () => {
    const steps = [
      isolation,
      { text: 'בדיקה לא הרסנית של הפתק: כתב יד, דיו ולחץ כתיבה', labName: DOCS },
      { text: 'דגימת DNA מגע מהפתק בסוואב סטרילי', labName: DNA },
      { text: 'פיתוח טביעות אצבע על הפתק בנינהידרין', labName: FP },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBeNull();
  });

  it('rejects ninhydrin on a note before the DNA swab of that note', () => {
    const steps = [
      isolation,
      { text: 'פיתוח טביעות אצבע על הפתק בנינהידרין', labName: FP },
      { text: 'דגימת DNA מגע מהפתק בסוואב סטרילי', labName: DNA },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBe('chemical fingerprint step 2 comes before DNA step 3 (פתק)');
  });

  it('allows ninhydrin on a note before a DNA swab of a different item', () => {
    const steps = [
      isolation,
      { text: 'פיתוח טביעות אצבע על הפתק בנינהידרין', labName: FP },
      { text: 'דגימת DNA מלהב הסכין בסוואב', labName: DNA },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBeNull();
  });

  it('classifies a DNA step that mentions ninhydrin ("before ninhydrin") as a DNA step', () => {
    const steps = [
      isolation,
      { text: 'דגימת DNA מהפתק בסוואב לפני טיפול בנינהידרין', labName: DNA },
      { text: 'פיתוח טביעות על הפתק בנינהידרין', labName: FP },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBeNull();
  });

  it('treats a chemical step that names no item as overlapping any later DNA step', () => {
    const steps = [
      isolation,
      { text: 'פיתוח באדי ציאנואקרילט', labName: FP },
      { text: 'דגימת DNA מגע מהידית בסוואב', labName: DNA },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBe('chemical fingerprint step 2 comes before DNA step 3 (unspecified item)');
  });

  it('rejects superglue on a knife handle before the DNA swab of the handle', () => {
    const steps = [
      isolation,
      { text: 'פיתוח טביעות בסופרגלו על ידית הסכין', labName: `${FP} / ${DNA}` },
      { text: 'סוואב DNA מגע מהידית', labName: DNA },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBe('chemical fingerprint step 2 comes before DNA step 3 (ידית)');
  });

  it('accepts a real Claude ninhydrin step whose text says "after the DNA swab"', () => {
    const steps = [
      isolation,
      { text: 'דגימת DNA מגע בסוואב סטרילי מאזורי המגע האפשריים בפתק (שוליים ופינות), לפני כל טיפול כימי.', labName: DNA },
      { text: 'שליחת הפתק לפיתוח כימי של הטביעה (נינהידרין ואחריו שיטות משלימות), רק לאחר דגימת ה-DNA.', labName: FP },
    ];
    expect(findDnaAfterChemicalViolation(steps)).toBeNull();
  });
});
