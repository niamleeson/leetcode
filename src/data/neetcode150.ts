import { neetcodeTopics, NeetCodeTopic } from './neetcode250';

/**
 * NeetCode 150 — the curated middle list between Blind 75 and the full 250.
 *
 * Built by filtering NeetCode 250 topics down to the 150 IDs, so templates,
 * pseudocode, and solutions stay in sync with the 250 dataset.
 */

const NEETCODE_150_IDS = new Set<number>([
  // Arrays & Hashing (9)
  217, 242, 1, 49, 347, 271, 238, 36, 128,
  // Two Pointers (5)
  125, 167, 15, 11, 42,
  // Sliding Window (6)
  121, 3, 424, 567, 76, 239,
  // Stack (7)
  20, 155, 150, 22, 739, 853, 84,
  // Binary Search (7)
  704, 74, 875, 153, 33, 981, 4,
  // Linked List (11)
  206, 21, 143, 19, 138, 2, 141, 287, 146, 23, 25,
  // Trees (15)
  226, 104, 543, 110, 100, 572, 235, 102, 199, 1448, 98, 230, 105, 124, 297,
  // Tries (3)
  208, 211, 212,
  // Heap / Priority Queue (7)
  703, 1046, 973, 215, 621, 355, 295,
  // Backtracking (9)
  78, 39, 46, 90, 40, 79, 131, 17, 51,
  // Graphs (13)
  200, 695, 133, 286, 994, 417, 130, 207, 210, 261, 323, 684, 127,
  // Advanced Graphs (6)
  332, 1584, 743, 778, 269, 787,
  // 1-D Dynamic Programming (12)
  70, 746, 198, 213, 5, 647, 91, 322, 152, 139, 300, 416,
  // 2-D Dynamic Programming (11)
  62, 1143, 309, 518, 494, 97, 329, 115, 72, 312, 10,
  // Greedy (8)
  53, 55, 45, 134, 846, 1899, 763, 678,
  // Intervals (6)
  57, 56, 435, 252, 253, 1851,
  // Math & Geometry (8)
  48, 54, 73, 202, 66, 50, 43, 2013,
  // Bit Manipulation (7)
  136, 191, 338, 190, 268, 371, 7,
]);

function filterTopic(topic: NeetCodeTopic): NeetCodeTopic | null {
  const problems = topic.problems.filter((p) => NEETCODE_150_IDS.has(p.id));
  if (problems.length === 0) return null;

  const templates = topic.templates
    .map((tpl) => ({
      ...tpl,
      problemIds: tpl.problemIds.filter((id) => NEETCODE_150_IDS.has(id)),
    }))
    .filter((tpl) => tpl.problemIds.length > 0);

  return { name: topic.name, templates, problems };
}

export const neetcode150Topics: NeetCodeTopic[] = neetcodeTopics
  .map(filterTopic)
  .filter((t): t is NeetCodeTopic => t !== null);

export const NEETCODE_150_PROBLEM_COUNT = NEETCODE_150_IDS.size;
