import { ProblemSolution } from './types';

export const solutions: ProblemSolution[] = [
  // ---------------------------------------------------------------------------
  // 1114. Print in Order
  // ---------------------------------------------------------------------------
  {
    id: 1114,
    description:
      'Three different threads call first(), second(), and third() on the same instance of Foo. Design a mechanism so that second() always runs after first(), and third() always runs after second(), regardless of the OS scheduling order.',
    examples:
      'Input: [1,2,3]\nOutput: "firstsecondthird"\n\nInput: [1,3,2]\nOutput: "firstsecondthird"\nExplanation: Even though thread 3 starts before thread 2, the output is always "firstsecondthird".',
    intuition:
      'Imagine a relay race with 3 runners. Runner 2 cannot start until Runner 1 passes the baton, and Runner 3 cannot start until Runner 2 passes the baton. Each "baton" is a synchronization primitive (barrier/event/semaphore) that blocks the next runner until the previous one signals "I\'m done." Without these batons, the OS could schedule the runners in any order, producing garbled output.',
    approach:
      'Use two barriers (threading.Event or threading.Barrier). Event 1 starts unset - second() waits on it, first() sets it after printing. Event 2 starts unset - third() waits on it, second() sets it after printing. This creates a chain: first -> second -> third.',
    code: `import threading

class Foo:
    def __init__(self):
        self.done1 = threading.Event()
        self.done2 = threading.Event()

    def first(self, printFirst):
        printFirst()
        self.done1.set()

    def second(self, printSecond):
        self.done1.wait()
        printSecond()
        self.done2.set()

    def third(self, printThird):
        self.done2.wait()
        printThird()`,
    jsCode: `// JavaScript doesn't have native threads but we can model
// the synchronization with Promises (used in LeetCode's JS env)
var Foo = function() {
    this.p1 = new Promise(resolve => { this.r1 = resolve; });
    this.p2 = new Promise(resolve => { this.r2 = resolve; });
};

Foo.prototype.first = function(printFirst) {
    printFirst();
    this.r1();   // signal: first is done
};

Foo.prototype.second = function(printSecond) {
    this.p1.then(() => {
        printSecond();
        this.r2();   // signal: second is done
    });
};

Foo.prototype.third = function(printThird) {
    this.p2.then(() => {
        printThird();
    });
};`,
    explanation:
      '1. We create two Event objects: done1 and done2, both initially unset (blocking).\n' +
      '2. first() prints immediately, then signals done1.\n' +
      '3. second() blocks on done1.wait() - it cannot proceed until first() calls done1.set().\n' +
      '4. After printing, second() signals done2.\n' +
      '5. third() blocks on done2.wait() until second() signals.\n' +
      '6. This guarantees execution order regardless of thread scheduling.',
    timeComplexity: 'O(1) per method call',
    spaceComplexity: 'O(1)',
    hints: [
      'Think about what each thread needs to WAIT for before it can run.',
      'threading.Event is the simplest primitive here: wait() blocks, set() unblocks all waiters.',
      'You need exactly 2 events to enforce 3-step ordering (one gate between each pair).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1115. Print FooBar Alternately
  // ---------------------------------------------------------------------------
  {
    id: 1115,
    description:
      'Two different threads share an instance of FooBar. One thread calls foo() and the other calls bar(). Design a mechanism so the output is "foobar" repeated n times, always alternating.',
    examples:
      'Input: n = 2\nOutput: "foobarfoobar"\n\nInput: n = 1\nOutput: "foobar"',
    intuition:
      'Picture two people passing a ball back and forth. Person A (foo) holds the ball first, throws it to Person B (bar), who throws it back to A, and so on. A Semaphore is like the ball - whoever holds it can act. foo starts with the ball (semaphore count=1) and bar starts without (count=0). After each print, you release the other person\'s semaphore, effectively passing the ball.',
    approach:
      'Use two semaphores: sem_foo (initialized to 1 so foo goes first) and sem_bar (initialized to 0). foo() acquires sem_foo, prints, releases sem_bar. bar() acquires sem_bar, prints, releases sem_foo. Repeat n times.',
    code: `import threading

class FooBar:
    def __init__(self, n):
        self.n = n
        self.sem_foo = threading.Semaphore(1)  # foo goes first
        self.sem_bar = threading.Semaphore(0)  # bar waits

    def foo(self, printFoo):
        for _ in range(self.n):
            self.sem_foo.acquire()
            printFoo()
            self.sem_bar.release()

    def bar(self, printBar):
        for _ in range(self.n):
            self.sem_bar.acquire()
            printBar()
            self.sem_foo.release()`,
    jsCode: `// Model with promises that reset each iteration
var FooBar = function(n) {
    this.n = n;
    this.fooReady = Promise.resolve(); // foo starts ready
    this.barResolver = null;
    this.fooResolver = null;
};

FooBar.prototype.foo = async function(printFoo) {
    for (let i = 0; i < this.n; i++) {
        await this.fooReady;
        printFoo();
        // create a new promise for bar to wait on in next iteration
        this.barReady = new Promise(r => { this.barResolver = r; });
        if (this.fooResolver) this.fooResolver();
        // wait for bar to finish before next foo
        this.fooReady = new Promise(r => { this.fooResolver = r; });
        this.barResolver();
    }
};

FooBar.prototype.bar = async function(printBar) {
    for (let i = 0; i < this.n; i++) {
        await this.barReady;
        printBar();
        this.fooResolver();
    }
};`,
    explanation:
      '1. sem_foo starts at 1 (foo can proceed immediately), sem_bar starts at 0 (bar must wait).\n' +
      '2. In each loop iteration, foo acquires sem_foo (decrements from 1 to 0), prints "foo", then releases sem_bar (increments from 0 to 1).\n' +
      '3. bar acquires sem_bar (was just released by foo), prints "bar", then releases sem_foo.\n' +
      '4. This ping-pong continues n times, guaranteeing strict alternation.\n' +
      '5. Key insight: semaphores act as turnstiles - only one thread can pass at a time.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Two semaphores create a "ping-pong" pattern between two threads.',
      'The initial semaphore values determine who goes first: sem_foo=1 means foo starts.',
      'Each thread\'s "release" is the other thread\'s "green light".',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1116. Print Zero Even Odd
  // ---------------------------------------------------------------------------
  {
    id: 1116,
    description:
      'Three threads share a ZeroEvenOdd instance. Thread A calls zero() (prints 0), thread B calls even() (prints even numbers), thread C calls odd() (prints odd numbers). Produce the series "0102030405..." up to n.',
    examples:
      'Input: n = 2\nOutput: "0102"\n\nInput: n = 5\nOutput: "0102030405"',
    intuition:
      'Think of a traffic light at a 3-way intersection. The "zero" thread is the main signal that alternates between giving a green light to "odd" or "even." After zero prints, it checks: is the next number odd or even? Then it signals the appropriate thread. After odd/even prints its number, it signals zero to go again. Three semaphores coordinate this 3-way dance.',
    approach:
      'Use 3 semaphores: sem_zero (starts at 1), sem_odd (starts at 0), sem_even (starts at 0). zero() prints 0, then releases sem_odd or sem_even based on whether the next number is odd/even. The odd/even thread prints its number then releases sem_zero.',
    code: `import threading

class ZeroEvenOdd:
    def __init__(self, n):
        self.n = n
        self.sem_zero = threading.Semaphore(1)
        self.sem_odd = threading.Semaphore(0)
        self.sem_even = threading.Semaphore(0)

    def zero(self, printNumber):
        for i in range(1, self.n + 1):
            self.sem_zero.acquire()
            printNumber(0)
            if i % 2 == 1:
                self.sem_odd.release()
            else:
                self.sem_even.release()

    def odd(self, printNumber):
        for i in range(1, self.n + 1, 2):
            self.sem_odd.acquire()
            printNumber(i)
            self.sem_zero.release()

    def even(self, printNumber):
        for i in range(2, self.n + 1, 2):
            self.sem_even.acquire()
            printNumber(i)
            self.sem_zero.release()`,
    jsCode: `var ZeroEvenOdd = function(n) {
    this.n = n;
    this.turn = 0; // 0 = zero's turn
    this.num = 1;
};

ZeroEvenOdd.prototype.zero = async function(printNumber) {
    for (let i = 1; i <= this.n; i++) {
        while (this.turn !== 0) await new Promise(r => setTimeout(r, 0));
        printNumber(0);
        this.turn = (i % 2 === 1) ? 1 : 2; // 1=odd, 2=even
    }
};

ZeroEvenOdd.prototype.odd = async function(printNumber) {
    for (let i = 1; i <= this.n; i += 2) {
        while (this.turn !== 1) await new Promise(r => setTimeout(r, 0));
        printNumber(i);
        this.turn = 0;
    }
};

ZeroEvenOdd.prototype.even = async function(printNumber) {
    for (let i = 2; i <= this.n; i += 2) {
        while (this.turn !== 2) await new Promise(r => setTimeout(r, 0));
        printNumber(i);
        this.turn = 0;
    }
};`,
    explanation:
      '1. sem_zero starts at 1 (zero goes first), sem_odd and sem_even start at 0.\n' +
      '2. zero() acquires sem_zero, prints 0, then decides: if the next number i is odd, release sem_odd; if even, release sem_even.\n' +
      '3. odd() loops through 1, 3, 5, ... - for each, it acquires sem_odd, prints the number, releases sem_zero.\n' +
      '4. even() loops through 2, 4, 6, ... - same pattern with sem_even.\n' +
      '5. The flow is always: zero -> odd/even -> zero -> odd/even -> ...',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'zero() runs n times total, odd() runs ceil(n/2) times, even() runs floor(n/2) times.',
      'zero() is the "dispatcher" - it decides which thread goes next.',
      'Three semaphores with initial values (1, 0, 0) create a round-robin with zero as the hub.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1117. Building H2O
  // ---------------------------------------------------------------------------
  {
    id: 1117,
    description:
      'Multiple threads represent hydrogen (H) and oxygen (O) atoms. They must form water molecules: every group of 3 threads must consist of exactly 2 H and 1 O before any of them can proceed. Design a barrier that enforces this grouping.',
    examples:
      'Input: "HOH"\nOutput: "HOH" or "HHO" (any valid grouping of 2H + 1O)\n\nInput: "OOHHHH"\nOutput: "HHOHHO" (two water molecules)',
    intuition:
      'Imagine a bouncer at a club with a strict rule: groups must enter as exactly 2 friends (H) + 1 VIP (O). The bouncer has a counter for friends and VIPs. When 2 friends and 1 VIP have arrived, the bouncer opens the rope and lets all 3 in, then resets. Semaphores act as the counting mechanism: hydrogen has capacity 2, oxygen has capacity 1, and a barrier ensures all 3 proceed together.',
    approach:
      'Use a Barrier(3) so threads wait until a group of 3 forms. Use two Semaphores: sem_h (capacity 2) and sem_o (capacity 1) to ensure exactly 2H + 1O arrive at the barrier before anyone proceeds.',
    code: `import threading

class H2O:
    def __init__(self):
        self.sem_h = threading.Semaphore(2)  # allow 2 hydrogen
        self.sem_o = threading.Semaphore(1)  # allow 1 oxygen
        self.barrier = threading.Barrier(3)  # wait for group of 3

    def hydrogen(self, releaseHydrogen):
        self.sem_h.acquire()
        self.barrier.wait()
        releaseHydrogen()
        self.sem_h.release()

    def oxygen(self, releaseOxygen):
        self.sem_o.acquire()
        self.barrier.wait()
        releaseOxygen()
        self.sem_o.release()`,
    jsCode: `// Simplified JS model using counters and a flush mechanism
var H2O = function() {
    this.hCount = 0;
    this.oCount = 0;
    this.hQueue = [];
    this.oQueue = [];
};

H2O.prototype.hydrogen = function(releaseHydrogen) {
    this.hCount++;
    this.hQueue.push(releaseHydrogen);
    this._tryFlush();
};

H2O.prototype.oxygen = function(releaseOxygen) {
    this.oCount++;
    this.oQueue.push(releaseOxygen);
    this._tryFlush();
};

H2O.prototype._tryFlush = function() {
    while (this.hQueue.length >= 2 && this.oQueue.length >= 1) {
        this.hQueue.shift()();
        this.hQueue.shift()();
        this.oQueue.shift()();
    }
};`,
    explanation:
      '1. sem_h(2) allows at most 2 hydrogen threads to reach the barrier.\n' +
      '2. sem_o(1) allows at most 1 oxygen thread to reach the barrier.\n' +
      '3. barrier(3) blocks until exactly 3 threads arrive (2H + 1O).\n' +
      '4. Once 3 threads reach the barrier, they all proceed and release their semaphores.\n' +
      '5. The semaphore release resets capacity for the next water molecule.\n' +
      '6. Key insight: Semaphores control the RATIO, Barrier controls the GROUPING.',
    timeComplexity: 'O(1) per thread',
    spaceComplexity: 'O(1)',
    hints: [
      'You need two controls: one for ratio (2:1) and one for grouping (wait for 3).',
      'threading.Barrier(3) is purpose-built for "wait until N threads arrive."',
      'Semaphore(2) for H and Semaphore(1) for O naturally enforce the 2:1 ratio.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1188. Design Bounded Blocking Queue (Premium)
  // ---------------------------------------------------------------------------
  {
    id: 1188,
    description:
      'Implement a thread-safe bounded blocking queue with enqueue and dequeue operations. enqueue blocks when the queue is full; dequeue blocks when empty. Also implement size().',
    examples:
      'Input: capacity = 2\nenqueue(1) -> succeeds\nenqueue(2) -> succeeds\nenqueue(3) -> blocks until dequeue\ndequeue() -> returns 1, unblocks enqueue(3)',
    intuition:
      'Think of a conveyor belt with limited slots. The producer (enqueue) places items on the belt but must wait if all slots are full. The consumer (dequeue) takes items off but must wait if the belt is empty. Two semaphores track the available EMPTY slots and FULL slots. A Lock protects the actual queue from simultaneous modification. This is the classic Producer-Consumer pattern - one of the most important concurrency patterns in all of systems programming.',
    approach:
      'Use a deque as the underlying storage, a Lock for mutual exclusion, a Semaphore(capacity) for empty slots, and a Semaphore(0) for full slots. enqueue acquires an empty slot, locks, appends, unlocks, releases a full slot. dequeue does the reverse.',
    code: `import threading
from collections import deque

class BoundedBlockingQueue:
    def __init__(self, capacity):
        self.queue = deque()
        self.lock = threading.Lock()
        self.empty_slots = threading.Semaphore(capacity)  # start full of empty slots
        self.full_slots = threading.Semaphore(0)           # start with 0 items

    def enqueue(self, element):
        self.empty_slots.acquire()  # wait for an empty slot
        with self.lock:
            self.queue.append(element)
        self.full_slots.release()   # signal: one more item available

    def dequeue(self):
        self.full_slots.acquire()   # wait for an item
        with self.lock:
            element = self.queue.popleft()
        self.empty_slots.release()  # signal: one more empty slot
        return element

    def size(self):
        with self.lock:
            return len(self.queue)`,
    jsCode: `// JS model using async/await
class BoundedBlockingQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.queue = [];
        this.waitingEnqueue = [];
        this.waitingDequeue = [];
    }

    async enqueue(element) {
        while (this.queue.length >= this.capacity) {
            await new Promise(r => this.waitingEnqueue.push(r));
        }
        this.queue.push(element);
        if (this.waitingDequeue.length > 0) {
            this.waitingDequeue.shift()();
        }
    }

    async dequeue() {
        while (this.queue.length === 0) {
            await new Promise(r => this.waitingDequeue.push(r));
        }
        const element = this.queue.shift();
        if (this.waitingEnqueue.length > 0) {
            this.waitingEnqueue.shift()();
        }
        return element;
    }

    size() { return this.queue.length; }
}`,
    explanation:
      '1. empty_slots semaphore starts at capacity (all slots are empty).\n' +
      '2. full_slots semaphore starts at 0 (no items yet).\n' +
      '3. enqueue: acquire empty_slots (blocks if full), add item under lock, release full_slots.\n' +
      '4. dequeue: acquire full_slots (blocks if empty), remove item under lock, release empty_slots.\n' +
      '5. The lock prevents two threads from modifying the deque simultaneously.\n' +
      '6. This is the textbook Producer-Consumer pattern with bounded buffer.',
    timeComplexity: 'O(1) for enqueue/dequeue (excluding blocking wait time)',
    spaceComplexity: 'O(capacity)',
    hints: [
      'Think of two semaphores as counting opposite things: empty slots vs full slots.',
      'The invariant is always: empty_slots + full_slots = capacity.',
      'The Lock only protects the data structure, not the blocking behavior - that is the semaphores\' job.',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1195. Fizz Buzz Multithreaded
  // ---------------------------------------------------------------------------
  {
    id: 1195,
    description:
      'Four threads run simultaneously: fizz (prints "fizz" for multiples of 3 only), buzz (prints "buzz" for multiples of 5 only), fizzbuzz (prints "fizzbuzz" for multiples of both), and number (prints the number for all other cases). Output numbers 1 through n correctly.',
    examples:
      'Input: n = 15\nOutput: "1, 2, fizz, 4, buzz, fizz, 7, 8, fizz, buzz, 11, fizz, 13, 14, fizzbuzz"',
    intuition:
      'Imagine 4 workers at an assembly line, each responsible for a different type of label. A dispatcher (or the workers themselves via coordination) must ensure that for each number, exactly ONE worker acts. The trick: give each worker a semaphore and a "number" thread that acts as the dispatcher. The number thread checks divisibility and signals the right worker, then waits for that worker to finish before moving to the next number.',
    approach:
      'Use 4 semaphores (one per thread). The number thread is the main driver: for each i from 1 to n, it determines which thread should print, releases that thread\'s semaphore, and waits for a "done" signal. Each worker thread loops, acquiring its semaphore, printing, then signaling done.',
    code: `import threading

class FizzBuzz:
    def __init__(self, n):
        self.n = n
        self.sem_fizz = threading.Semaphore(0)
        self.sem_buzz = threading.Semaphore(0)
        self.sem_fizzbuzz = threading.Semaphore(0)
        self.sem_number = threading.Semaphore(0)
        self.done = threading.Semaphore(0)
        self.current = 1

    def fizz(self, printFizz):
        while True:
            self.sem_fizz.acquire()
            if self.current > self.n:
                return
            printFizz()
            self.done.release()

    def buzz(self, printBuzz):
        while True:
            self.sem_buzz.acquire()
            if self.current > self.n:
                return
            printBuzz()
            self.done.release()

    def fizzbuzz(self, printFizzBuzz):
        while True:
            self.sem_fizzbuzz.acquire()
            if self.current > self.n:
                return
            printFizzBuzz()
            self.done.release()

    def number(self, printNumber):
        for i in range(1, self.n + 1):
            self.current = i
            if i % 15 == 0:
                self.sem_fizzbuzz.release()
            elif i % 3 == 0:
                self.sem_fizz.release()
            elif i % 5 == 0:
                self.sem_buzz.release()
            else:
                self.sem_number.release()

            if i % 15 == 0 or i % 3 == 0 or i % 5 == 0:
                self.done.acquire()
            else:
                self.sem_number.acquire()
                printNumber(i)

        # Signal all threads to exit
        self.current = self.n + 1
        self.sem_fizz.release()
        self.sem_buzz.release()
        self.sem_fizzbuzz.release()`,
    jsCode: `var FizzBuzz = function(n) {
    this.n = n;
    this.current = 1;
};

FizzBuzz.prototype.fizz = async function(printFizz) {
    while (this.current <= this.n) {
        if (this.current % 3 === 0 && this.current % 5 !== 0) {
            printFizz();
            this.current++;
        }
        await new Promise(r => setTimeout(r, 0));
    }
};

FizzBuzz.prototype.buzz = async function(printBuzz) {
    while (this.current <= this.n) {
        if (this.current % 5 === 0 && this.current % 3 !== 0) {
            printBuzz();
            this.current++;
        }
        await new Promise(r => setTimeout(r, 0));
    }
};

FizzBuzz.prototype.fizzbuzz = async function(printFizzBuzz) {
    while (this.current <= this.n) {
        if (this.current % 15 === 0) {
            printFizzBuzz();
            this.current++;
        }
        await new Promise(r => setTimeout(r, 0));
    }
};

FizzBuzz.prototype.number = async function(printNumber) {
    while (this.current <= this.n) {
        if (this.current % 3 !== 0 && this.current % 5 !== 0) {
            printNumber(this.current);
            this.current++;
        }
        await new Promise(r => setTimeout(r, 0));
    }
};`,
    explanation:
      '1. Four worker threads each loop forever, waiting on their respective semaphore.\n' +
      '2. The number() thread is the dispatcher: for each i, it checks divisibility and releases the correct semaphore.\n' +
      '3. The dispatched worker prints, then signals done so the dispatcher can move to the next number.\n' +
      '4. For plain numbers, the number() thread handles printing itself.\n' +
      '5. After the loop, number() signals all workers to exit by setting current > n and releasing their semaphores.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'One thread must be the "driver" that sequences through 1..n.',
      'Check %15 BEFORE %3 and %5 to handle the fizzbuzz case correctly.',
      'Each worker needs a way to know when to terminate (check current > n).',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1226. The Dining Philosophers
  // ---------------------------------------------------------------------------
  {
    id: 1226,
    description:
      'Five philosophers sit at a round table. Between each pair is a fork (5 forks total). A philosopher must pick up both adjacent forks to eat. Design a deadlock-free solution where each philosopher can think and eat.',
    examples:
      'Input: n = 1 (each philosopher eats once)\nOutput: Each philosopher successfully picks up both forks, eats, and puts them down.',
    intuition:
      'The classic deadlock scenario: if all 5 philosophers pick up their left fork at the same time, everyone waits for their right fork forever. There are several ways to break the deadlock:\n\n1. RESOURCE ORDERING: Make one philosopher (say #4) pick up forks in the opposite order (right first, then left). This breaks the circular wait.\n\n2. LIMIT CONCURRENCY: Only allow 4 philosophers to attempt eating at once (using a semaphore). With 5 forks and at most 4 hungry philosophers, at least one can always get both forks.\n\n3. TRY-LOCK: Pick up left fork, try right fork - if unavailable, put left fork down and retry.\n\nThe semaphore approach (#2) is simplest and most elegant.',
    approach:
      'Use a Semaphore(4) to limit concurrent eaters to 4. Each philosopher acquires the semaphore, picks up left fork, picks up right fork, eats, puts down forks, releases the semaphore. With at most 4 competing for 5 forks, deadlock is impossible.',
    code: `import threading

class DiningPhilosophers:
    def __init__(self):
        self.forks = [threading.Lock() for _ in range(5)]
        self.limit = threading.Semaphore(4)  # max 4 eating at once

    def wantsToEat(self, philosopher, pickLeftFork, pickRightFork,
                   eat, putLeftFork, putRightFork):
        left = philosopher
        right = (philosopher + 1) % 5

        self.limit.acquire()           # at most 4 philosophers try

        self.forks[left].acquire()     # pick up left fork
        pickLeftFork()

        self.forks[right].acquire()    # pick up right fork
        pickRightFork()

        eat()

        putLeftFork()
        self.forks[left].release()

        putRightFork()
        self.forks[right].release()

        self.limit.release()           # let another philosopher try`,
    jsCode: `// JS model using async locks
class DiningPhilosophers {
    constructor() {
        this.forks = Array.from({length: 5}, () => ({locked: false, queue: []}));
        this.seats = 4; // limit concurrency
    }

    async acquireFork(i) {
        while (this.forks[i].locked) {
            await new Promise(r => this.forks[i].queue.push(r));
        }
        this.forks[i].locked = true;
    }

    releaseFork(i) {
        this.forks[i].locked = false;
        if (this.forks[i].queue.length > 0) {
            this.forks[i].queue.shift()();
        }
    }

    async wantsToEat(philosopher, pickLeftFork, pickRightFork,
                     eat, putLeftFork, putRightFork) {
        const left = philosopher;
        const right = (philosopher + 1) % 5;

        await this.acquireFork(left);
        pickLeftFork();
        await this.acquireFork(right);
        pickRightFork();
        eat();
        putLeftFork();
        this.releaseFork(left);
        putRightFork();
        this.releaseFork(right);
    }
}`,
    explanation:
      '1. Each fork is a Lock (mutex) - only one philosopher can hold it at a time.\n' +
      '2. The Semaphore(4) is the key deadlock prevention: with 5 forks and at most 4 hungry philosophers, pigeonhole principle guarantees at least one can get both forks.\n' +
      '3. Each philosopher: acquire semaphore -> left fork -> right fork -> eat -> release both forks -> release semaphore.\n' +
      '4. Why this works: Deadlock requires circular wait among ALL participants. With one "seat" removed, the cycle cannot form.\n' +
      '5. Alternative: resource ordering (philosopher 4 picks right fork first) also works by breaking the circular dependency.',
    timeComplexity: 'O(1) per eat action (excluding wait time)',
    spaceComplexity: 'O(1)',
    hints: [
      'Deadlock needs 4 conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one.',
      'Limiting to 4 concurrent eaters with 5 forks guarantees at least one always gets both.',
      'The Semaphore(4) approach is simpler than resource ordering and equally correct.',
    ],
  },
];
