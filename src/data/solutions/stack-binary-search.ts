import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ============================================================
  // STACK
  // ============================================================

  // 20. Valid Parentheses
  {
    id: 20,
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    examples: `Input: s = "([{}])"
Output: true

Input: s = "(]"
Output: false`,
    intuition:
      "Think of a stack like a pile of plates: you can only check the top plate. Each time you see an opening bracket, you place it on top. When you see a closing bracket, the most recent unmatched opening bracket (top of the stack) must be its match. If it is not, or there is nothing on the stack, the string is invalid.",
    approach:
      "Use a stack to track open brackets. When encountering a closing bracket, check if the top of the stack is the matching open bracket. If the stack is empty at the end, the string is valid.",
    code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}

        for char in s:
            if char in mapping:
                if not stack or stack[-1] != mapping[char]:
                    return False
                stack.pop()
            else:
                stack.append(char)

        return len(stack) == 0`,
    jsCode: `var isValid = function(s) {
    const stack = [];
    const mapping = {')': '(', '}': '{', ']': '['};

    for (const char of s) {
        if (char in mapping) {
            if (!stack.length || stack[stack.length - 1] !== mapping[char]) {
                return false;
            }
            stack.pop();
        } else {
            stack.push(char);
        }
    }

    return stack.length === 0;
};`,
    explanation: `- Create a mapping from each closing bracket to its corresponding opening bracket.
- Iterate through each character in the string.
- If the character is a closing bracket, check if the stack is non-empty and the top matches the expected opening bracket. If not, return False; otherwise pop the top.
- If the character is an opening bracket, push it onto the stack.
- At the end, return True only if the stack is empty (all brackets were matched).`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "Think about what data structure lets you match the most recent unmatched opening bracket with the current closing bracket.",
      "Use a hash map to quickly look up which opening bracket corresponds to each closing bracket.",
      "After processing all characters, a valid string will leave the stack completely empty.",
    ],
  },

  // 22. Generate Parentheses
  {
    id: 22,
    description:
      "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses. Each combination must have exactly n opening and n closing parentheses arranged so that every prefix has at least as many opening as closing parentheses.",
    examples: `Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]`,
    intuition:
      "At every position, you have a choice: add '(' or ')'. But you can only add ')' if there are more open parens than close parens so far (otherwise you would create an invalid prefix). This constraint naturally prunes all invalid combinations, so backtracking with these two simple rules generates only valid strings.",
    approach:
      "Use backtracking to build strings character by character. At each step, you can add '(' if you haven't used all n, or ')' if the count of ')' is less than the count of '('. This ensures every generated string is valid.",
    code: `class Solution:
    def generateParenthesis(self, n: int) -> list[str]:
        result = []

        def backtrack(current: str, open_count: int, close_count: int):
            if len(current) == 2 * n:
                result.append(current)
                return
            if open_count < n:
                backtrack(current + '(', open_count + 1, close_count)
            if close_count < open_count:
                backtrack(current + ')', open_count, close_count + 1)

        backtrack('', 0, 0)
        return result`,
    jsCode: `var generateParenthesis = function(n) {
    const result = [];

    const backtrack = (current, openCount, closeCount) => {
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }
        if (openCount < n) {
            backtrack(current + '(', openCount + 1, closeCount);
        }
        if (closeCount < openCount) {
            backtrack(current + ')', openCount, closeCount + 1);
        }
    };

    backtrack('', 0, 0);
    return result;
};`,
    explanation: `- Start with an empty string and counts of 0 for both open and close parentheses.
- Base case: when the string length reaches 2*n, it is a complete valid combination; add it to results.
- Recursive case 1: if open_count < n, we can still add an opening parenthesis.
- Recursive case 2: if close_count < open_count, we can add a closing parenthesis (this ensures validity).
- The two conditions naturally prune invalid combinations, so every generated string is well-formed.`,
    timeComplexity: "O(4^n / sqrt(n)) — the nth Catalan number",
    spaceComplexity: "O(n) for recursion depth",
    hints: [
      "At any point during construction, you can only add ')' if there are more '(' than ')' so far.",
      "Use backtracking with two counters: one for open parentheses used and one for close parentheses used.",
      "The base case is when the string length equals 2 * n.",
    ],
  },

  // 84. Largest Rectangle in Histogram
  {
    id: 84,
    description:
      "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram. The rectangle must be formed by contiguous bars.",
    examples: `Input: heights = [2,1,5,6,2,3]
