// Shared by the Advanced Graphs reference and the walkthrough recorder.
export const graphMinHeapJavascript = `class MinHeap {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  push(value) {
    const heap = this.heap;
    heap.push(value);

    let i = heap.length - 1;

    // Move up until the parent has a smaller or equal distance.
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      if (heap[parent][0] <= heap[i][0]) break;

      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  pop() {
    const heap = this.heap;
    if (heap.length === 0) return undefined;

    const min = heap[0];
    const last = heap.pop();

    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;

      // Move down, swapping with the smaller child.
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;

        if (left < heap.length && heap[left][0] < heap[smallest][0]) {
          smallest = left;
        }

        if (right < heap.length && heap[right][0] < heap[smallest][0]) {
          smallest = right;
        }

        if (smallest === i) break;

        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }

    return min;
  }
}`;

export const sharedGraphHeapProblemIds = [1631, 743, 778];
