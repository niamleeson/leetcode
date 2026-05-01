import { neetcodeTopics, NeetCodeTopic } from './neetcode250';

/**
 * NeetCode Blind 75 — the classic 75-problem study list.
 *
 * Built by filtering the NeetCode 250 topics down to the Blind 75 problem IDs,
 * so templates, pseudocode, and solutions stay in sync with the 250 dataset.
 */

const BLIND_75_IDS = new Set<number>([
  // Arrays & Hashing (8)
  217, 242, 1, 49, 347, 271, 238, 128,
  // Two Pointers (3)
  125, 15, 11,
  // Sliding Window (4)
  121, 3, 424, 76,
  // Stack (1)
  20,
  // Binary Search (2)
  153, 33,
  // Linked List (6)
  206, 21, 143, 19, 141, 23,
  // Trees (11)
  226, 104, 100, 572, 235, 102, 98, 230, 105, 124, 297,
  // Tries (3)
  208, 211, 212,
  // Heap / Priority Queue (1)
  295,
  // Backtracking (2)
  39, 79,
  // Graphs (6)
  200, 133, 417, 207, 323, 261,
  // Advanced Graphs (1)
  269,
  // 1-D Dynamic Programming (10)
  70, 198, 213, 5, 647, 91, 322, 152, 139, 300,
  // 2-D Dynamic Programming (2)
  62, 1143,
  // Greedy (2)
  53, 55,
  // Intervals (5)
  57, 56, 435, 252, 253,
  // Math & Geometry (3)
  48, 54, 73,
  // Bit Manipulation (5)
  191, 338, 190, 268, 371,
]);

function filterTopic(topic: NeetCodeTopic): NeetCodeTopic | null {
  const problems = topic.problems.filter((p) => BLIND_75_IDS.has(p.id));
  if (problems.length === 0) return null;

  const templates = topic.templates
    .map((tpl) => ({
      ...tpl,
      problemIds: tpl.problemIds.filter((id) => BLIND_75_IDS.has(id)),
    }))
    .filter((tpl) => tpl.problemIds.length > 0);

  return { name: topic.name, templates, problems };
}

export const blind75Topics: NeetCodeTopic[] = neetcodeTopics
  .map(filterTopic)
  .filter((t): t is NeetCodeTopic => t !== null);

export const BLIND_75_PROBLEM_COUNT = BLIND_75_IDS.size;