Output: 10
Explanation: The largest rectangle has area = 5 * 2 = 10 (bars at indices 2 and 3 with height 5).`,
    intuition:
      "Each bar can extend left and right until it hits a shorter bar. The key insight is that a monotonic increasing stack lets you efficiently find these boundaries. When you encounter a shorter bar, all taller bars on the stack have just found their right boundary, so you can calculate their maximum rectangle area immediately.",
    approach:
      "Use a monotonic increasing stack that stores indices. When a bar shorter than the stack top is encountered, pop and calculate the area using the popped bar's height. The width extends from the current index back to the new stack top. This processes each bar at most twice (push and pop), giving O(n) time.",
    code: `class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        stack = []  # stack of indices
        max_area = 0
        n = len(heights)

        for i in range(n + 1):
            h = heights[i] if i < n else 0
            while stack and heights[stack[-1]] > h:
                height = heights[stack.pop()]
                width = i if not stack else i - stack[-1] - 1
                max_area = max(max_area, height * width)
            stack.append(i)

        return max_area`,
    jsCode: `var largestRectangleArea = function(heights) {
    const stack = [];
    let maxArea = 0;
    const n = heights.length;

    for (let i = 0; i <= n; i++) {
        const h = i < n ? heights[i] : 0;
        while (stack.length && heights[stack[stack.length - 1]] > h) {
            const height = heights[stack.pop()];
            const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }

    return maxArea;
};`,
    explanation: `- Iterate through all bars plus one extra (height 0) to flush remaining bars from the stack.
- Maintain a stack of indices in increasing order of heights.
- When the current bar is shorter than the bar at stack top, pop the top index.
- The popped bar's height is the rectangle height. The width extends from the current index i back to the element just after the new stack top (or from 0 if stack is empty).
- Compute area = height * width and update max_area.
- Push the current index onto the stack and continue.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "A brute-force approach checks every pair of bars, but you can do better with a stack.",
      "Use a monotonic increasing stack of indices. When you see a shorter bar, the bar at the top of the stack can no longer extend right, so calculate its area.",
      "Append a sentinel bar of height 0 at the end to ensure all bars are popped and processed.",
    ],
  },

  // 150. Evaluate Reverse Polish Notation
  {
    id: 150,
    description:
      "You are given an array of strings tokens that represents an arithmetic expression in Reverse Polish Notation (postfix notation). Evaluate the expression and return an integer that represents the value. Valid operators are +, -, *, and /. Division truncates toward zero.",
    examples: `Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9`,
    intuition:
      "Reverse Polish Notation eliminates the need for parentheses by placing operators after their operands. A stack is the perfect match because when you see an operator, the two most recent numbers on the stack are exactly its operands. Process the operation, push the result back, and continue -- the stack naturally handles nested expressions.",
    approach:
      "Use a stack. Push numbers onto the stack. When an operator is encountered, pop two operands, apply the operator, and push the result back. The final value on the stack is the answer.",
    code: `class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        stack = []

        for token in tokens:
            if token in '+-*/' and len(token) == 1:
                b = stack.pop()
                a = stack.pop()
                if token == '+':
                    stack.append(a + b)
                elif token == '-':
                    stack.append(a - b)
                elif token == '*':
                    stack.append(a * b)
                elif token == '/':
                    stack.append(int(a / b))  # truncate toward zero
            else:
                stack.append(int(token))

        return stack[0]`,
    jsCode: `var evalRPN = function(tokens) {
    const stack = [];

    for (const token of tokens) {
        if (['+', '-', '*', '/'].includes(token)) {
            const b = stack.pop();
            const a = stack.pop();
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else if (token === '/') stack.push(Math.trunc(a / b));
        } else {
            stack.push(parseInt(token));
        }
    }

    return stack[0];
};`,
    explanation: `- Iterate through each token in the input array.
- If the token is a number (including negative numbers), convert it to int and push onto the stack.
- If the token is an operator, pop two values: b (top) and a (second from top).
- Apply the operator as a op b. For division, use int(a / b) to truncate toward zero (Python's // rounds toward negative infinity, so we use int() on true division instead).
- Push the result back onto the stack.
- After processing all tokens, the stack contains exactly one element: the answer.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "RPN means operands come before their operator. A stack naturally handles this: push numbers, and when you see an operator, pop the two most recent numbers.",
      "Be careful with the order of operands when popping for subtraction and division: the first popped value is the right operand.",
      "For division truncating toward zero, use int(a / b) rather than a // b in Python.",
    ],
  },

  // 155. Min Stack
  {
    id: 155,
    description:
      "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class with push(val), pop(), top(), and getMin() methods. All operations must run in O(1) time.",
    examples: `Input: ["MinStack","push","push","push","getMin","pop","top","getMin"]
       [[],[-2],[0],[-3],[],[],[],[]]
Output: [null,null,null,null,-3,null,0,-2]`,
    intuition:
      "The trick is that the minimum can change when you pop elements. If you only store a single min variable, you lose track of what the min was before that element was pushed. By keeping a parallel stack that records the running minimum at each level, popping automatically restores the previous minimum -- like saving snapshots of the min at each step.",
    approach:
      "Use two stacks: one for the actual values and one to track the current minimum. On each push, also push the current minimum onto the min stack. On each pop, pop from both stacks. getMin simply returns the top of the min stack.",
    code: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        min_val = min(val, self.min_stack[-1] if self.min_stack else val)
        self.min_stack.append(min_val)

    def pop(self) -> None:
        self.stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]`,
    jsCode: `var MinStack = function() {
    this.stack = [];
    this.minStack = [];
};

MinStack.prototype.push = function(val) {
    this.stack.push(val);
    const minVal = this.minStack.length === 0 ? val : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(minVal);
};

MinStack.prototype.pop = function() {
    this.stack.pop();
    this.minStack.pop();
};

MinStack.prototype.top = function() {
    return this.stack[this.stack.length - 1];
};

MinStack.prototype.getMin = function() {
    return this.minStack[this.minStack.length - 1];
};`,
    explanation: `- Maintain two stacks: stack for values and min_stack where each entry is the minimum value at that level.
- push: Append the value to stack. For min_stack, append the smaller of the new value and the current minimum (top of min_stack).
- pop: Pop from both stacks. This keeps them in sync.
- top: Return the top of the main stack.
- getMin: Return the top of min_stack, which always holds the current minimum.
- Every operation is O(1) since we only access the top of each stack.`,
    timeComplexity: "O(1) for all operations",
    spaceComplexity: "O(n)",
    hints: [
      "The challenge is making getMin() O(1). A single variable for the min won't work because popping might reveal a new minimum.",
      "Use a second stack that mirrors the main stack but stores the running minimum at each level.",
      "When pushing, the new minimum is min(new_value, current_minimum).",
    ],
  },

  // 394. Decode String
  {
    id: 394,
    description:
      "Given an encoded string, return its decoded string. The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. You may assume the input is always valid and there are no extra white spaces. Nesting is allowed, e.g., 3[a2[c]] decodes to accaccacc.",
    examples: `Input: s = "3[a2[c]]"
Output: "accaccacc"
Explanation: 2[c] -> "cc", a + "cc" -> "acc", 3["acc"] -> "accaccacc"`,
    intuition:
      "Think of each '[' as entering a new nested context and ']' as leaving it. You need to remember what you were building before you entered the bracket, which is exactly what a stack does. When you hit '[', save your current progress and start fresh. When you hit ']', restore the saved progress and append the repeated inner result.",
    approach:
      "Use two stacks: one for repeat counts and one for the string built so far before each '['. When encountering ']', pop both stacks and construct the repeated string. Build the current string as you go.",
    code: `class Solution:
    def decodeString(self, s: str) -> str:
        count_stack = []
        string_stack = []
        current_string = ''
        current_num = 0

        for char in s:
            if char.isdigit():
                current_num = current_num * 10 + int(char)
            elif char == '[':
                count_stack.append(current_num)
                string_stack.append(current_string)
                current_num = 0
                current_string = ''
            elif char == ']':
                num = count_stack.pop()
                prev_string = string_stack.pop()
                current_string = prev_string + current_string * num
            else:
                current_string += char

        return current_string`,
    jsCode: `var decodeString = function(s) {
    const countStack = [];
    const stringStack = [];
    let currentString = '';
    let currentNum = 0;

    for (const char of s) {
        if (char >= '0' && char <= '9') {
            currentNum = currentNum * 10 + parseInt(char);
        } else if (char === '[') {
            countStack.push(currentNum);
            stringStack.push(currentString);
            currentNum = 0;
            currentString = '';
        } else if (char === ']') {
            const num = countStack.pop();
            const prevString = stringStack.pop();
            currentString = prevString + currentString.repeat(num);
        } else {
            currentString += char;
        }
    }

    return currentString;
};`,
    explanation: `- Maintain current_string (string being built) and current_num (number being parsed).
- Digit: Build up the multi-digit number (current_num = current_num * 10 + digit).
- '[': Save the current context (push current_num and current_string onto their stacks), then reset both for the inner expression.
- ']': Pop the repeat count and the previous string. The decoded inner string is prev_string + current_string * count.
- Letter: Simply append to current_string.
- After the loop, current_string holds the fully decoded result.`,
    timeComplexity: "O(n * max_k) where n is the length of the decoded output",
    spaceComplexity: "O(n) for stack depth in nested cases",
    hints: [
      "Think about what happens when you encounter '[': you need to save your current progress and start fresh for the inner expression.",
      "Use two stacks: one to save the repeat count and one to save the string built before the current bracket.",
      "When you hit ']', combine the saved string with the repeated current string.",
    ],
  },

  // 739. Daily Temperatures
  {
    id: 739,
    description:
      "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day with a warmer temperature, answer[i] is 0.",
    examples: `Input: temperatures = [73,74,75,71,69,72,76,73]
Output: [1,1,4,2,1,1,0,0]`,
    intuition:
      "Imagine standing in a line and looking forward for someone taller. You only care about the first taller person, not everyone in between. A monotonic decreasing stack keeps track of days still 'waiting' for a warmer day. When a warmer day arrives, it resolves all the cooler days stacked up behind it in one sweep.",
    approach:
      "Use a monotonic decreasing stack of indices. For each new temperature, pop all stack entries with a lower temperature and record the day difference. This ensures each element is pushed and popped at most once.",
    code: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        answer = [0] * n
        stack = []  # stack of indices

        for i in range(n):
            while stack and temperatures[i] > temperatures[stack[-1]]:
                prev_index = stack.pop()
                answer[prev_index] = i - prev_index
            stack.append(i)

        return answer`,
    jsCode: `var dailyTemperatures = function(temperatures) {
    const n = temperatures.length;
    const answer = new Array(n).fill(0);
    const stack = [];

    for (let i = 0; i < n; i++) {
        while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const prevIndex = stack.pop();
            answer[prevIndex] = i - prevIndex;
        }
        stack.push(i);
    }

    return answer;
};`,
    explanation: `- Initialize an answer array of zeros (default for days with no warmer future day).
