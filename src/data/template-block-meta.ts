export interface TemplateBlockMeta {
  title: string;
  statement: string;
  codeStart: string;       // marker to find block start in Python template
  jsCodeStart?: string;    // marker for JS templates (if different from auto-converted codeStart)
  jsOnly?: boolean;
  pyOnly?: boolean;
}

/**
 * Split a template string into code blocks using marker-based boundaries.
 * Each block's code starts where its marker appears and ends where the next marker starts.
 * The first block includes any preamble (imports, class definitions) before its marker.
 */
export function splitTemplateByBlocks(
  template: string,
  allBlocks: TemplateBlockMeta[],
  language: 'python' | 'javascript'
): { blocks: TemplateBlockMeta[]; codes: string[] } {
  const isJs = language === 'javascript';
  const relevant = allBlocks.filter(b => isJs ? !b.pyOnly : !b.jsOnly);

  if (!relevant.length) {
    return { blocks: [], codes: [template] };
  }

  const markers = relevant.map(b => {
    if (isJs && b.jsCodeStart) return b.jsCodeStart;
    if (isJs) return b.codeStart.replace(/^# /, '// ');
    return b.codeStart;
  });

  const indices = markers.map(m => template.indexOf(m));

  // If any marker not found, fall back to single block
  if (indices.some(idx => idx === -1)) {
    return { blocks: [], codes: [template] };
  }

  const codes: string[] = [];
  for (let i = 0; i < indices.length; i++) {
    const start = i === 0 ? 0 : indices[i];
    const end = i < indices.length - 1 ? indices[i + 1] : template.length;
    codes.push(template.slice(start, end).trimEnd());
  }

  return { blocks: relevant, codes };
}

export const templateBlockMeta: Record<string, TemplateBlockMeta[]> = {
  'Arrays & Hashing': [
    {
      title: 'LC 1: Two Sum',
      statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      codeStart: '# Two Sum pattern',
      jsCodeStart: '// Two Sum pattern',
    },
    {
      title: 'LC 347: Top K Frequent Elements',
      statement: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
      codeStart: '# Frequency count pattern',
      jsCodeStart: '// Frequency count pattern',
    },
    {
      title: 'LC 560: Subarray Sum Equals K',
      statement: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
      codeStart: '# Prefix sum pattern',
      jsCodeStart: '// Prefix sum pattern',
    },
    {
      title: 'LC 238: Product of Array Except Self',
      statement: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i], without using division.',
      codeStart: '# Prefix/Suffix Products',
      jsCodeStart: '// Prefix/Suffix Products',
      jsOnly: true,
    },
  ],

  'Two Pointers': [
    {
      title: 'LC 167: Two Sum II',
      statement: 'Given a 1-indexed array of integers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.',
      codeStart: '# Opposite direction',
      jsCodeStart: '// Opposite direction',
    },
    {
      title: 'LC 15: 3Sum',
      statement: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.',
      codeStart: '# 3Sum pattern',
      jsCodeStart: '// 3Sum pattern',
    },
    {
      title: 'LC 26: Remove Duplicates from Sorted Array',
      statement: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.',
      codeStart: '# Partition - remove duplicates',
      jsCodeStart: '// Partition - remove duplicates',
    },
    {
      title: 'LC 42: Trapping Rain Water',
      statement: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
      codeStart: '# Trapping Rain Water',
      jsCodeStart: '// Trapping Rain Water',
      jsOnly: true,
    },
  ],

  'Sliding Window': [
    {
      title: 'LC 3: Longest Substring Without Repeating Characters',
      statement: 'Given a string s, find the length of the longest substring without repeating characters.',
      codeStart: '# Variable window - longest substring',
      jsCodeStart: '// Variable window - longest substring',
    },
    {
      title: 'LC 76: Minimum Window Substring',
      statement: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.',
      codeStart: '# Variable window - minimum window',
      jsCodeStart: '// Variable window - minimum window',
    },
    {
      title: 'Fixed Window: Max Sum Subarray of Size K',
      statement: 'Given an array of integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.',
      codeStart: '# Fixed window - max sum',
      jsCodeStart: '// Fixed window - max sum',
    },
  ],

  'Stack': [
    {
      title: 'LC 20: Valid Parentheses',
      statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if every open bracket is closed by the same type and in the correct order.",
      codeStart: '# Valid parentheses',
      jsCodeStart: '// Valid parentheses',
    },
    {
      title: 'LC 739: Daily Temperatures',
      statement: 'Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day with a warmer temperature, answer[i] == 0.',
      codeStart: '# Monotonic stack - daily temperatures',
      jsCodeStart: '// Monotonic stack - daily temperatures',
    },
    {
      title: 'LC 150: Evaluate Reverse Polish Notation',
      statement: 'You are given an array of strings tokens that represents an arithmetic expression in Reverse Polish Notation. Evaluate the expression and return an integer that represents the value of the expression.',
      codeStart: '# Evaluate reverse polish notation',
      jsCodeStart: '// Evaluate reverse polish notation',
    },
  ],

  'Binary Search': [
    {
      title: 'The Generalized Template',
      statement: 'Most binary search problems reduce to: "Minimize k s.t. condition(k) is True." Customize boundaries, condition function, and return value.',
      codeStart: '# ═══ THE GENERALIZED TEMPLATE',
      jsCodeStart: '// ═══ THE GENERALIZED TEMPLATE',
    },
    {
      title: 'Applications of the Template',
      statement: 'Search Insert Position (condition: nums[k] >= target), Sqrt(x) (condition: k² > x, return k-1), and Koko Eating Bananas (condition: canFinish(speed)).',
      codeStart: '# ═══ APPLICATIONS',
      jsCodeStart: '// ═══ APPLICATIONS',
    },
    {
      title: 'Exact Match & Rotated Array',
      statement: 'Classic exact-match binary search (while left <= right) and search in rotated sorted array — these use a different template from the generalized form.',
      codeStart: '# ═══ EXACT MATCH',
      jsCodeStart: '// ═══ EXACT MATCH',
    },
  ],

  'Linked List': [
    {
      title: 'LC 206: Reverse Linked List',
      statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      codeStart: '# Reverse a linked list',
      jsCodeStart: '// Reverse a linked list',
    },
    {
      title: 'LC 141: Linked List Cycle',
      statement: "Given head, the head of a linked list, determine if the linked list has a cycle in it using Floyd's Tortoise and Hare algorithm.",
      codeStart: '# Detect cycle',
      jsCodeStart: '// Detect cycle',
    },
    {
      title: 'LC 876: Middle of the Linked List',
      statement: 'Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.',
      codeStart: '# Find middle',
      jsCodeStart: '// Find middle',
    },
    {
      title: 'LC 21: Merge Two Sorted Lists',
      statement: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together the nodes of the first two lists.',
      codeStart: '# Merge two sorted lists',
      jsCodeStart: '// Merge two sorted lists',
    },
    {
      title: 'LC 19: Remove Nth Node From End of List',
      statement: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
      codeStart: '# Remove nth node from end',
      jsCodeStart: '// Remove nth node from end',
    },
  ],

  'Trees': [
    {
      title: 'LC 104: Maximum Depth of Binary Tree',
      statement: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
      codeStart: '# DFS - maximum depth',
      jsCodeStart: '// DFS - maximum depth',
    },
    {
      title: 'LC 102: Binary Tree Level Order Traversal',
      statement: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
      codeStart: '# BFS - level order',
      jsCodeStart: '// BFS - level order',
    },
    {
      title: 'LC 98: Validate Binary Search Tree',
      statement: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has all left subtree values less than the node and all right subtree values greater.',
      codeStart: '# Validate BST',
      jsCodeStart: '// Validate BST',
    },
    {
      title: 'LC 236: Lowest Common Ancestor',
      statement: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree. The LCA is the lowest node that has both p and q as descendants.',
      codeStart: '# Lowest common ancestor',
      jsCodeStart: '// Lowest common ancestor',
    },
    {
      title: 'LC 543: Diameter of Binary Tree',
      statement: 'Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes in the tree.',
      codeStart: '# Diameter of binary tree',
      jsCodeStart: '// Diameter of binary tree',
    },
  ],

  'Tries': [
    {
      title: 'LC 208: Implement Trie (Prefix Tree)',
      statement: 'A trie (prefix tree) is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with insert, search, and startsWith methods.',
      codeStart: 'class TrieNode',
      jsCodeStart: 'class TrieNode',
    },
  ],

  'Heap / Priority Queue': [
    {
      title: 'MinHeap Implementation',
      statement: 'JavaScript lacks a built-in heap. This MinHeap class provides O(log n) push/pop operations needed for priority queue problems.',
      codeStart: '# MinHeap',
      jsCodeStart: '// JavaScript doesn\'t have a built-in heap.',
      jsOnly: true,
    },
    {
      title: 'LC 347: Top K Frequent Elements',
      statement: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
      codeStart: '# Top K frequent elements',
      jsCodeStart: '// Top K frequent elements',
    },
    {
      title: 'LC 23: Merge k Sorted Lists',
      statement: 'You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.',
      codeStart: '# Merge K sorted lists',
      pyOnly: true,
    },
    {
      title: 'LC 295: Find Median from Data Stream',
      statement: 'Implement the MedianFinder class that supports addNum(num) and findMedian(). findMedian returns the median of all elements so far. Use two heaps: a max-heap for the lower half and a min-heap for the upper half.',
      codeStart: '# Find median from data stream',
      pyOnly: true,
    },
  ],

  'Backtracking': [
    {
      title: 'LC 78: Subsets',
      statement: 'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
      codeStart: '# Subsets',
      jsCodeStart: '// Subsets',
    },
    {
      title: 'LC 46: Permutations',
      statement: 'Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.',
      codeStart: '# Permutations',
      jsCodeStart: '// Permutations',
    },
    {
      title: 'LC 39: Combination Sum',
      statement: 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen an unlimited number of times.',
      codeStart: '# Combination Sum',
      jsCodeStart: '// Combination Sum',
    },
    {
      title: 'LC 51: N-Queens',
      statement: 'Place n queens on an n x n chessboard such that no two queens attack each other. Return all distinct solutions as board configurations.',
      codeStart: '# N-Queens',
      jsCodeStart: '// N-Queens',
    },
  ],

  'Graphs': [
    {
      title: 'LC 200: Number of Islands',
      statement: 'Given an m x n 2D binary grid which represents a map of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      codeStart: '# BFS - number of islands',
      jsCodeStart: '// BFS - number of islands',
    },
    {
      title: 'LC 207: Course Schedule',
      statement: 'There are numCourses courses labeled from 0 to numCourses - 1 with prerequisite pairs. Return the ordering of courses you should take to finish all courses. Uses Kahn\'s algorithm (BFS-based topological sort).',
      codeStart: '# Topological sort (Kahn\'s algorithm)',
      jsCodeStart: '// Topological sort (Kahn\'s algorithm)',
    },
    {
      title: 'LC 743: Network Delay Time',
      statement: 'You are given a network of n nodes and weighted directed edges. A signal is sent from node k. Return the minimum time for all n nodes to receive the signal, or -1 if impossible. Uses Dijkstra\'s algorithm.',
      codeStart: '# Dijkstra\'s shortest path',
      jsCodeStart: '// Dijkstra\'s shortest path',
    },
    {
      title: 'LC 994: Rotting Oranges',
      statement: 'In a grid, every minute each fresh orange adjacent to a rotten orange becomes rotten. Return the minimum number of minutes until no cell has a fresh orange. If impossible, return -1. Uses multi-source BFS.',
      codeStart: '# Multi-source BFS',
      jsCodeStart: '// Multi-source BFS (Rotting Oranges pattern)',
      jsOnly: true,
    },
    {
      title: 'LC 133: Clone Graph',
      statement: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a value and a list of its neighbors. Uses DFS/BFS with a HashMap mapping old nodes to new nodes.',
      codeStart: '# Clone Graph',
      jsCodeStart: '// Clone Graph (DFS + HashMap)',
      jsOnly: true,
    },
  ],

  'Dynamic Programming': [
    {
      title: 'LC 198: House Robber',
      statement: 'Given an integer array nums representing money at each house along a street, return the maximum amount you can rob without robbing two adjacent houses.',
      codeStart: '# 1D DP - House Robber',
      jsCodeStart: '// 1D DP - House Robber',
    },
    {
      title: 'LC 1143: Longest Common Subsequence',
      statement: 'Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is derived by deleting some (or no) characters without changing the relative order of remaining characters.',
      codeStart: '# 2D DP - Longest Common Subsequence',
      jsCodeStart: '// 2D DP - Longest Common Subsequence',
    },
    {
      title: 'LC 322: Coin Change',
      statement: 'Given an integer array coins and an amount, return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1. This is the unbounded knapsack pattern.',
      codeStart: '# Knapsack - Coin Change',
      jsCodeStart: '// Knapsack - Coin Change',
    },
    {
      title: 'LC 300: Longest Increasing Subsequence (Top-Down)',
      statement: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. This version uses top-down recursion with memoization.',
      codeStart: '# Top-down with memoization',
      pyOnly: true,
    },
    {
      title: 'LC 416: Partition Equal Subset Sum',
      statement: 'Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal. This is the 0/1 knapsack pattern.',
      codeStart: '# 0/1 Knapsack - Partition Equal',
      jsCodeStart: '// 0/1 Knapsack - Partition Equal',
    },
    {
      title: 'LC 53: Maximum Subarray',
      statement: "Given an integer array nums, find the subarray with the largest sum, and return its sum. Uses Kadane's algorithm: extend or restart the current subarray at each element.",
      codeStart: '# Kadane\'s Algorithm',
      jsCodeStart: '// Kadane\'s Algorithm',
      jsOnly: true,
    },
    {
      title: 'LC 72: Edit Distance',
      statement: 'Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) required to convert word1 into word2.',
      codeStart: '# Edit Distance',
      jsCodeStart: '// Edit Distance',
      jsOnly: true,
    },
    {
      title: 'LC 300: Longest Increasing Subsequence',
      statement: 'Given an integer array nums, return the length of the longest strictly increasing subsequence. This O(n log n) version maintains a tails array with binary search.',
      codeStart: '# Longest Increasing Subsequence (Binary Search',
      jsCodeStart: '// Longest Increasing Subsequence (Binary Search',
      jsOnly: true,
    },
    {
      title: 'LC 309: Best Time to Buy and Sell Stock with Cooldown',
      statement: 'Given an array prices where prices[i] is the price of a stock on day i, find the maximum profit with the constraint that after selling, you must wait one day before buying again. Uses state machine DP.',
      codeStart: '# Buy/Sell Stock',
      jsCodeStart: '// Buy/Sell Stock',
      jsOnly: true,
    },
  ],

  'Greedy': [
    {
      title: 'LC 55: Jump Game',
      statement: 'Given an integer array nums where nums[i] represents the maximum jump length from position i, determine if you can reach the last index starting from the first index.',
      codeStart: '# Jump Game',
      jsCodeStart: '// Jump Game',
    },
    {
      title: 'LC 435: Non-overlapping Intervals',
      statement: 'Given an array of intervals, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.',
      codeStart: '# Non-overlapping intervals',
      jsCodeStart: '// Non-overlapping intervals',
    },
    {
      title: 'LC 763: Partition Labels',
      statement: 'Given a string s, partition it into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.',
      codeStart: '# Partition Labels',
      jsCodeStart: '// Partition Labels',
    },
    {
      title: 'LC 134: Gas Station',
      statement: 'There are n gas stations along a circular route. Given gas[i] and cost[i], return the starting gas station index to complete the circuit, or -1 if impossible.',
      codeStart: '# Gas Station',
      jsCodeStart: '// Gas Station',
    },
  ],

  'Intervals': [
    {
      title: 'LC 56: Merge Intervals',
      statement: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
      codeStart: '# Merge Intervals',
      jsCodeStart: '// Merge Intervals',
    },
    {
      title: 'LC 57: Insert Interval',
      statement: 'Given a sorted array of non-overlapping intervals and a new interval, insert the new interval and merge if necessary. Return the resulting array of non-overlapping intervals.',
      codeStart: '# Insert Interval',
      jsCodeStart: '// Insert Interval',
    },
    {
      title: 'LC 253: Meeting Rooms II',
      statement: 'Given an array of meeting time intervals, return the minimum number of conference rooms required. Equivalent to finding the maximum number of overlapping intervals at any point.',
      codeStart: '# Meeting Rooms II',
      jsCodeStart: '// Meeting Rooms II',
    },
  ],

  'Math & Geometry': [
    {
      title: 'LC 48: Rotate Image',
      statement: 'Given an n x n 2D matrix representing an image, rotate the image by 90 degrees clockwise in-place. The approach: transpose the matrix, then reverse each row.',
      codeStart: '# Rotate image 90',
      jsCodeStart: '// Rotate image 90',
    },
    {
      title: 'LC 54: Spiral Matrix',
      statement: 'Given an m x n matrix, return all elements of the matrix in spiral order. Use four boundaries (top, bottom, left, right) and shrink them after each pass.',
      codeStart: '# Spiral order',
      jsCodeStart: '// Spiral order',
    },
    {
      title: 'LC 50: Pow(x, n)',
      statement: 'Implement pow(x, n), which calculates x raised to the power n. Uses fast exponentiation: square x and halve n repeatedly for O(log n) time.',
      codeStart: '# Fast power',
      jsCodeStart: '// Fast power',
    },
  ],

  'Bit Manipulation': [
    {
      title: 'LC 136: Single Number',
      statement: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. XOR all elements: pairs cancel out, leaving the unique element.',
      codeStart: '# Single Number',
      jsCodeStart: '// Single Number',
    },
    {
      title: 'LC 191: Number of 1 Bits',
      statement: 'Given a positive integer n, return the number of set bits (1s) in its binary representation. Uses the trick: n & (n-1) removes the lowest set bit.',
      codeStart: '# Number of 1 bits',
      jsCodeStart: '// Number of 1 bits',
    },
    {
      title: 'LC 338: Counting Bits',
      statement: 'Given an integer n, return an array ans of length n + 1 such that ans[i] is the number of 1s in the binary representation of i, for each 0 <= i <= n.',
      codeStart: '# Counting bits',
      jsCodeStart: '// Counting bits',
    },
    {
      title: 'LC 190: Reverse Bits',
      statement: 'Reverse the bits of a given 32-bit unsigned integer. Process each bit from the input and build the reversed result by shifting.',
      codeStart: '# Reverse bits',
      jsCodeStart: '// Reverse bits',
    },
  ],

  'Union Find': [
    {
      title: 'Union-Find Data Structure',
      statement: 'The Union-Find (Disjoint Set Union) data structure tracks elements partitioned into disjoint sets. Supports near-O(1) union and find operations with path compression and union by rank.',
      codeStart: 'class UnionFind',
      jsCodeStart: 'class UnionFind',
    },
    {
      title: 'LC 323: Number of Connected Components',
      statement: 'Given n nodes labeled from 0 to n-1 and a list of undirected edges, return the number of connected components in the graph.',
      codeStart: '# Usage: connected components',
      jsCodeStart: '// Count connected components',
    },
    {
      title: 'LC 684: Redundant Connection',
      statement: 'Given a graph that started as a tree with one additional edge, find the edge that can be removed so that the resulting graph is a tree. If union returns false, the edge creates a cycle.',
      codeStart: '# Usage: cycle detection',
      jsCodeStart: '// Detect a cycle',
    },
  ],

  'Monotonic Queue': [
    {
      title: 'LC 239: Sliding Window Maximum',
      statement: 'Given an array nums and a sliding window of size k, return the max value in each window position as the window slides from left to right. Uses a monotonic decreasing deque.',
      codeStart: '# Sliding Window Maximum',
      jsCodeStart: '// Sliding Window Maximum',
    },
    {
      title: 'Sliding Window Minimum',
      statement: 'Variant of sliding window maximum: find the minimum value in each window. Same deque approach but maintain increasing order instead of decreasing.',
      codeStart: '# Sliding Window Minimum',
      jsCodeStart: '// Sliding Window Minimum',
    },
    {
      title: 'LC 1438: Longest Subarray with Abs Diff <= Limit',
      statement: 'Given an array of integers nums and an integer limit, return the size of the longest non-empty subarray such that the absolute difference between any two elements is less than or equal to limit.',
      codeStart: '# Longest subarray where max - min',
      jsCodeStart: '// Longest subarray where max - min',
    },
  ],

  'Divide & Conquer': [
    {
      title: 'LC 912: Sort an Array (Merge Sort)',
      statement: 'Given an array of integers nums, sort the array in ascending order using merge sort. Divide the array in half, recursively sort each half, then merge the two sorted halves.',
      codeStart: '# Merge Sort',
      jsCodeStart: '// Merge Sort',
    },
    {
      title: 'LC 215: Kth Largest Element (Quick Select)',
      statement: 'Given an integer array nums and an integer k, return the kth largest element. Quick Select uses a pivot-based partition to find the kth element in O(n) average time.',
      codeStart: '# Quick Select',
      jsCodeStart: '// Quick Select',
    },
    {
      title: 'Count Inversions (Modified Merge Sort)',
      statement: 'Count the number of inversions in an array (pairs where i < j but nums[i] > nums[j]). Uses modified merge sort: during the merge step, count how many elements from the right half are placed before elements from the left half.',
      codeStart: '# Count inversions',
      jsCodeStart: '// Count inversions using modified merge sort',
    },
  ],

  'Segment Tree': [
    {
      title: 'LC 307: Range Sum Query - Mutable',
      statement: 'Implement a data structure that supports updating the value of an element and querying the sum of a range of elements. The segment tree provides O(log n) for both operations.',
      codeStart: 'class SegmentTree',
      jsCodeStart: 'class SegmentTree',
    },
  ],

  'String Algorithms': [
    {
      title: 'LC 28: KMP Pattern Matching',
      statement: 'Given two strings text and pattern, find all occurrences of pattern in text. KMP preprocesses the pattern into an LPS (Longest Proper Prefix which is also Suffix) array to skip redundant comparisons, achieving O(n+m) time.',
      codeStart: '# KMP - pattern matching',
      jsCodeStart: '// KMP - pattern matching',
    },
    {
      title: 'Rabin-Karp Rolling Hash',
      statement: 'Find a pattern in text using a rolling hash function. Compute the hash of the pattern and slide a window across the text, updating the hash in O(1) per step. Achieves O(n+m) average time.',
      codeStart: '# Rabin-Karp - rolling hash',
      jsCodeStart: '// Rabin-Karp - rolling hash',
    },
  ],

  'Minimum Spanning Tree': [
    {
      title: "LC 1584: Kruskal's Algorithm",
      statement: "Given n points in a 2D plane, return the minimum cost to connect all points. Kruskal's algorithm sorts all edges by weight and greedily adds them using Union-Find to avoid cycles.",
      codeStart: "# Kruskal's Algorithm",
      jsCodeStart: "// Kruskal's Algorithm",
    },
    {
      title: "LC 1584: Prim's Algorithm",
      statement: "Alternative MST algorithm. Prim's grows the tree from a starting node, always adding the cheapest edge that connects a new node to the existing tree. Uses a priority queue.",
      codeStart: "# Prim's Algorithm",
      jsCodeStart: "// Prim's Algorithm",
    },
  ],

  'Topological Sort': [
    {
      title: "LC 210: Kahn's Algorithm (BFS Topological Sort)",
      statement: "Given a directed graph, return a valid topological ordering. Kahn's algorithm repeatedly removes nodes with no incoming edges (in-degree 0), processing them in BFS order.",
      codeStart: "# Kahn's Algorithm",
      jsCodeStart: "// Kahn's Algorithm",
    },
    {
      title: 'LC 207: Course Schedule',
      statement: 'There are numCourses courses with prerequisites. Return true if you can finish all courses (i.e., no cycle exists in the dependency graph).',
      codeStart: '# Course Schedule (can finish',
      jsCodeStart: '// Course Schedule',
    },
    {
      title: 'LC 210: Course Schedule II',
      statement: 'Return the ordering of courses you should take to finish all courses. If there are multiple valid answers, return any of them. If impossible, return an empty array.',
      codeStart: '# Course Schedule II',
      pyOnly: true,
    },
    {
      title: 'DFS-based Topological Sort',
      statement: 'Alternative to Kahn\'s: use DFS with 3-state coloring (unvisited, in-progress, done). Add nodes to result in post-order (after all descendants), then reverse. Detects cycles via back edges.',
      codeStart: '# DFS-based topological sort',
      jsCodeStart: '// DFS-based topological sort',
    },
  ],

  'Monotonic Stack': [
    {
      title: 'LC 496: Next Greater Element',
      statement: 'For each element in the array, find the next element that is greater than it. If no such element exists, output -1. Uses a stack to track elements waiting for their next greater.',
      codeStart: '# Next Greater Element',
      jsCodeStart: '// Next Greater Element',
    },
    {
      title: 'LC 739: Daily Temperatures',
      statement: 'Given an array of temperatures, for each day find how many days until a warmer temperature. Uses a monotonic decreasing stack of indices.',
      codeStart: '# Daily Temperatures',
      jsCodeStart: '// Daily Temperatures',
    },
    {
      title: 'LC 84: Largest Rectangle in Histogram',
      statement: 'Given an array of integers heights representing the histogram\'s bar heights where the width of each bar is 1, return the area of the largest rectangle in the histogram.',
      codeStart: '# Largest Rectangle in Histogram',
      jsCodeStart: '// Largest Rectangle in Histogram',
    },
    {
      title: 'LC 42: Trapping Rain Water (Stack)',
      statement: 'Compute how much water can be trapped after raining using a stack-based approach. The stack tracks bars that form potential "valleys" where water can be held.',
      codeStart: '# Trapping Rain Water',
      jsCodeStart: '// Trapping Rain Water',
    },
  ],

  'Binary Indexed Tree': [
    {
      title: 'BIT (Fenwick Tree) Data Structure',
      statement: 'A Binary Indexed Tree provides O(log n) point updates and prefix sum queries. Each node stores the sum of a range determined by the lowest set bit of its index.',
      codeStart: 'class BIT',
      jsCodeStart: 'class BIT',
    },
    {
      title: 'Build BIT from Array',
      statement: 'Initialize a BIT from an existing array by calling update for each element. This is an O(n log n) construction.',
      codeStart: '# Build from array',
      pyOnly: true,
    },
    {
      title: 'LC 307: Range Sum Query - Mutable',
      statement: 'Implement a data structure that supports update(index, val) and sumRange(left, right) operations efficiently using a BIT.',
      codeStart: '# Range Sum Query - Mutable',
      jsCodeStart: '// Range Sum Query - Mutable',
    },
    {
      title: 'Count Inversions using BIT',
      statement: 'Count inversions (pairs where i < j but nums[i] > nums[j]) by processing elements right to left and using a BIT as a frequency table to count how many smaller elements have been seen to the right.',
      codeStart: '# Count inversions using BIT',
      jsCodeStart: '// Count inversions using BIT',
    },
  ],

  'Concurrency': [
    {
      title: 'LC 1114: Print in Order',
      statement: 'Three threads call first(), second(), and third() concurrently. Design a mechanism to ensure they execute in order: first, then second, then third. Uses event/promise gates between steps.',
      codeStart: '# TEMPLATE 1: Sequential Ordering',
      jsCodeStart: '// TEMPLATE 1: Sequential Ordering',
    },
    {
      title: 'LC 1115: Print FooBar Alternately',
      statement: 'Two threads call foo() and bar() repeatedly. Design a mechanism so that "foobar" is printed n times in order. Uses two semaphores in a ping-pong pattern.',
      codeStart: '# TEMPLATE 2: Alternating',
      jsCodeStart: '// TEMPLATE 2: Alternating',
    },
    {
      title: 'LC 1188: Bounded Blocking Queue',
      statement: 'Design a thread-safe bounded blocking queue that supports enqueue and dequeue operations. Uses a lock for mutual exclusion and two semaphores to track empty slots and available items.',
      codeStart: '# TEMPLATE 3: Producer-Consumer',
      jsCodeStart: '// TEMPLATE 3: Producer-Consumer',
    },
    {
      title: 'LC 1226: The Dining Philosophers',
      statement: 'Five philosophers sit at a round table. Each needs two forks to eat. Prevent deadlock by limiting concurrent diners to n-1 using a semaphore, breaking the circular wait condition.',
      codeStart: '# TEMPLATE 4: Deadlock Prevention',
      pyOnly: true,
    },
    {
      title: 'LC 1117: Building H2O',
      statement: 'There are two kinds of threads: oxygen and hydrogen. Design a barrier mechanism that groups exactly two hydrogen threads and one oxygen thread before they proceed. Uses semaphores for ratio control.',
      codeStart: '# TEMPLATE 5: Barrier Grouping',
      pyOnly: true,
    },
    {
      title: 'Web Workers (True Parallelism)',
      statement: 'JavaScript runs single-threaded but Web Workers provide true parallelism. Workers run in separate threads and communicate via message passing (postMessage/onmessage). Useful for CPU-intensive tasks.',
      codeStart: '// TEMPLATE 4: Web Workers',
      jsCodeStart: '// TEMPLATE 4: Web Workers',
      jsOnly: true,
    },
  ],
};
