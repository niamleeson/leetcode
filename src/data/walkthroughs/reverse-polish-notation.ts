export interface StackValue {
  id: string;
  value: number;
}

type Operator = '+' | '-' | '*' | '/';

export interface RpnStep {
  tokenIndex: number | null;
  action: 'start' | 'push' | 'pop-right' | 'pop-left' | 'result' | 'return';
  stack: StackValue[];
  changedId?: string;
  operator?: Operator;
  left?: StackValue;
  right?: StackValue;
  result?: StackValue;
  title: string;
  detail: string;
}

export const rpnExamples = [
  { name: 'Add, then multiply', tokens: ['2', '1', '+', '3', '*'] },
  { name: 'Division', tokens: ['4', '13', '5', '/', '+'] },
  { name: 'Negative numbers', tokens: ['7', '-3', '/', '2', '-'] },
];

export function buildRpnSteps(tokens: string[]): RpnStep[] {
  const stack: StackValue[] = [];
  const steps: RpnStep[] = [{
    tokenIndex: null,
    action: 'start',
    stack: [],
    title: 'Start with an empty stack',
    detail: 'Read the tokens from left to right.',
  }];

  tokens.forEach((token, tokenIndex) => {
    if (!['+', '-', '*', '/'].includes(token)) {
      const entry = { id: `token-${tokenIndex}`, value: Number(token) };
      stack.push(entry);
      steps.push({
        tokenIndex,
        action: 'push',
        stack: [...stack],
        changedId: entry.id,
        title: `Push ${entry.value}`,
        detail: 'A number goes on top of the stack.',
      });
      return;
    }

    const operator = token as Operator;
    const right = stack.pop()!;
    steps.push({
      tokenIndex,
      action: 'pop-right',
      stack: [...stack],
      operator,
      right,
      changedId: right.id,
      title: `Pop ${right.value} into the right operand`,
      detail: 'The first value out goes on the right.',
    });

    const left = stack.pop()!;
    steps.push({
      tokenIndex,
      action: 'pop-left',
      stack: [...stack],
      operator,
      right,
      left,
      changedId: left.id,
      title: `Pop ${left.value} into the left operand`,
      detail: 'The second value out goes on the left.',
    });

    let value: number;
    switch (operator) {
      case '+': value = left.value + right.value; break;
      case '-': value = left.value - right.value; break;
      case '*': value = left.value * right.value; break;
      case '/': value = Math.trunc(left.value / right.value); break;
    }

    const result = { id: `token-${tokenIndex}`, value };
    stack.push(result);
    steps.push({
      tokenIndex,
      action: 'result',
      stack: [...stack],
      operator,
      right,
      left,
      result,
      changedId: result.id,
      title: `Push the result: ${value}`,
      detail: operator === '/' && left.value % right.value !== 0
        ? 'Division drops the decimal part, toward zero.'
        : 'Replace the two operands with their result.',
    });
  });

  steps.push({
    tokenIndex: null,
    action: 'return',
    stack: [...stack],
    result: stack[0],
    changedId: stack[0].id,
    title: `Return ${stack[0].value}`,
    detail: 'All tokens are read. The remaining value is the answer.',
  });
  return steps;
}
