import { describe, expect, it } from 'vitest';
import { spreadsheetChallenge } from './spreadsheet';

interface SpreadsheetInstance {
  setCell(cellId: string, input: number | string): void;
  getCell(cellId: string): number;
}

// Execute the exact displayed solution, including its example, without logging
// the example's output during the test run.
const Spreadsheet = new Function(
  'console',
  spreadsheetChallenge.code + '\nreturn Spreadsheet;',
)({ log: () => {} }) as new () => SpreadsheetInstance;

describe('Spreadsheet solution', () => {
  it('reads stored numbers and numeric-only formulas', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', 0);
    sheet.setCell('B1', 12);
    sheet.setCell('C1', '=7');

    expect(sheet.getCell('A1')).toBe(0);
    expect(sheet.getCell('B1')).toBe(12);
    expect(sheet.getCell('C1')).toBe(7);
  });

  it('evaluates multiple addition and subtraction operands from left to right', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=20-3+2-4');
    sheet.setCell('B1', '=8-3-2');

    expect(sheet.getCell('A1')).toBe(15);
    expect(sheet.getCell('B1')).toBe(3);
  });

  it('recalculates nested formula references after a stored value changes', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', 10);
    sheet.setCell('B1', 2);
    sheet.setCell('C1', '=A1+3-B1');
    sheet.setCell('D1', '=C1+5');

    expect(sheet.getCell('C1')).toBe(11);
    expect(sheet.getCell('D1')).toBe(16);

    sheet.setCell('A1', 20);

    expect(sheet.getCell('C1')).toBe(21);
    expect(sheet.getCell('D1')).toBe(26);
  });

  it('evaluates shared dependencies and repeated references after a formula changes', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=3+2');
    sheet.setCell('B1', '=A1+1');
    sheet.setCell('C1', '=A1-2');
    sheet.setCell('D1', '=B1+C1+A1+A1');

    expect(sheet.getCell('D1')).toBe(19);

    sheet.setCell('A1', '=5+2');

    expect(sheet.getCell('D1')).toBe(27);
  });
});