- Use a stack that stores indices of days whose "next warmer day" hasn't been found yet.
- For each day i, while the stack is non-empty and today's temperature is warmer than the temperature at the index on top of the stack, pop the index and set answer[popped] = i - popped.
- Push the current index onto the stack.
- Indices remaining on the stack after the loop have no warmer future day (already 0 in the answer).`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "Brute force would check every future day for each day, giving O(n^2). A stack can do it in one pass.",
      "Maintain a stack of indices with decreasing temperatures. When you find a warmer day, it resolves all cooler days on the stack.",
      "The answer for each index is the difference between the current index and the popped index.",
    ],
  },

  // 853. Car Fleet
  {
    id: 853,
    description:
      "There are n cars going to the same destination along a one-lane road. You are given two integer arrays position and speed where position[i] is the position of the ith car and speed[i] is the speed. A car can never pass another car ahead of it but can catch up and form a fleet. Return the number of car fleets that will arrive at the destination.",
    examples: `Input: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]
Output: 3
Explanation: Cars starting at 10 and 8 form a fleet (both arrive at time 1). Car at 0 alone. Cars at 5 and 3 form a fleet.`,
    intuition:
      "The key insight is that a slower car closer to the target acts as a bottleneck -- faster cars behind it will catch up and be forced to match its speed. By processing cars from closest to farthest from the target, each car either forms a new fleet (takes longer than the car ahead) or gets absorbed into an existing fleet. The arrival time tells you everything.",
    approach:
      "Sort cars by position in descending order (closest to target first). Calculate the time each car would take to reach the target. Use a stack: if a car takes longer than the car ahead, it forms a new fleet. Otherwise, it merges into the fleet ahead.",
    code: `class Solution:
    def carFleet(self, target: int, position: list[int], speed: list[int]) -> int:
        cars = sorted(zip(position, speed), reverse=True)
        stack = []

        for pos, spd in cars:
            time = (target - pos) / spd
            if not stack or time > stack[-1]:
                stack.append(time)

        return len(stack)`,
    jsCode: `var carFleet = function(target, position, speed) {
    const cars = position
        .map((pos, i) => [pos, speed[i]])
        .sort((a, b) => b[0] - a[0]);
    const stack = [];

    for (const [pos, spd] of cars) {
        const time = (target - pos) / spd;
        if (!stack.length || time > stack[stack.length - 1]) {
            stack.push(time);
        }
    }

    return stack.length;
};`,
    explanation: `- Pair each car's position with its speed and sort by position descending (process cars closest to target first).
- For each car, compute the time to reach the target: (target - position) / speed.
- If the stack is empty or this car's time is greater than the top of the stack, it cannot catch the fleet ahead, so it starts a new fleet (push its time).
- If this car's time is less than or equal to the top, it merges into the fleet ahead (do nothing).
- The number of elements in the stack is the number of fleets.`,
    timeComplexity: "O(n log n) due to sorting",
    spaceComplexity: "O(n)",
    hints: [
      "A slower car closer to the target will block faster cars behind it, forming a fleet.",
      "Sort by position (descending) and compute arrival times. A car forms a new fleet only if it arrives later than the car ahead.",
      "The stack only needs to track the arrival time of each fleet leader.",
    ],
  },

  // 232. Implement Queue using Stacks
  {
    id: 232,
    description:
      "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support push, peek, pop, and empty operations. You must use only standard stack operations (push to top, peek/pop from top, size, and is empty).",
    examples: `Input: ["MyQueue","push","push","peek","pop","empty"]
       [[],[1],[2],[],[],[]]
Output: [null,null,null,1,1,false]`,
    intuition:
      "A stack reverses order (LIFO), but a queue needs original order (FIFO). The clever trick is that reversing twice gives you back the original order. Push elements into one stack, and when you need to dequeue, pour them all into a second stack -- this double reversal produces FIFO order. You only need to pour when the output stack is empty, making it amortized O(1).",
    approach:
      "Use two stacks: an input stack and an output stack. Push always goes to the input stack. For pop/peek, if the output stack is empty, transfer all elements from input to output (reversing order). This gives amortized O(1) per operation.",
    code: `class MyQueue:
    def __init__(self):
        self.input_stack = []
        self.output_stack = []

    def push(self, x: int) -> None:
        self.input_stack.append(x)

    def pop(self) -> int:
        self._transfer()
        return self.output_stack.pop()

    def peek(self) -> int:
        self._transfer()
        return self.output_stack[-1]

    def empty(self) -> bool:
        return not self.input_stack and not self.output_stack

    def _transfer(self) -> None:
        if not self.output_stack:
            while self.input_stack:
                self.output_stack.append(self.input_stack.pop())`,
    jsCode: `var MyQueue = function() {
    this.inputStack = [];
    this.outputStack = [];
};

MyQueue.prototype.push = function(x) {
    this.inputStack.push(x);
};

MyQueue.prototype.pop = function() {
    this._transfer();
    return this.outputStack.pop();
};

MyQueue.prototype.peek = function() {
    this._transfer();
    return this.outputStack[this.outputStack.length - 1];
};

MyQueue.prototype.empty = function() {
    return this.inputStack.length === 0 && this.outputStack.length === 0;
};

MyQueue.prototype._transfer = function() {
    if (this.outputStack.length === 0) {
        while (this.inputStack.length) {
            this.outputStack.push(this.inputStack.pop());
        }
    }
};`,
    explanation: `- input_stack holds newly pushed elements; output_stack holds elements in FIFO order.
- push: Always append to input_stack — O(1).
- pop/peek: If output_stack is empty, transfer all elements from input_stack to output_stack. This reversal puts the oldest element on top. Then pop or peek from output_stack.
- empty: The queue is empty when both stacks are empty.
- Each element is moved at most once from input to output, giving amortized O(1) per operation.`,
    timeComplexity: "O(1) amortized per operation",
    spaceComplexity: "O(n)",
    hints: [
      "A stack is LIFO, but a queue is FIFO. Reversing a stack gives you FIFO order.",
      "Use two stacks: one for input and one for output. Transfer from input to output only when the output stack is empty.",
      "Each element is transferred at most once, so all operations are amortized O(1).",
    ],
  },

  // 496. Next Greater Element I
  {
    id: 496,
    description:
      "The next greater element of some element x in an array is the first greater element that is to the right of x in the same array. You are given two distinct 0-indexed integer arrays nums1 and nums2 where nums1 is a subset of nums2. For each element in nums1, find the next greater element in nums2. Return -1 if it does not exist.",
    examples: `Input: nums1 = [4,1,2], nums2 = [1,3,4,2]
