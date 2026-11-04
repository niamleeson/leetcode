import type { ReactChallenge } from './types';

export const spreadsheetChallenge: ReactChallenge = {
  collection: 'Practice',
  kind: 'coding',
  slug: 'spreadsheet',
  title: 'Spreadsheet',
  difficulty: 'Hard',
  topics: ['JavaScript', 'Parsing', 'Recursion', 'Graphs', 'Cycle detection'],
  sourceLabel: 'Provided solution',
  summary: 'Store cell values and formulas, resolve references, and detect circular dependencies.',
  prompt: 'Implement a Spreadsheet class with setCell(cellId, input) and getCell(cellId). A cell contains a number or a formula beginning with =. Formulas combine numbers and cell references using +, -, *, and /. Resolve references recursively, return 0 for unset cells, and return #CYCLE! when evaluation encounters a circular reference. For this problem, evaluate every operator from left to right with equal priority.',
  assumptions: [
    'Inputs are numbers or valid formula strings starting with =. Operands are decimal numeric literals, optionally signed, or unsigned cell references such as A1. Reference spelling is case-sensitive and consistent.',
    'All four operators have equal priority: =A1+B1*3 means (A1+B1)*3. Parentheses, ranges, functions, and standard multiplication precedence are outside this version.',
    'Whitespace is ignored. Unary signs work on numeric operands such as -2; signed references such as -A1 are not supported.',
    'The supplied implementation assumes valid operands and does not fully validate formula syntax. Division follows JavaScript arithmetic, including Infinity or NaN when dividing by zero.',
  ],
  requirements: [
    'Store the original input for each cell so a later setCell changes future calculations.',
    'Return a stored number directly and treat an unset cell as 0.',
    'Tokenize a formula without regular expressions, then evaluate its operators from left to right.',
    'Resolve referenced cells recursively and propagate #CYCLE! through dependent formulas.',
    'Track only cells on the current evaluation path, removing them when their evaluation finishes.',
  ],
  example: {
    actions: 'Set A1 to 10, B1 to 2, and C1 to =A1+B1*3. Read C1, change A1 to 20 and read C1 again, then set A1 to =C1 and read C1.',
    result: 'The results are 36, then 66, then #CYCLE!. The first two calculations are (10 + 2) * 3 and (20 + 2) * 3; the last creates C1 → A1 → C1.',
  },
  steps: [
    'Keep raw cell inputs in a Map. setCell only replaces an input; getCell starts a fresh evaluation with an empty visiting Set.',
    'evaluateCell first checks for a cell already on the current path. Reaching it again means a cycle. Unset cells return 0, and numeric cells return their value.',
    'For a formula cell, add its ID to visiting, evaluate the formula, then remove the ID in finally. Cleanup runs after a normal result, a cycle result, or an exception.',
    'Strip the leading = and scan characters to build alternating operand and operator tokens. A leading + or - belongs to a numeric operand, while a later operator ends that operand.',
    'Resolve the first operand into result. Then resolve each following operand and apply its operator immediately, producing left-to-right evaluation.',
    'resolveOperand converts numeric text with Number. Otherwise it evaluates the referenced cell using the same current-path Set. A #CYCLE! result stops arithmetic and propagates upward.',
    'Recompute on every read so edits are reflected immediately. Shared dependencies may be evaluated more than once because this version does not cache results.',
  ],
  pitfalls: [
    'Do not apply ordinary arithmetic precedence here: the supplied contract intentionally makes =10+2*3 equal 36.',
    'visiting is the active recursion path, not every cell ever seen. A repeated reference such as =A1+A1 is valid after the first evaluation finishes.',
    'Keep the finally cleanup. Leaving a completed cell in visiting can turn a valid shared dependency into a false cycle.',
    'This tokenizer does not support -A1 or parenthesized expressions. Use =0-A1 when subtraction from zero matches the intended left-to-right expression.',
    'Without memoization, repeated references can duplicate substantial work. Do not claim that each reachable cell is evaluated only once.',
  ],
  integrationNotes: [
    'The solution below is the supplied standalone JavaScript class and example. Run it as a script; the example prints 36, 66, and #CYCLE!.',
    'A spreadsheet UI can call setCell after an edit and getCell when it needs a calculated value. This problem focuses on the calculation engine.',
    'If adding a per-read cache as a follow-up, keep it separate from visiting and start it fresh for each getCell call so later edits are reflected.',
  ],
  complexity: 'setCell is typically O(1) for the Map update. For getCell, count all formula text processed across every recursive evaluation, including repeated evaluations of shared cells: time grows with that expanded work and can be exponential in the number of distinct cells. This is not an O(V + E) traversal because there is no memoization. During a read, auxiliary space holds the active call stack, visiting IDs, and token arrays retained along that path. Stored inputs require space proportional to their total size.',
  testCases: [
    { action: 'Read an unset cell, then store and read a number.', expected: 'The unset cell returns 0; the stored cell returns that number.' },
    { action: 'Evaluate =10+2*3.', expected: 'Return 36 by applying the operators left to right.' },
    { action: 'Change a cell referenced by a formula.', expected: 'The next getCell recomputes the dependent result from the new input.' },
    { action: 'Evaluate =A1+A1 or two branches that share a dependency.', expected: 'Return the numeric result; repeated references alone are not cycles.' },
    { action: 'Create A1 → A1 or A1 → B1 → A1.', expected: 'Return #CYCLE! and propagate it to any formula that depends on that cycle.' },
    { action: 'Evaluate =-2*3+4 or =10/-2.', expected: 'Return -2 and -5 respectively; signs on numeric operands are supported.' },
  ],
  solutionTitle: 'JavaScript solution',
  codeLanguage: 'javascript',
  code: `const CYCLE_ERROR = "#CYCLE!";

class Spreadsheet {
  constructor() {
    this.cells = new Map();
  }

  setCell(cellId, input) {
    this.cells.set(cellId, input);
  }

  getCell(cellId) {
    return this.evaluateCell(cellId, new Set());
  }

  evaluateCell(cellId, visiting) {
    if (visiting.has(cellId)) {
      return CYCLE_ERROR;
    }

    const input = this.cells.get(cellId);

    if (input === undefined) return 0;
    if (typeof input === "number") return input;

    visiting.add(cellId);

    try {
      return this.evaluateFormula(input, visiting);
    } finally {
      visiting.delete(cellId);
    }
  }

  // No regex: build operands and separate them at operators.
  tokenize(expression) {
    const tokens = [];
    let operand = "";

    for (const character of expression) {
      if (character.trim() === "") continue;

      const isOperator = ["+", "-", "*", "/"].includes(character);
      const isSign =
        (character === "+" || character === "-") && operand === "";

      if (isOperator && !isSign) {
        if (operand === "") throw new Error("Invalid formula");

        tokens.push(operand, character);
        operand = "";
      } else {
        operand += character;
      }
    }

    if (operand === "") throw new Error("Invalid formula");

    tokens.push(operand);
    return tokens;
  }

  evaluateFormula(formula, visiting) {
    const tokens = this.tokenize(formula.slice(1));

    let result = this.resolveOperand(tokens[0], visiting);

    if (result === CYCLE_ERROR) return result;

    // Evaluate left to right, matching the original solution.
    for (let index = 1; index < tokens.length; index += 2) {
      const operator = tokens[index];
      const right = this.resolveOperand(tokens[index + 1], visiting);

      if (right === CYCLE_ERROR) return right;

      result = this.applyOperator(result, operator, right);
    }

    return result;
  }

  resolveOperand(operand, visiting) {
    const number = Number(operand);

    // Assume each operand is a number or a valid cell reference.
    return Number.isNaN(number)
      ? this.evaluateCell(operand, visiting)
      : number;
  }

  applyOperator(left, operator, right) {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      default:
        throw new Error(\`Unknown operator: \${operator}\`);
    }
  }
}

// Example:
const sheet = new Spreadsheet();

sheet.setCell("A1", 10);
sheet.setCell("B1", 2);
sheet.setCell("C1", "=A1+B1*3");

console.log(sheet.getCell("C1")); // 36: (10 + 2) * 3

sheet.setCell("A1", 20);
console.log(sheet.getCell("C1")); // 66: (20 + 2) * 3

sheet.setCell("A1", "=C1");
console.log(sheet.getCell("C1")); // "#CYCLE!"`,
};
