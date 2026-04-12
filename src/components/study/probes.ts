/**
 * Universal probe pools for the Recognize/Probe modality.
 *
 * The idea: instead of hand-authoring one question per chunk, we keep a pool
 * of *universal* retrieval questions that apply to any chunk of a given
 * source. Each probe knows how to extract its "canonical answer" from the
 * rich content that already exists in solutionMap / lessons — no duplication.
 *
 * The modality picks a probe at random per review (fresh mount via key=cursor),
 * the learner writes from memory, then the canonical section is revealed for
 * self-grading. This forces actual architectural recall instead of "name the
 * chapter".
 */

import { solutionMap } from '../../data/solutions';
import { lessons } from '../../data/lessons';
import { StudyChunk, isSdiChunk, isDsaChunk } from './chunk';
import {
  sdiInterviewProbes,
  dsaInterviewProbes,
  InterviewProbeSpec,
} from '../../data/interview-probes';

export interface Probe {
  id: string;
  /** The short label shown above the question (e.g. "Components", "Write path") */
  label: string;
  /** The actual question the learner sees. */
  question: string;
  /** A short nudge about how to structure the answer. */
  placeholder: string;
  /** Extract the canonical content to reveal. Return null if this chunk
   *  cannot answer this probe — the modality will pick a different one. */
  reveal: (chunk: StudyChunk) => string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SDI probe helpers.
// ─────────────────────────────────────────────────────────────────────────────

function sdiField(
  chunk: StudyChunk,
  field: 'approach' | 'explanation' | 'description' | 'code' | 'jsCode' | 'intuition',
): string | null {
  if (!isSdiChunk(chunk)) return null;
  const sol = solutionMap[chunk.problemId];
  if (!sol) return null;
  const text = sol[field];
  return text && text.trim().length > 0 ? text : null;
}

const SDI_PROBES: Probe[] = [
  {
    id: 'components',
    label: 'Components',
    question:
      'Sketch the high-level architecture from memory. Name 4–6 components and one sentence on what each does.',
    placeholder:
      '1. [Load balancer] — terminates TLS, distributes traffic\n2. [API gateway] — ...\n3. ...',
    reveal: (c) => sdiField(c, 'approach'),
  },
  {
    id: 'write-path',
    label: 'Write path',
    question:
      'Trace a single write request from client to durable storage. List every hop in order, and note what state each hop mutates.',
    placeholder:
      'client → LB → API → ??? → ??? → storage\n\n(Annotate what each step does.)',
    reveal: (c) => sdiField(c, 'approach') ?? sdiField(c, 'code'),
  },
  {
    id: 'read-path',
    label: 'Read path',
    question:
      'Trace a single read request. Does it hit a cache first? What does it fall back to on a cache miss, and how is the cache populated?',
    placeholder:
      'client → ??? → cache → (miss) → ??? → storage',
    reveal: (c) => sdiField(c, 'approach') ?? sdiField(c, 'code'),
  },
  {
    id: 'storage-choice',
    label: 'Storage choice',
    question:
      'What storage technology does the book pick for this system, and what alternative does it reject? State the deciding factor in one sentence.',
    placeholder:
      'Picked: ???\nRejected: ???\nWhy: ???',
    reveal: (c) => sdiField(c, 'explanation') ?? sdiField(c, 'approach'),
  },
  {
    id: 'bottleneck',
    label: 'Bottleneck',
    question:
      'What is the biggest scaling bottleneck in the naive design for this system, and how does the final design eliminate it?',
    placeholder:
      'Bottleneck: ???\nFix: ???',
    reveal: (c) => sdiField(c, 'explanation') ?? sdiField(c, 'jsCode'),
  },
  {
    id: 'tradeoff',
    label: 'Trade-off',
    question:
      'Name one explicit trade-off the book calls out for this design. What does it give up, and what does it gain?',
    placeholder:
      'Gives up: ???\nGains: ???',
    reveal: (c) => sdiField(c, 'explanation') ?? sdiField(c, 'intuition'),
  },
  {
    id: 'failure',
    label: 'Failure mode',
    question:
      'How does this system handle failure of its most critical component? What does the client experience during the failure?',
    placeholder:
      'Critical component: ???\nFailure handling: ???\nClient experience: ???',
    reveal: (c) => sdiField(c, 'explanation') ?? sdiField(c, 'approach'),
  },
  {
    id: 'requirements',
    label: 'Requirements',
    question:
      'Write the 3–5 key functional requirements AND the key non-functional requirement (latency / availability / consistency target).',
    placeholder:
      'Functional:\n1. ???\n2. ???\n3. ???\n\nNon-functional: ???',
    reveal: (c) => sdiField(c, 'description'),
  },
  {
    id: 'protocol',
    label: 'Protocol',
    question:
      'What protocol does the client use to communicate with the server here (HTTP / WebSocket / long-poll / gRPC / SSE), and why that choice?',
    placeholder:
      'Protocol: ???\nWhy: ???',
    reveal: (c) => sdiField(c, 'approach') ?? sdiField(c, 'explanation'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DSA probe helpers.
// ─────────────────────────────────────────────────────────────────────────────

function dsaField(
  chunk: StudyChunk,
  field: 'overview' | 'complexity' | 'jsTemplate' | 'template',
): string | null {
  if (!isDsaChunk(chunk)) return null;
  const lesson = lessons[chunk.topic];
  if (!lesson) return null;
  const text = lesson[field];
  return typeof text === 'string' && text.trim().length > 0 ? text : null;
}

function dsaCommonMistakes(chunk: StudyChunk): string | null {
  if (!isDsaChunk(chunk)) return null;
  const lesson = lessons[chunk.topic];
  if (!lesson || !lesson.commonMistakes?.length) return null;
  return lesson.commonMistakes.map((m) => `- ${m}`).join('\n');
}

function dsaKeyPatterns(chunk: StudyChunk): string | null {
  if (!isDsaChunk(chunk)) return null;
  const lesson = lessons[chunk.topic];
  if (!lesson || !lesson.keyPatterns?.length) return null;
  return lesson.keyPatterns.map((p) => `- ${p}`).join('\n');
}

const DSA_PROBES: Probe[] = [
  {
    id: 'template',
    label: 'Template',
    question:
      'Write the template from memory. Pseudocode is fine — just capture the control flow, the variables you initialize, and the termination condition.',
    placeholder:
      'def solve(...):\n    # initialize\n    # loop: ...\n    # update: ...\n    # return: ...',
    reveal: (c) =>
      dsaField(c, 'jsTemplate') ?? dsaField(c, 'template') ?? dsaField(c, 'overview'),
  },
  {
    id: 'invariant',
    label: 'Invariant',
    question:
      'What invariant does this pattern maintain at each step? Why is that invariant enough to prove correctness?',
    placeholder:
      'Invariant: after each iteration, ???\nWhy it suffices: ???',
    reveal: (c) => dsaKeyPatterns(c) ?? dsaField(c, 'overview'),
  },
  {
    id: 'complexity',
    label: 'Complexity',
    question:
      'State the time and space complexity for this pattern. Justify each in one sentence.',
    placeholder:
      'Time: O(???) because ???\nSpace: O(???) because ???',
    reveal: (c) => dsaField(c, 'complexity'),
  },
  {
    id: 'failure-mode',
    label: 'Failure mode',
    question:
      'Name one input or edge case where a naive implementation of this pattern fails. What specifically breaks?',
    placeholder:
      'Input: ???\nWhat breaks: ???\nFix: ???',
    reveal: (c) => dsaCommonMistakes(c),
  },
  {
    id: 'when-not',
    label: 'When NOT to use it',
    question:
      'When is this pattern the WRONG choice? Name a problem where you\'d reach for something else, and say what you\'d reach for.',
    placeholder:
      'Wrong when: ???\nUse instead: ???',
    reveal: (c) => dsaField(c, 'overview'),
  },
  {
    id: 'key-patterns',
    label: 'Key patterns',
    question:
      'List the 3–4 canonical sub-patterns inside this topic. For each, give the one-word trigger that tells you to reach for it.',
    placeholder:
      '1. [pattern] — trigger: ???\n2. ...',
    reveal: (c) => dsaKeyPatterns(c),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Interview probe adapter — converts InterviewProbeSpec → Probe by wiring up
// the reveal function to look up the right field from solutionMap / lessons.
// ─────────────────────────────────────────────────────────────────────────────

function buildInterviewProbe(spec: InterviewProbeSpec, chunk: StudyChunk): Probe {
  return {
    id: spec.id,
    label: spec.label,
    question: spec.question,
    placeholder: spec.placeholder,
    reveal: (c) => {
      if (isSdiChunk(c)) {
        return sdiField(c, spec.revealField) ?? (spec.fallbackField ? sdiField(c, spec.fallbackField) : null);
      }
      // Map SDI-style field names to DSA-style field names. InterviewProbeSpec
      // uses the SDI field vocabulary (approach/explanation/...) but DSA data
      // lives in lessons[] with different keys.
      const dsaMap: Record<string, 'overview' | 'complexity' | 'jsTemplate' | 'template'> = {
        approach: 'overview',
        explanation: 'overview',
        description: 'overview',
        intuition: 'overview',
        code: 'template',
        jsCode: 'jsTemplate',
      };
      const primary = dsaMap[spec.revealField] ?? 'overview';
      const fallback = spec.fallbackField ? (dsaMap[spec.fallbackField] ?? 'overview') : null;
      return dsaField(c, primary) ?? (fallback ? dsaField(c, fallback) : null)
        ?? dsaKeyPatterns(c) ?? dsaCommonMistakes(c);
    },
  };
}

/**
 * Pick a probe pool appropriate for the chunk. Prefers chapter-specific
 * interview probes (the realistic deep-dive questions an interviewer would
 * ask about THIS system) over the generic universal pool. Falls back to
 * universal probes only if no interview probes exist for this chunk.
 */
export function getUsableProbes(chunk: StudyChunk): Probe[] {
  // Try interview probes first.
  const specs: InterviewProbeSpec[] | undefined = isSdiChunk(chunk)
    ? sdiInterviewProbes[chunk.problemId]
    : isDsaChunk(chunk)
      ? dsaInterviewProbes[chunk.topic]
      : undefined;

  if (specs && specs.length > 0) {
    const interview = specs
      .map((s) => buildInterviewProbe(s, chunk))
      .filter((p) => p.reveal(chunk) !== null);
    if (interview.length > 0) return interview;
  }

  // Fallback to universal probes.
  const pool = isSdiChunk(chunk) ? SDI_PROBES : DSA_PROBES;
  return pool.filter((p) => p.reveal(chunk) !== null);
}

/** Pick one probe uniformly at random. Returns null only if the chunk has
 *  no usable probes at all (missing all the rich content fields). */
export function pickProbe(chunk: StudyChunk): Probe | null {
  const usable = getUsableProbes(chunk);
  if (usable.length === 0) return null;
  return usable[Math.floor(Math.random() * usable.length)];
}