Output: [-1,3,-1]
Explanation: For 4, no greater element to the right in nums2. For 1, next greater is 3. For 2, no greater element.`,
    intuition:
      "Instead of searching for the next greater element of each nums1 value separately, precompute the answer for every element in nums2 at once using a monotonic stack. When you find a larger element, it is the 'next greater' for all smaller elements sitting on the stack. Store the results in a hash map for O(1) lookup per nums1 element.",
    approach:
      "Precompute the next greater element for every element in nums2 using a monotonic decreasing stack. Store results in a hash map. Then look up each element of nums1 in the map.",
    code: `class Solution:
    def nextGreaterElement(self, nums1: list[int], nums2: list[int]) -> list[int]:
        next_greater = {}
        stack = []

        for num in nums2:
            while stack and stack[-1] < num:
                next_greater[stack.pop()] = num
            stack.append(num)

        return [next_greater.get(num, -1) for num in nums1]`,
    jsCode: `var nextGreaterElement = function(nums1, nums2) {
    const nextGreater = new Map();
    const stack = [];

    for (const num of nums2) {
        while (stack.length && stack[stack.length - 1] < num) {
            nextGreater.set(stack.pop(), num);
        }
        stack.push(num);
    }

    return nums1.map(num => nextGreater.get(num) ?? -1);
};`,
    explanation: `- Use a monotonic decreasing stack to process nums2 from left to right.
- For each element in nums2, while the stack is non-empty and the top is smaller than the current element, pop and record current element as the next greater for the popped value.
- Push the current element onto the stack.
- Elements remaining on the stack have no next greater element (default to -1).
- For each element in nums1, look up its next greater element in the hash map.`,
    timeComplexity: "O(n + m) where n = len(nums2), m = len(nums1)",
    spaceComplexity: "O(n)",
    hints: [
      "First solve: for each element in nums2, what is its next greater element?",
      "Use a monotonic decreasing stack on nums2. When you find a larger element, it is the next greater for everything smaller on the stack.",
      "Store the mapping in a dictionary and look up each element in nums1.",
    ],
  },

  // 503. Next Greater Element II
  {
    id: 503,
    description:
      "Given a circular integer array nums (the next element of nums[nums.length - 1] is nums[0]), return the next greater number for every element. The next greater number of a number x is the first greater number in its traversal order in the circular array. If it doesn't exist, return -1.",
    examples: `Input: nums = [1,2,1]
Output: [2,-1,2]
Explanation: For nums[0]=1, next greater is 2. For nums[1]=2, no greater exists. For nums[2]=1, circularly the next greater is 2.`,
    intuition:
      "The circular part is the only twist over the standard 'next greater element' problem. By looping through the array twice (using modulo for indices), elements near the end of the array get a chance to find their next greater element at the beginning. It is like walking around a circular track twice to make sure everyone has looked ahead far enough.",
    approach:
      "Simulate the circular array by iterating through the array twice (2 * n iterations). Use a monotonic decreasing stack of indices. The modulo operator handles the circular indexing. On the first pass, most elements get their answer; the second pass handles wraparound cases.",
    code: `class Solution:
    def nextGreaterElements(self, nums: list[int]) -> list[int]:
        n = len(nums)
        result = [-1] * n
        stack = []

        for i in range(2 * n):
            while stack and nums[stack[-1]] < nums[i % n]:
                result[stack.pop()] = nums[i % n]
            if i < n:
                stack.append(i)

        return result`,
    jsCode: `var nextGreaterElements = function(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stack = [];

    for (let i = 0; i < 2 * n; i++) {
        while (stack.length && nums[stack[stack.length - 1]] < nums[i % n]) {
            result[stack.pop()] = nums[i % n];
        }
        if (i < n) {
            stack.push(i);
        }
    }

    return result;
};`,
    explanation: `- Initialize result array with -1 (default for no next greater element).
