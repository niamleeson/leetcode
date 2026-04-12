/**
 * Thin client for the local LLM grader (Ollama + Qwen 2.5 behind
 * server.mjs at /api/llm/*).
 *
 * Everything here is best-effort: if Ollama isn't running, or the model isn't
 * pulled, or the proxy returns garbage, we fail silently and the modality
 * falls back to pure self-grading. The whole feature is additive — no study
 * flow is *blocked* on the LLM being up.
 */
import { StudyGrade } from './fsrs-lite';

const BASE_URL = 'http://localhost:3456/api/llm';

export interface LlmGrade {
  /** 0 = Again, 1 = Hard, 2 = Good, 3 = Easy — matches StudyGrade. */
  suggestedGrade: StudyGrade;
  /** Concrete points the learner got right. */
  correct: string[];
  /** Concrete points the learner missed or got wrong. */
  missing: string[];
  /** One-sentence justification from the model. */
  rationale: string;
  /** Which model produced this grade (for debugging / display). */
  model: string;
  /** Wall-clock time the server spent on the call. */
  elapsedMs: number;
}

export interface LlmHealth {
  available: boolean;
  model: string;
  reason: string | null;
}

/**
 * One-shot health ping. Short timeout because we do not want the study UI
 * to hang on startup when Ollama is off.
 */
export async function checkLlmHealth(): Promise<LlmHealth> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`${BASE_URL}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) {
      return { available: false, model: '', reason: `health HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      available: !!data.available,
      model: data.model ?? '',
      reason: data.reason ?? null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { available: false, model: '', reason: msg };
  }
}

export interface GradeRequest {
  /** The probe / prompt the learner was answering. Optional — for modalities
   *  like Recall that use a structured scaffold instead of a single question. */
  question?: string;
  /** The reference answer (solution.approach, lessons.overview, etc.). */
  canonical: string;
  /** What the learner actually wrote. */
  userAnswer: string;
}

/**
 * Grade a retrieval attempt. Returns null on any failure path — callers
 * should treat `null` as "grader unavailable, fall back to self-grade".
 */
// ─────────────────────────────────────────────────────────────────────────────
// Probe generation
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedProbe {
  question: string;
  label: string;
  placeholder: string;
  model: string;
  elapsedMs: number;
}

/**
 * Ask Qwen to generate a fresh interview-style probe question from the
 * canonical content. Returns null on any failure — caller falls back to
 * pre-authored probes.
 */
export async function generateProbe(
  canonical: string,
  systemName?: string,
): Promise<GeneratedProbe | null> {
  if (!canonical || canonical.trim().length < 50) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    const res = await fetch(`${BASE_URL}/generate-probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canonical, systemName }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as GeneratedProbe;
    if (!data.question || data.question.length < 10) return null;
    return data;
  } catch {
    return null;
  }
}

export async function gradeAnswer(req: GradeRequest): Promise<LlmGrade | null> {
  // Short-circuit obvious non-answers before paying the ~2-5s model round
  // trip. The server would also reject empty userAnswer, but bailing here
  // avoids a spurious 400 in the console.
  if (!req.canonical || !req.userAnswer || req.userAnswer.trim().length < 10) {
    return null;
  }
  try {
    const ctrl = new AbortController();
    // Generous timeout: a cold-loaded 7B model can take 10-15s on the first
    // call of a session while Metal warms up, then drops to 2-4s for
    // subsequent calls. We match the server's 60s ceiling so we never time
    // out before it does.
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    const res = await fetch(`${BASE_URL}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[localLlm] grade failed', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = (await res.json()) as LlmGrade;
    // Light runtime validation — the server already does this but cross the
    // network boundary defensively.
    if (![0, 1, 2, 3].includes(data.suggestedGrade)) return null;
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[localLlm] grade error', e);
    return null;
  }
}
