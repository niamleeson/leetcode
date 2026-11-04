import { describe, expect, it } from 'vitest';
import { spreadsheetChallenge } from './spreadsheet';

interface SpreadsheetInstance {
  setCell(cellId: string, input: number | string): void;
  getCell(cellId: string): number | '#CYCLE!';
  evaluateCell(cellId: string, visiting: Set<string>): number | '#CYCLE!';
}

// Execute the exact displayed solution, including its example, without logging
// the example's output during the test run.
const Spreadsheet = new Function(
  'console',
  spreadsheetChallenge.code + '\nreturn Spreadsheet;',
)({ log: () => {} }) as new () => SpreadsheetInstance;

describe('Spreadsheet solution', () => {
  it('recalculates the supplied example using left-to-right evaluation', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', 10);
    sheet.setCell('B1', 2);
    sheet.setCell('C1', '=A1+B1*3');
    expect(sheet.getCell('C1')).toBe(36);

    sheet.setCell('A1', 20);
    expect(sheet.getCell('C1')).toBe(66);

    sheet.setCell('A1', '=C1');
    expect(sheet.getCell('C1')).toBe('#CYCLE!');
  });

  it('handles missing cells, stored numbers, signed numeric operands, and all four operators', () => {
    const sheet = new Spreadsheet();
    expect(sheet.getCell('Z99')).toBe(0);
    sheet.setCell('A1', -2.5);
    expect(sheet.getCell('A1')).toBe(-2.5);

    sheet.setCell('B1', '=Z99+5');
    expect(sheet.getCell('B1')).toBe(5);

    sheet.setCell('C1', '=8/2+3*4-5');
    expect(sheet.getCell('C1')).toBe(23);

    sheet.setCell('D1', '= -2.5 + +3 * -4 / 2 ');
    expect(sheet.getCell('D1')).toBe(-1);
    sheet.setCell('E1', '=A1--2');
    expect(sheet.getCell('E1')).toBe(-0.5);
  });

  it('propagates direct and indirect cycles and recovers after a dependency is corrected', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=A1');
    expect(sheet.getCell('A1')).toBe('#CYCLE!');

    sheet.setCell('A1', '=B1');
    sheet.setCell('B1', '=C1');
    sheet.setCell('C1', '=A1');
    sheet.setCell('D1', '=10+A1');
    expect(sheet.getCell('D1')).toBe('#CYCLE!');

    sheet.setCell('C1', 2);
    expect(sheet.getCell('D1')).toBe(12);
  });

  it('allows shared dependencies and repeated references without reporting a false cycle', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=3');
    sheet.setCell('B1', '=A1+1');
    sheet.setCell('C1', '=A1*2');
    sheet.setCell('D1', '=B1+C1+A1+A1');
    expect(sheet.getCell('D1')).toBe(16);
    expect(sheet.getCell('D1')).toBe(16);

    sheet.setCell('A1', '=5');
    expect(sheet.getCell('D1')).toBe(26);
  });

  it('cleans up the active evaluation path when a nested formula throws', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=5+');
    sheet.setCell('B1', '=A1+1');
    const visiting = new Set(['ROOT']);

    expect(() => sheet.evaluateCell('B1', visiting)).toThrow('Invalid formula');
    expect([...visiting]).toEqual(['ROOT']);

    sheet.setCell('A1', 4);
    expect(sheet.evaluateCell('B1', visiting)).toBe(5);
    expect([...visiting]).toEqual(['ROOT']);
  });

  it('uses JavaScript number results for division by zero', () => {
    const sheet = new Spreadsheet();
    sheet.setCell('A1', '=1/0');
    sheet.setCell('B1', '=0/0');
    expect(sheet.getCell('A1')).toBe(Infinity);
    expect(sheet.getCell('B1')).toBeNaN();
  });
});