- Iterate 2 * n times to simulate the circular traversal.
- Use i % n to get the actual index in the array.
- While the stack is non-empty and the current element is greater than the element at the stack top index, pop and set that index's result.
- Only push indices during the first pass (i < n) to avoid duplicates.
- The second pass allows elements near the end to find their next greater element at the start of the array.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "This is like Next Greater Element I, but the array is circular. How can you handle wrapping around?",
      "Iterate through the array twice (indices 0 to 2n-1) using modulo to simulate circular access.",
      "Only push indices during the first pass to avoid processing duplicates, but continue comparing during the second pass.",
    ],
  },

  // 735. Asteroid Collision
  {
    id: 735,
    description:
      "We are given an array asteroids of integers representing asteroids in a row. The absolute value represents size, and the sign represents direction (positive = right, negative = left). Asteroids moving the same direction never meet. When two asteroids meet, the smaller one explodes. If both are the same size, both explode. Find the state of the asteroids after all collisions.",
    examples: `Input: asteroids = [5,10,-5]
Output: [5,10]
Explanation: 10 and -5 collide, 10 survives. 5 and 10 never collide (same direction).`,
    intuition:
      "Collisions only happen when a right-moving asteroid (positive, already on the stack) meets a left-moving one (negative, incoming). Think of the stack as a row of asteroids moving right. Each new left-moving asteroid fights its way through the stack from the top, destroying smaller right-moving asteroids until it either gets destroyed itself or survives to be pushed onto the stack.",
    approach:
      "Use a stack. For each asteroid, if it's moving right (positive), push it. If it's moving left (negative), it can only collide with right-moving asteroids on the stack. Pop and compare until the left-moving asteroid is destroyed or survives.",
    code: `class Solution:
    def asteroidCollision(self, asteroids: list[int]) -> list[int]:
        stack = []

        for asteroid in asteroids:
            alive = True
            while alive and asteroid < 0 and stack and stack[-1] > 0:
                if stack[-1] < -asteroid:
                    stack.pop()
                elif stack[-1] == -asteroid:
                    stack.pop()
                    alive = False
                else:
                    alive = False
            if alive:
                stack.append(asteroid)

        return stack`,
    jsCode: `var asteroidCollision = function(asteroids) {
    const stack = [];

    for (const asteroid of asteroids) {
        let alive = true;
        while (alive && asteroid < 0 && stack.length && stack[stack.length - 1] > 0) {
            if (stack[stack.length - 1] < -asteroid) {
                stack.pop();
            } else if (stack[stack.length - 1] === -asteroid) {
                stack.pop();
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) {
            stack.push(asteroid);
        }
    }

    return stack;
};`,
    explanation: `- Process each asteroid one by one using a stack.
- If the current asteroid is positive (moving right), push it — no collision with anything on the stack.
- If the current asteroid is negative (moving left) and the stack top is positive (moving right), a collision occurs.
- Compare sizes: if the stack top is smaller, it is destroyed (pop), and continue checking. If equal, both are destroyed (pop and mark current as dead). If the stack top is larger, the current asteroid is destroyed.
- If the current asteroid survives all collisions, push it onto the stack.
- The stack at the end represents the surviving asteroids.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "Collisions only happen when a right-moving asteroid (positive) meets a left-moving one (negative).",
      "Use a stack. A left-moving asteroid may destroy multiple right-moving ones before being destroyed itself.",
      "Track whether the current asteroid is still 'alive' during the inner loop of collisions.",
    ],
  },

  // 32. Longest Valid Parentheses
  {
    id: 32,
    description:
      "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring. A valid parentheses substring is one where every '(' has a matching ')' and they are properly nested.",
    examples: `Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()" with length 4.`,
    intuition:
      "The stack stores indices of unmatched characters, acting as boundary markers. The distance between the current index and the nearest unmatched index on the stack gives the length of the current valid substring. Initializing with -1 handles the edge case where the valid substring starts at the very beginning of the string.",
    approach:
      "Use a stack initialized with -1 as a base index. Push indices of '(' onto the stack. When encountering ')', pop the top. If the stack becomes empty, push the current index as a new base. Otherwise, the current valid length is i - stack[-1].",
    code: `class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]
        max_len = 0

        for i, char in enumerate(s):
            if char == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    max_len = max(max_len, i - stack[-1])

        return max_len`,
    jsCode: `var longestValidParentheses = function(s) {
    const stack = [-1];
    let maxLen = 0;

    for (let i = 0; i < s.length; i++) {
        if (s[i] === '(') {
            stack.push(i);
        } else {
            stack.pop();
            if (stack.length === 0) {
                stack.push(i);
            } else {
                maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
            }
        }
    }

    return maxLen;
};`,
    explanation: `- Initialize the stack with -1. This acts as the base index for calculating lengths.
- For '(': push its index onto the stack.
- For ')': pop the top of the stack.
  - If the stack is now empty, no matching '(' was found. Push the current index as the new base.
  - If the stack is non-empty, the length of the current valid substring is i - stack[-1] (distance from current index to the last unmatched position).
- Update max_len with each valid length found.
- The stack always contains the index of the last unmatched ')' or '(' at its bottom.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    hints: [
      "A key insight: the stack should store indices, not characters, so you can calculate substring lengths.",
      "Initialize the stack with -1 to handle the edge case where the valid substring starts at index 0.",
      "When you pop and the stack becomes empty, push the current index as a new 'boundary marker'.",
    ],
  },

  // ============================================================
  // BINARY SEARCH
  // ============================================================

  // 4. Median of Two Sorted Arrays
  {
    id: 4,
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(min(m, n))). The median is the middle value if the total length is odd, or the average of the two middle values if even.",
    examples: `Input: nums1 = [1,3], nums2 = [2]
Output: 2.0
Explanation: Merged array = [1,2,3], median is 2.`,
    intuition:
      "Instead of merging both arrays (O(m+n)), realize that finding the median means finding a dividing line that splits all elements into two equal halves. If you pick where to cut array1, the cut in array2 is determined. Binary search on the shorter array to find the cut where the largest element on the left side is smaller than the smallest element on the right side.",
    approach:
      "Binary search on the shorter array to find the correct partition. Partition both arrays such that all elements on the left are less than or equal to all elements on the right. The partition is correct when maxLeft1 <= minRight2 and maxLeft2 <= minRight1.",
    code: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        lo, hi = 0, m
        half = (m + n + 1) // 2

        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i

            left1 = nums1[i - 1] if i > 0 else float('-inf')
            right1 = nums1[i] if i < m else float('inf')
            left2 = nums2[j - 1] if j > 0 else float('-inf')
            right2 = nums2[j] if j < n else float('inf')

            if left1 <= right2 and left2 <= right1:
                if (m + n) % 2 == 1:
                    return max(left1, left2)
                return (max(left1, left2) + min(right1, right2)) / 2
            elif left1 > right2:
                hi = i - 1
            else:
                lo = i + 1

        return 0.0`,
    jsCode: `var findMedianSortedArrays = function(nums1, nums2) {
    if (nums1.length > nums2.length) {
        [nums1, nums2] = [nums2, nums1];
    }

    const m = nums1.length;
    const n = nums2.length;
    let lo = 0;
    let hi = m;
    const half = Math.floor((m + n + 1) / 2);

    while (lo <= hi) {
        const i = Math.floor((lo + hi) / 2);
        const j = half - i;

        const left1 = i > 0 ? nums1[i - 1] : -Infinity;
        const right1 = i < m ? nums1[i] : Infinity;
        const left2 = j > 0 ? nums2[j - 1] : -Infinity;
        const right2 = j < n ? nums2[j] : Infinity;

        if (left1 <= right2 && left2 <= right1) {
            if ((m + n) % 2 === 1) {
                return Math.max(left1, left2);
            }
            return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
        } else if (left1 > right2) {
            hi = i - 1;
        } else {
            lo = i + 1;
        }
    }

    return 0.0;
};`,
    explanation: `- Always binary search on the shorter array (swap if needed) for O(log(min(m, n))).
- Binary search for partition index i in nums1; j = half - i gives the partition in nums2.
- half = (m + n + 1) // 2 ensures the left half has the correct number of elements.
- Check boundary values: left1, right1, left2, right2 (use -inf/inf for out-of-bounds).
- Valid partition: left1 <= right2 AND left2 <= right1 (all left elements <= all right elements).
- If total length is odd, median = max(left1, left2). If even, median = average of max(left1, left2) and min(right1, right2).
- Adjust binary search bounds based on which condition fails.`,
    timeComplexity: "O(log(min(m, n)))",
    spaceComplexity: "O(1)",
    hints: [
      "Think of finding the correct partition point that splits both arrays into left and right halves.",
      "Binary search on the shorter array. For each partition i in nums1, the partition in nums2 is determined: j = (m + n + 1) // 2 - i.",
      "The partition is correct when the max of both left halves is <= the min of both right halves.",
    ],
  },

  // 33. Search in Rotated Sorted Array
  {
    id: 33,
    description:
      "There is an integer array nums sorted in ascending order (with distinct values), which is possibly rotated at an unknown pivot. Given the array after rotation and an integer target, return the index of target if it is in the array, or -1 if it is not. You must write an algorithm with O(log n) runtime complexity.",
    examples: `Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4`,
    intuition:
      "Even though the array is rotated, at least one half around the midpoint is always properly sorted. You can check which half is sorted in O(1) by comparing endpoints. If the target falls within the sorted half's range, search there; otherwise search the other half. This preserves the O(log n) halving property of binary search.",
    approach:
      "Use modified binary search. At each step, determine which half is sorted (at least one half always is). Then check if the target lies within the sorted half. If so, search that half; otherwise, search the other half.",
    code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1

        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid

            if nums[lo] <= nums[mid]:  # left half is sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:  # right half is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1

        return -1`,
    jsCode: `var search = function(nums, target) {
    let lo = 0;
    let hi = nums.length - 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;

        if (nums[lo] <= nums[mid]) {
            if (nums[lo] <= target && target < nums[mid]) {
                hi = mid - 1;
            } else {
                lo = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[hi]) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
    }

    return -1;
};`,
    explanation: `- Standard binary search with one additional decision: which half is sorted?
- If nums[lo] <= nums[mid], the left half [lo..mid] is sorted.
  - If target is in range [nums[lo], nums[mid]), search left (hi = mid - 1).
  - Otherwise, search right (lo = mid + 1).
- Else, the right half [mid..hi] is sorted.
  - If target is in range (nums[mid], nums[hi]], search right (lo = mid + 1).
  - Otherwise, search left (hi = mid - 1).
- This always narrows the search space by half, maintaining O(log n).`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "In a rotated sorted array, one half around the midpoint is always fully sorted.",
      "Determine which half is sorted by comparing nums[lo] with nums[mid].",
      "If the target falls within the sorted half's range, search there; otherwise search the other half.",
    ],
  },

  // 34. Find First and Last Position of Element in Sorted Array
  {
    id: 34,
    description:
      "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1]. You must write an algorithm with O(log n) runtime complexity.",
    examples: `Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]`,
    intuition:
      "A normal binary search stops as soon as it finds the target, but you need the first and last positions. The trick is: when you find the target, do not stop. Instead, record it as a candidate and keep searching left (for the first occurrence) or right (for the last occurrence). Two modified binary searches give you both boundaries.",
    approach:
      "Run binary search twice: once to find the leftmost (first) occurrence and once to find the rightmost (last) occurrence. For the left search, when nums[mid] == target, continue searching left. For the right search, continue searching right.",
    code: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        def find_left():
            lo, hi = 0, len(nums) - 1
            result = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if nums[mid] == target:
                    result = mid
                    hi = mid - 1  # keep searching left
                elif nums[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return result

        def find_right():
            lo, hi = 0, len(nums) - 1
            result = -1
            while lo <= hi:
                mid = (lo + hi) // 2
                if nums[mid] == target:
                    result = mid
                    lo = mid + 1  # keep searching right
                elif nums[mid] < target:
                    lo = mid + 1
                else:
                    hi = mid - 1
            return result

        return [find_left(), find_right()]`,
    jsCode: `var searchRange = function(nums, target) {
    const findLeft = () => {
        let lo = 0, hi = nums.length - 1;
        let result = -1;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (nums[mid] === target) {
                result = mid;
                hi = mid - 1;
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    };

    const findRight = () => {
        let lo = 0, hi = nums.length - 1;
        let result = -1;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (nums[mid] === target) {
                result = mid;
                lo = mid + 1;
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    };

    return [findLeft(), findRight()];
};`,
    explanation: `- find_left: Standard binary search, but when nums[mid] == target, record mid as a candidate and continue searching left (hi = mid - 1) to find an earlier occurrence.
- find_right: Same approach, but when nums[mid] == target, record mid and continue searching right (lo = mid + 1) to find a later occurrence.
- Both searches are O(log n), so the total is O(log n).
- If the target is not found at all, both functions return -1.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "A single binary search finds one occurrence, but you need the first and last.",
      "Modify binary search: when you find the target, don't stop. Instead, record it and keep searching in one direction.",
      "Run two binary searches: one that always moves left after finding the target, and one that always moves right.",
    ],
  },

  // 74. Search a 2D Matrix
  {
    id: 74,
    description:
      "You are given an m x n integer matrix where each row is sorted in non-decreasing order and the first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in the matrix. You must write an algorithm with O(log(m * n)) runtime complexity.",
    examples: `Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
