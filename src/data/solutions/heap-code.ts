export const minHeapJavascript = `class MinHeap {
    constructor(compare = (left, right) => left - right) {
        this.items = [];
        this.compare = compare;
    }

    size() { return this.items.length; }
    isEmpty() { return this.items.length === 0; }
    front() { return this.items[0]; }

    enqueue(value) {
        this.items.push(value);
        let index = this.items.length - 1;
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(this.items[parent], this.items[index]) <= 0) break;
            [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
            index = parent;
        }
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const first = this.items[0];
        const last = this.items.pop();
        if (!this.isEmpty()) {
            this.items[0] = last;
            let index = 0;
            while (true) {
                const left = index * 2 + 1;
                const right = left + 1;
                let smallest = index;
                if (left < this.size() && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
                if (right < this.size() && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
                if (smallest === index) break;
                [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
                index = smallest;
            }
        }
        return first;
    }
}

`;
