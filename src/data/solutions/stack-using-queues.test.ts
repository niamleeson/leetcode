import { describe, expect, it } from 'vitest';
import { solutions } from './batch1-extra';

const solution = solutions.find(candidate => candidate.id === 225)!;

interface StackImplementation {
  push(value: number): void;
  pop(): number;
  top(): number;
  empty(): boolean;
}

const variants = [
  { name: 'two queues', code: solution.jsCode!, queueCount: 2 },
  { name: 'one queue follow-up', code: solution.followUp!.jsCode!, queueCount: 1 },
];

describe.each(variants)('Implement Stack Using Queues: $name', ({ code, queueCount }) => {
  const MyStack = new Function(`${code}\nreturn MyStack;`)() as new () => StackImplementation;

  it('matches the example and supports reuse after becoming empty', () => {
    const stack = new MyStack();
    expect(stack.empty()).toBe(true);
    stack.push(1);
    stack.push(2);
    expect(stack.top()).toBe(2);
    expect(stack.top()).toBe(2);
    expect(stack.pop()).toBe(2);
    expect(stack.empty()).toBe(false);
    expect(stack.pop()).toBe(1);
    expect(stack.empty()).toBe(true);
    stack.push(9);
    expect(stack.pop()).toBe(9);
    expect(stack.empty()).toBe(true);
  });

  it('preserves LIFO order using the required number of queues across interleaved operations', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      let randomState = seed;
      const random = () => {
        randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
        return randomState / 2 ** 32;
      };
      const stack = new MyStack();
      const reference: number[] = [];

      for (let step = 0; step < 100; step += 1) {
        const operation = Math.floor(random() * 4);
        if (operation === 0 || reference.length === 0) {
          const value = Math.floor(random() * 9) + 1;
          stack.push(value);
          reference.push(value);
        } else if (operation === 1) {
          expect(stack.pop()).toBe(reference.pop());
        } else if (operation === 2) {
          expect(stack.top()).toBe(reference[reference.length - 1]);
        } else {
          expect(stack.empty()).toBe(reference.length === 0);
        }

        const queues = Object.values(stack).filter(Array.isArray);
        expect(queues).toHaveLength(queueCount);
        expect(new Set(queues).size).toBe(queueCount);
        expect(queues[0]).toEqual([...reference].reverse());
        if (queueCount === 2) expect(queues[1]).toEqual([]);
      }
    }
  });
});