Output: true`,
    intuition:
      "Since each row starts with a value greater than the previous row's last value, the entire matrix is just a sorted array wrapped into rows. You can treat it as a 1D sorted array and do standard binary search. The only trick is converting a flat index to row/column coordinates using division and modulo.",
    approach:
      "Treat the 2D matrix as a flattened sorted 1D array. Use standard binary search with index mapping: for a flat index mid, the row is mid // cols and the column is mid % cols.",
    code: `class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        lo, hi = 0, rows * cols - 1

        while lo <= hi:
            mid = (lo + hi) // 2
            value = matrix[mid // cols][mid % cols]
            if value == target:
                return True
            elif value < target:
                lo = mid + 1
            else:
                hi = mid - 1

        return False`,
    jsCode: `var searchMatrix = function(matrix, target) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let lo = 0;
    let hi = rows * cols - 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const value = matrix[Math.floor(mid / cols)][mid % cols];
        if (value === target) return true;
        else if (value < target) lo = mid + 1;
        else hi = mid - 1;
    }

    return false;
};`,
    explanation: `- The matrix is essentially a sorted 1D array split into rows.
- Total elements = rows * cols. Search range: lo = 0, hi = rows * cols - 1.
- For any flat index mid: row = mid // cols, col = mid % cols gives the 2D coordinates.
- Compare matrix[row][col] with target and adjust lo/hi accordingly.
- Standard binary search logic applies: move lo up if value < target, hi down if value > target.`,
    timeComplexity: "O(log(m * n))",
    spaceComplexity: "O(1)",
    hints: [
      "Since each row's first element is greater than the previous row's last, the entire matrix is sorted if read row by row.",
      "Map a 1D index to 2D coordinates: row = index // num_cols, col = index % num_cols.",
      "Apply standard binary search using this 1D-to-2D mapping.",
    ],
  },

  // 153. Find Minimum in Rotated Sorted Array
  {
    id: 153,
    description:
      "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array of unique elements, return the minimum element. You must write an algorithm that runs in O(log n) time.",
    examples: `Input: nums = [3,4,5,1,2]
Output: 1
Explanation: The original array was [1,2,3,4,5] rotated 3 times.`,
    intuition:
      "The minimum element sits at the 'rotation point' where the sorted order breaks. If the middle element is greater than the rightmost element, the break must be somewhere to the right (the array wraps around). Otherwise, the right side is properly sorted and the minimum is at mid or to the left. Comparing with the right end (not the left) is what makes this work correctly.",
    approach:
      "Use binary search comparing the middle element with the rightmost element. If nums[mid] > nums[hi], the minimum is in the right half (the rotation point is there). Otherwise, it is in the left half including mid.",
    code: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1

        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1
            else:
                hi = mid

        return nums[lo]`,
    jsCode: `var findMin = function(nums) {
    let lo = 0;
    let hi = nums.length - 1;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] > nums[hi]) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return nums[lo];
};`,
    explanation: `- Binary search narrows down to the minimum element.
- If nums[mid] > nums[hi], the array is "broken" between mid and hi, meaning the minimum lies in [mid + 1, hi]. So lo = mid + 1.
- If nums[mid] <= nums[hi], the right half is sorted, so the minimum is at mid or to the left. So hi = mid.
- The loop continues while lo < hi. When lo == hi, we have found the minimum.
- We compare with nums[hi] rather than nums[lo] to correctly handle the case when the array is not rotated at all.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "The minimum is at the 'rotation point' where a larger element is followed by a smaller one.",
      "Compare nums[mid] with nums[hi] (not nums[lo]) to decide which half contains the minimum.",
      "If nums[mid] > nums[hi], the rotation point (and minimum) must be in the right half.",
    ],
  },

  // 704. Binary Search
  {
    id: 704,
    description:
      "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    examples: `Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4`,
    intuition:
      "This is the fundamental divide-and-conquer pattern: since the array is sorted, checking the middle element tells you which half the target must be in. Each comparison eliminates half the remaining elements, which is why you find the answer in at most log(n) steps instead of scanning every element.",
    approach:
      "Classic binary search: maintain two pointers lo and hi. Compute mid, compare nums[mid] with target. If equal, return mid. If less, search right half. If greater, search left half. Return -1 if not found.",
    code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1

        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1

        return -1`,
    jsCode: `var search = function(nums, target) {
    let lo = 0;
    let hi = nums.length - 1;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }

    return -1;
};`,
    explanation: `- Initialize lo = 0 and hi = len(nums) - 1 to cover the full array.
- Compute mid = (lo + hi) // 2 (integer division, no overflow issue in Python).
- If nums[mid] == target, we found it — return mid.
- If nums[mid] < target, the target must be in the right half: set lo = mid + 1.
- If nums[mid] > target, the target must be in the left half: set hi = mid - 1.
- If lo > hi, the target is not in the array — return -1.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "This is the textbook binary search. Maintain lo and hi pointers and compute the midpoint.",
      "Be careful with boundary updates: use mid + 1 and mid - 1 to avoid infinite loops.",
      "The loop condition is lo <= hi (inclusive), and you return -1 when the loop ends without finding the target.",
    ],
  },

  // 875. Koko Eating Bananas
  {
    id: 875,
    description:
      "Koko loves to eat bananas. There are n piles of bananas. The ith pile has piles[i] bananas. Koko can decide her bananas-per-hour eating speed of k. Each hour, she chooses a pile and eats k bananas. If the pile has fewer than k, she eats all of them and won't eat any more during that hour. Return the minimum integer k such that she can eat all bananas within h hours.",
    examples: `Input: piles = [3,6,7,11], h = 8
