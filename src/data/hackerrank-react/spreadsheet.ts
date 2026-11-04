import type { ReactChallenge } from './types';

export const spreadsheetChallenge: ReactChallenge = {
  collection: 'Practice',
  kind: 'coding',
  slug: 'spreadsheet',
  title: 'Spreadsheet',
  difficulty: 'Medium',
  topics: ['JavaScript', 'Parsing', 'Recursion'],
  sourceLabel: 'Provided solution',
  summary: 'Evaluate simple addition and subtraction formulas using separate operand and operator arrays.',
  prompt: 'Implement a Spreadsheet class with setCell(cellId, input) and getCell(cellId). Store numbers or formulas beginning with =. A formula combines numbers and cell references using + and -, such as =A1+3-B1. First collect its operands and operators into separate arrays, then evaluate them from left to right. Referenced cells can contain formulas, and later edits must be reflected on the next read.',
  assumptions: [
    'Inputs are numbers or valid formula strings without spaces. Formula operands are unsigned decimal numbers or cell references, joined by + or -.',
    'Every referenced cell exists, reference spelling is consistent, and there are no circular references. This is the simple version built in the walkthrough.',
  ],
  requirements: [
    'Store the original input for each cell in a Map.',
    'Return stored numbers directly.',
    'Collect operands and operators into separate arrays before evaluating a formula.',
    'Resolve each operand as either a number or a reference to another cell.',
    'Apply addition and subtraction from left to right, recalculating referenced formulas on every read.',
  ],
  example: {
    actions: 'Set A1 to 10, B1 to 2, C1 to =A1+3-B1, and D1 to =C1+5. Read C1 and D1, then change A1 to 20 and read both again.',
    result: 'C1 returns 11 and D1 returns 16. After changing A1, they return 21 and 26. The formulas stay stored, so each read uses the current cell values.',
  },
  steps: [
    'Store cell inputs in a Map. setCell saves the number or formula exactly as provided.',
    'In getCell, return the input immediately if it is a number. Otherwise remove the leading =.',
    'Scan the expression to build each operand. When you reach + or -, save the operand and operator in their own arrays, then start the next operand. Save the final operand after the loop.',
    'For A1+3-B1, the operands are ["A1", "3", "B1"] and the operators are ["+", "-"]. Collection finishes before calculation starts.',
    'resolveOperand tries Number(operand). If the result is a number, return it; otherwise call getCell to read the referenced cell.',
    'Use operands[0] as the initial result. Loop through operators, pairing operators[index] with operands[index + 1], then add or subtract its resolved value.',
    'A referenced formula follows the same process recursively. Reading C1 starts with 10, adds 3 to reach 13, then subtracts 2 to return 11.',
  ],
  pitfalls: [
    'Save the final operand after scanning the expression; there is no following operator to save it for you.',
    'Use operands[index + 1] in the calculation loop because operands[0] already became the initial result.',
    'Keep the raw formula in the Map so future reads can use updated values from its referenced cells.',
  ],
  integrationNotes: [
    'Run the standalone class and examples below as a JavaScript script. The examples print 11, 16, 21, and 26.',
    'Build in small steps: store numbers, add two cells, resolve numeric operands, handle multiple additions, then collect separate arrays to support subtraction.',
  ],
  complexity: 'setCell is typically O(1). A formula of n characters that references only stored numbers takes O(n) time and O(n) auxiliary space. Referenced formulas add their own evaluation work; shared formulas are recalculated, so total work can grow exponentially with dependency depth. Recursive reads retain the call stack and operand/operator arrays along the active path. Stored inputs take space proportional to their total size.',
  testCases: [
    { action: 'Store A1 as 10 and read A1.', expected: 'Return 10 directly.' },
    { action: 'Set A1 to 10 and B1 to 2, then evaluate =A1+3-B1.', expected: 'Return 11: start at 10, add 3, then subtract 2.' },
    { action: 'Evaluate =4+5 or =10-3-2.', expected: 'Return 9 and 5 respectively.' },
    { action: 'Set C1 to =A1+3-B1 and D1 to =C1+5, then change A1 from 10 to 20.', expected: 'C1 changes from 11 to 21, and D1 changes from 16 to 26 on the next read.' },
  ],
  solutionTitle: 'JavaScript solution',
  codeLanguage: 'javascript',
  code: `class Spreadsheet {
  constructor() {
    this.cells = new Map();
  }

  setCell(cellId, input) {
    this.cells.set(cellId, input);
  }

  getCell(cellId) {
    const input = this.cells.get(cellId);

    if (typeof input === "number") {
      return input;
    }

    const expression = input.slice(1);
    const { operands, operators } = this.tokenize(expression);

    let result = this.resolveOperand(operands[0]);

    for (let index = 0; index < operators.length; index++) {
      const operator = operators[index];
      const right = this.resolveOperand(operands[index + 1]);

      if (operator === "+") {
        result += right;
      } else {
        result -= right;
      }
    }

    return result;
  }

  tokenize(expression) {
    const operands = [];
    const operators = [];
    let operand = "";

    for (const character of expression) {
      if (character === "+" || character === "-") {
        operands.push(operand);
        operators.push(character);
        operand = "";
      } else {
        operand += character;
      }
    }

    operands.push(operand);

    return { operands, operators };
  }

  resolveOperand(operand) {
    const number = Number(operand);

    if (!Number.isNaN(number)) {
      return number;
    }

    return this.getCell(operand);
  }
}

// Store numbers.
const sheet = new Spreadsheet();

sheet.setCell("A1", 10);
sheet.setCell("B1", 2);

// Combine references and numbers.
sheet.setCell("C1", "=A1+3-B1");
console.log(sheet.getCell("C1")); // 11

// Reference another formula.
sheet.setCell("D1", "=C1+5");
console.log(sheet.getCell("D1")); // 16

// Changes are reflected on the next read.
sheet.setCell("A1", 20);
console.log(sheet.getCell("C1")); // 21
console.log(sheet.getCell("D1")); // 26`,
};
