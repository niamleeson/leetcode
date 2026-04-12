/**
 * Recognize modality — LLM-generated interview probe drill.
 *
 * On mount, asks Qwen to generate a fresh interview-style question from the
 * chunk's canonical content. If Ollama is down or generation fails, shows
 * a clear "LLM unavailable" message — no fallback to pre-authored probes.
 *
 * Cognitive mechanism: active production + cued retrieval under varied
 * questioning. Because the question is different every session, the learner
 * cannot memorize a fixed answer.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { StudyChunk, isSdiChunk } from '../chunk';
import { StudyGrade } from '../../../utils/fsrs-lite';
import { generateProbe, GeneratedProbe } from '../../../utils/localLlm';
import { solutionMap } from '../../../data/solutions';
import { lessons } from '../../../data/lessons';
import LlmGradeCard from '../LlmGradeCard';
import ShowHint from '../ShowHint';
import StudyRubric from '../StudyRubric';
import { useLlmHealth } from '../../../hooks/useLlmHealth';

interface Props {
  chunk: StudyChunk;
  onGrade: (grade: StudyGrade) => void;
}

/** Build a rich canonical string for probe generation — concatenate the
 *  most useful fields so Qwen has enough material to ask about. */
function buildCanonical(chunk: StudyChunk): string {
  if (isSdiChunk(chunk)) {
    const sol = solutionMap[chunk.problemId];
    if (!sol) return '';
    return [sol.approach, sol.explanation, sol.description]
      .filter(Boolean)
      .join('\n\n---\n\n');
  }
  const lesson = lessons[(chunk as { topic: string }).topic];
  if (!lesson) return '';
  return [lesson.overview, lesson.jsTemplate ?? lesson.template, lesson.complexity]
    .filter(Boolean)
    .join('\n\n---\n\n');
}

export default function Recognize({ chunk, onGrade }: Props) {
  const { status, health } = useLlmHealth();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ── Probe generation ─────────────────────────────────────────────────
  const [genProbe, setGenProbe] = useState<GeneratedProbe | null>(null);
  const [probeLoading, setProbeLoading] = useState(true);
  const [probeFailed, setProbeFailed] = useState(false);

  const canonical = useMemo(() => buildCanonical(chunk), [chunk.id]);

  useEffect(() => {
    // Wait for the health check to finish before deciding anything.
    if (status === 'pending') return;

    if (!health?.available) {
      setProbeLoading(false);
      setProbeFailed(true);
      return;
    }

    // Health is resolved and available — generate the probe.
    let cancelled = false;
    generateProbe(canonical, chunk.title).then((result) => {
      if (cancelled) return;
      if (result) {
        setGenProbe(result);
      } else {
        setProbeFailed(true);
      }
      setProbeLoading(false);
    });

    return () => { cancelled = true; };
  }, [status, health?.available, canonical, chunk.title]);

  // ── Loading state ────────────────────────────────────────────────────
  if (probeLoading) {
    return (
      <div className="space-y-3">
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
          Probe drill
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
          Generating interview question for {chunk.title}...
        </div>
      </div>
    );
  }

  // ── LLM unavailable or generation failed ─────────────────────────────
  if (probeFailed || !genProbe) {
    return (
      <div className="space-y-3 text-sm text-gray-400">
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
          Probe drill
        </div>
        <p>
          LLM is unavailable — cannot generate a probe for{' '}
          <span className="text-white">{chunk.title}</span>. Grade as Good to move on.
        </p>
        <StudyRubric onGrade={onGrade} />
      </div>
    );
  }

  // ── Active drill ─────────────────────────────────────────────────────
  const canSubmit = text.trim().length >= 20;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1">
          Probe drill · {genProbe.label}
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Topic: <span className="text-gray-300">{chunk.title}</span>
        </div>
        <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-md p-4">
          <div className="text-gray-100 text-sm leading-relaxed">
            {genProbe.question}
          </div>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={genProbe.placeholder}
        disabled={submitted}
        className="w-full h-48 bg-gray-900/60 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 font-mono leading-relaxed resize-y focus:outline-none focus:border-sky-800 whitespace-pre disabled:opacity-60"
      />

      {!submitted ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            className="bg-sky-900/60 hover:bg-sky-800/80 disabled:opacity-40 border border-sky-800/60 text-sky-100 text-sm px-4 py-2 rounded-md"
          >
            Submit answer
          </button>
          <ShowHint canonical={canonical} />
        </div>
      ) : (
        <LlmGradeCard
          request={{
            question: genProbe.question,
            canonical,
            userAnswer: text,
          }}
          onApply={onGrade}
          onRetry={() => setSubmitted(false)}
        />
      )}
    </div>
  );
}