Output: 4
Explanation: At speed 4, hours needed = ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 <= 8.`,
    intuition:
      "This is a 'binary search on the answer' pattern. Instead of directly computing the answer, notice that if speed k works, then any speed greater than k also works. This monotonic property means you can binary search over possible speeds. For each candidate speed, a simple linear scan tells you whether it is fast enough.",
    approach:
      "Binary search on the answer (eating speed k). The minimum speed is 1 and the maximum is max(piles). For each candidate speed, calculate total hours needed. Use binary search to find the minimum k that finishes within h hours.",
    code: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        lo, hi = 1, max(piles)

        while lo < hi:
            mid = (lo + hi) // 2
            hours = sum((p + mid - 1) // mid for p in piles)
            if hours <= h:
                hi = mid
            else:
                lo = mid + 1

        return lo`,
    jsCode: `var minEatingSpeed = function(piles, h) {
    let lo = 1;
    let hi = Math.max(...piles);

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);
        if (hours <= h) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
};`,
    explanation: `- Binary search on the eating speed k, from 1 to max(piles).
- For each candidate speed mid, calculate total hours: sum of ceil(pile / mid) for each pile. We use (p + mid - 1) // mid for integer ceiling division.
- If total hours <= h, mid is fast enough. Try a slower speed: hi = mid.
- If total hours > h, mid is too slow. Need a faster speed: lo = mid + 1.
- When lo == hi, we have found the minimum valid speed.`,
    timeComplexity: "O(n * log(max(piles)))",
    spaceComplexity: "O(1)",
    hints: [
      "If Koko eats at speed max(piles), she finishes in n hours. The answer is between 1 and max(piles).",
      "Binary search on the speed. For each speed, check if the total hours needed is <= h.",
      "Ceiling division without floating point: ceil(a / b) = (a + b - 1) // b.",
    ],
  },

  // 162. Find Peak Element
  {
    id: 162,
    description:
      "A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array nums, find a peak element and return its index. If the array contains multiple peaks, return the index to any of the peaks. You may imagine nums[-1] = nums[n] = -infinity. You must write an algorithm that runs in O(log n) time.",
    examples: `Input: nums = [1,2,3,1]
Output: 2
Explanation: nums[2] = 3 is a peak element.`,
    intuition:
      "Imagine hiking and you are at a point on a trail. If the path goes uphill to your right, there must be a peak somewhere to the right (since the trail eventually drops to negative infinity at the edge). Always walk uphill and you are guaranteed to reach a peak. Binary search just makes this 'walk uphill' process logarithmic by jumping to the midpoint each time.",
    approach:
      "Use binary search. If nums[mid] < nums[mid + 1], a peak must exist on the right side (since the array ends with -infinity). Otherwise, a peak exists on the left side including mid. This narrows to a peak in O(log n).",
    code: `class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1

        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1
            else:
                hi = mid

        return lo`,
    jsCode: `var findPeakElement = function(nums) {
    let lo = 0;
    let hi = nums.length - 1;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] < nums[mid + 1]) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return lo;
};`,
    explanation: `- Binary search between lo = 0 and hi = len(nums) - 1.
- If nums[mid] < nums[mid + 1], the slope is going up to the right. Since nums[n] = -infinity, a peak must exist to the right. Set lo = mid + 1.
- If nums[mid] >= nums[mid + 1], the slope is going down or flat to the right. A peak exists at mid or to the left. Set hi = mid.
- When lo == hi, we converge on a peak element.
- This works because we always move toward a higher value, and the boundary condition (edges are -infinity) guarantees a peak exists.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "You don't need to find all peaks, just any one. This allows binary search.",
      "If the middle element is less than its right neighbor, a peak must exist to the right (the array eventually drops to -infinity).",
      "Follow the 'uphill' direction — a peak is guaranteed to exist on the side where the slope goes up.",
    ],
  },

  // 278. First Bad Version
  {
    id: 278,
    description:
      "You are a product manager and the current version of your product fails the quality check. Since each version is based on the previous one, all versions after a bad version are also bad. Suppose you have n versions [1, 2, ..., n] and you want to find out the first bad version, which causes all following ones to be bad. You are given an API isBadVersion(version) which returns whether version is bad.",
    examples: `Input: n = 5, bad = 4
Output: 4
Explanation: isBadVersion(3) -> false, isBadVersion(4) -> true, so 4 is the first bad version.`,
    intuition:
      "The versions form a pattern like [good, good, ..., good, bad, bad, ..., bad]. You are looking for the exact boundary where good switches to bad. Binary search is perfect for finding such a boundary: check the middle, and depending on whether it is good or bad, you know which half contains the transition point.",
    approach:
      "Binary search for the boundary between good and bad versions. If mid is bad, the first bad version is at mid or earlier. If mid is good, the first bad version is after mid. This minimizes the number of API calls to O(log n).",
    code: `# The isBadVersion API is already defined for you.
# def isBadVersion(version: int) -> bool:

class Solution:
    def firstBadVersion(self, n: int) -> int:
        lo, hi = 1, n

        while lo < hi:
            mid = (lo + hi) // 2
            if isBadVersion(mid):
                hi = mid
            else:
                lo = mid + 1

        return lo`,
    jsCode: `var solution = function(isBadVersion) {
    return function(n) {
        let lo = 1;
        let hi = n;

        while (lo < hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (isBadVersion(mid)) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }

        return lo;
    };
};`,
    explanation: `- Binary search between version 1 and version n.
- If isBadVersion(mid) returns True, the first bad version is at mid or earlier: set hi = mid.
- If isBadVersion(mid) returns False, the first bad version is after mid: set lo = mid + 1.
- When lo == hi, we have found the first bad version.
- This is a classic "find the leftmost true" binary search pattern.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "This is a classic binary search for the leftmost position where a condition becomes true.",
      "If mid is bad, the answer could be mid or earlier (hi = mid). If mid is good, the answer is later (lo = mid + 1).",
      "The loop invariant is: the first bad version is always in [lo, hi].",
    ],
  },

  // 410. Split Array Largest Sum
  {
    id: 410,
    description:
      "Given an integer array nums and an integer k, split nums into k non-empty subarrays such that the largest sum of any subarray is minimized. Return the minimized largest sum. A subarray is a contiguous part of the array.",
    examples: `Input: nums = [7,2,5,10,8], k = 2
Output: 18
Explanation: Split into [7,2,5] and [10,8]. The largest sum is 18 and this is the minimum possible.`,
    intuition:
      "Instead of trying all possible ways to split the array (exponentially many), flip the question: 'Given a maximum allowed subarray sum, can I split the array into k or fewer parts?' This yes/no question is easy to check greedily, and the answer has a monotonic property (if max_sum works, any larger value also works), making it perfect for binary search on the answer.",
    approach:
      "Binary search on the answer (the largest subarray sum). The minimum possible answer is max(nums) and the maximum is sum(nums). For each candidate, greedily check if we can split the array into k or fewer subarrays where each sum does not exceed the candidate.",
    code: `class Solution:
    def splitArray(self, nums: list[int], k: int) -> int:
        def can_split(max_sum: int) -> bool:
            subarrays = 1
            current_sum = 0
            for num in nums:
                if current_sum + num > max_sum:
                    subarrays += 1
                    current_sum = num
                    if subarrays > k:
                        return False
                else:
                    current_sum += num
            return True

        lo, hi = max(nums), sum(nums)

        while lo < hi:
            mid = (lo + hi) // 2
            if can_split(mid):
                hi = mid
            else:
                lo = mid + 1

        return lo`,
    jsCode: `var splitArray = function(nums, k) {
    const canSplit = (maxSum) => {
        let subarrays = 1;
        let currentSum = 0;
        for (const num of nums) {
            if (currentSum + num > maxSum) {
                subarrays++;
                currentSum = num;
                if (subarrays > k) return false;
            } else {
                currentSum += num;
            }
        }
        return true;
    };

    let lo = Math.max(...nums);
    let hi = nums.reduce((a, b) => a + b, 0);

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canSplit(mid)) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
};`,
    explanation: `- Binary search on the answer: the maximum allowed subarray sum.
- lo = max(nums) because each element must fit in some subarray. hi = sum(nums) because one subarray could hold everything.
- can_split(max_sum): Greedily assign elements to the current subarray. When adding the next element would exceed max_sum, start a new subarray. Return True if we use k or fewer subarrays.
- If can_split(mid) is True, mid might be the answer or we can try smaller: hi = mid.
- If can_split(mid) is False, mid is too small: lo = mid + 1.
- When lo == hi, we have the minimized largest sum.`,
    timeComplexity: "O(n * log(sum(nums) - max(nums)))",
    spaceComplexity: "O(1)",
    hints: [
      "Instead of thinking about where to split, think about what the maximum subarray sum should be, then check if it's achievable.",
      "Binary search on the maximum subarray sum. The range is [max(nums), sum(nums)].",
      "For each candidate max sum, greedily fill subarrays from left to right. If you need more than k subarrays, the candidate is too small.",
    ],
  },

  // 540. Single Element in a Sorted Array
  {
    id: 540,
    description:
      "You are given a sorted array consisting of only integers where every element appears exactly twice, except for one element which appears exactly once. Return the single element that appears only once. Your solution must run in O(log n) time and O(1) space.",
    examples: `Input: nums = [1,1,3,3,5,7,7,8,8]
Output: 5`,
    intuition:
      "When every element appears twice, pairs naturally align at even-odd index pairs (0-1, 2-3, 4-5...). The single element disrupts this alignment: before it, pairs start at even indices; after it, pairs start at odd indices. Binary search for the point where this pattern breaks by checking if the pair starting at an even index is still intact.",
    approach:
      "Use binary search on pair indices. In a valid pairing, pairs start at even indices. Before the single element, the first of each pair is at an even index. After the single element, this pattern shifts. Binary search for the point where the pattern breaks.",
    code: `class Solution:
    def singleNonDuplicate(self, nums: list[int]) -> int:
        lo, hi = 0, len(nums) - 1

        while lo < hi:
            mid = (lo + hi) // 2
            # Ensure mid is even so we compare with its pair partner
            if mid % 2 == 1:
                mid -= 1
            if nums[mid] == nums[mid + 1]:
                # Pair is intact, single element is to the right
                lo = mid + 2
            else:
                # Pair is broken, single element is at mid or to the left
                hi = mid

        return nums[lo]`,
    jsCode: `var singleNonDuplicate = function(nums) {
    let lo = 0;
    let hi = nums.length - 1;

    while (lo < hi) {
        let mid = Math.floor((lo + hi) / 2);
        if (mid % 2 === 1) mid--;
        if (nums[mid] === nums[mid + 1]) {
            lo = mid + 2;
        } else {
            hi = mid;
        }
    }

    return nums[lo];
};`,
    explanation: `- In the array without the single element, pairs start at indices 0, 2, 4, ...
- Binary search: ensure mid is even (if odd, decrement by 1).
- If nums[mid] == nums[mid + 1], the pair at mid is intact. The single element must be to the right: lo = mid + 2.
- If nums[mid] != nums[mid + 1], the pair pattern is disrupted. The single element is at mid or to the left: hi = mid.
- When lo == hi, we have found the single element.`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    hints: [
      "Before the single element, pairs align at even indices (e.g., index 0-1, 2-3). After the single element, this shifts.",
      "Binary search on even indices. Check if the pair starting at mid is intact (nums[mid] == nums[mid+1]).",
      "If the pair is intact, the single element is to the right. If broken, it is at mid or to the left.",
    ],
  },

  // 1011. Capacity To Ship Packages Within D Days
  {
    id: 1011,
    description:
      "A conveyor belt has packages that must be shipped from one port to another within days days. The ith package has a weight of weights[i]. Each day, we load packages in order onto the ship. We may not load more weight than the ship's maximum capacity. Return the least weight capacity of the ship that will result in all packages being shipped within days days.",
    examples: `Input: weights = [1,2,3,4,5,6,7,8,9,10], days = 5
Output: 15
Explanation: Ship with capacity 15: Day 1: [1,2,3,4,5], Day 2: [6,7], Day 3: [8], Day 4: [9], Day 5: [10].`,
    intuition:
      "This is the same 'binary search on the answer' pattern as Koko Eating Bananas and Split Array Largest Sum. The ship capacity has a monotonic property: a bigger ship can always finish in fewer or equal days. So binary search over possible capacities, and for each one, greedily simulate loading packages day by day to check feasibility.",
    approach:
      "Binary search on the ship capacity. The minimum capacity is max(weights) (must fit the heaviest package) and the maximum is sum(weights) (ship everything in one day). For each candidate capacity, greedily simulate loading to check if all packages ship within the given days.",
    code: `class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        def can_ship(capacity: int) -> bool:
            days_needed = 1
            current_load = 0
            for w in weights:
                if current_load + w > capacity:
                    days_needed += 1
                    current_load = w
                    if days_needed > days:
                        return False
                else:
                    current_load += w
            return True

        lo, hi = max(weights), sum(weights)

        while lo < hi:
            mid = (lo + hi) // 2
            if can_ship(mid):
                hi = mid
            else:
                lo = mid + 1

        return lo`,
    jsCode: `var shipWithinDays = function(weights, days) {
    const canShip = (capacity) => {
        let daysNeeded = 1;
        let currentLoad = 0;
        for (const w of weights) {
            if (currentLoad + w > capacity) {
                daysNeeded++;
                currentLoad = w;
                if (daysNeeded > days) return false;
            } else {
                currentLoad += w;
            }
        }
        return true;
    };

    let lo = Math.max(...weights);
    let hi = weights.reduce((a, b) => a + b, 0);

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canShip(mid)) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return lo;
};`,
    explanation: `- Binary search on the ship capacity between max(weights) and sum(weights).
- can_ship(capacity): Simulate loading packages in order. When adding the next package would exceed capacity, start a new day. Return True if total days needed <= days.
- If can_ship(mid) is True, mid works — try a smaller capacity: hi = mid.
- If can_ship(mid) is False, mid is too small — lo = mid + 1.
- When lo == hi, we found the minimum capacity.
- This is structurally identical to "Split Array Largest Sum" (problem 410) — the ship capacity is the maximum subarray sum, and days is the number of subarrays.`,
    timeComplexity: "O(n * log(sum(weights) - max(weights)))",
    spaceComplexity: "O(1)",
    hints: [
      "This problem is equivalent to splitting the weights array into at most 'days' subarrays and minimizing the maximum subarray sum.",
      "Binary search on the capacity. The range is [max(weights), sum(weights)].",
      "For each candidate capacity, greedily fill each day's load. If you need more than 'days' days, the capacity is too small.",
    ],
  },
];
