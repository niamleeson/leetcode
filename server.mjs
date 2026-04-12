import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const MODEL = 'opus';

// ─────────────────────────────────────────────────────────────────────────────
// Local LLM (Ollama) config. Swap OLLAMA_MODEL to upgrade — everything else
// (proxy, client, UI) reads it from here, so there's exactly one string to
// change.
// ─────────────────────────────────────────────────────────────────────────────
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const OLLAMA_TIMEOUT_MS = 60_000;

function timestamp() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function log(...args) {
  console.log(`[${timestamp()}]`, ...args);
}

function logError(...args) {
  console.error(`[${timestamp()}] ERROR:`, ...args);
}

// Only strip CLAUDECODE (matches creator-recommendation-playground)
function cleanEnv() {
  const env = {};
  for (const [key, val] of Object.entries(process.env)) {
    if (key === 'CLAUDECODE') continue;
    env[key] = val;
  }
  return env;
}

// Equivalent to Python's subprocess.run(capture_output=True, text=True)
// Key: close stdin immediately so claude CLI doesn't hang waiting for input
function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', prompt, '--model', MODEL], {
      env: cleanEnv(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Close stdin immediately — this is what Python subprocess.run does
    // and what was missing in the Node version
    child.stdin.end();

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Timeout after 120s`));
    }, 120000);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `exit ${code}`));
      } else {
        resolve(stdout.trim());
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

let requestId = 0;

app.post('/api/ask', async (req, res) => {
  const id = ++requestId;
  const { highlighted, question } = req.body;

  log(`[#${id}] Received request`);
  log(`[#${id}]   Highlighted: "${highlighted}"`);
  log(`[#${id}]   Question: "${question}"`);

  if (!highlighted || !question) {
    logError(`[#${id}] Missing required fields`);
    return res.status(400).json({ error: 'highlighted and question are required' });
  }

  const prompt = `The user is studying LeetCode/DSA and highlighted the following text:\n\n"${highlighted}"\n\nTheir question: ${question}\n\nGive a concise, helpful explanation. Keep it under 200 words.`;

  // Retry: 2 attempts with 2s sleep (matches creator-recommendation-playground)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const startTime = Date.now();
      log(`[#${id}] Attempt ${attempt + 1}: claude -p "<prompt>" --model ${MODEL}`);

      const answer = await callClaude(prompt);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      log(`[#${id}] Success (${elapsed}s), ${answer.length} chars`);
      log(`[#${id}] Response: "${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}"`);
      return res.json({ answer });
    } catch (e) {
      logError(`[#${id}] Attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt === 0) {
        log(`[#${id}] Retrying in 2s...`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  logError(`[#${id}] All attempts failed`);
  res.status(500).json({ error: 'Claude CLI failed after 2 attempts' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Local LLM grading endpoints (Ollama-backed).
//
// /api/llm/health  → feature-detection ping, returns {available, model}
// /api/llm/grade   → structured grading of a user answer against a canonical
//
// We keep Ollama behind the existing server.mjs proxy rather than calling it
// from the browser directly because (a) Ollama's default CORS policy blocks
// cross-origin requests from the Vite dev server and (b) this keeps the model
// name in exactly one place (OLLAMA_MODEL above) so swapping from 7b → 14b is
// a one-line change.
// ─────────────────────────────────────────────────────────────────────────────

async function ollamaFetch(path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_HOST}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Ollama ${res.status}: ${txt.slice(0, 200)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/llm/health', async (_req, res) => {
  try {
    // `/api/tags` lists installed models and is the cheapest ping Ollama
    // supports. We consider the feature available iff the configured model
    // shows up in that list — this catches both "daemon off" and "model not
    // pulled yet" with one call.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = await r.json();
    const models = Array.isArray(data?.models) ? data.models.map((m) => m.name) : [];
    const installed = models.some((n) => n === OLLAMA_MODEL || n.startsWith(`${OLLAMA_MODEL}:`));
    res.json({
      available: installed,
      model: OLLAMA_MODEL,
      installedModels: models,
      reason: installed ? null : `Model ${OLLAMA_MODEL} not installed. Run: ollama pull ${OLLAMA_MODEL}`,
    });
  } catch (e) {
    res.json({
      available: false,
      model: OLLAMA_MODEL,
      installedModels: [],
      reason: `Ollama not reachable at ${OLLAMA_HOST}: ${e.message}`,
    });
  }
});

/**
 * Build the grading prompt. The instructions are intentionally strict about
 * the JSON schema because Ollama's `format: "json"` enforces *valid JSON* but
 * not *our* shape — the model can still emit `{"foo": 1}` and satisfy the
 * constraint. So we describe the schema inline and lead with a concrete
 * example to anchor the output.
 */
function buildGradePrompt({ question, canonical, userAnswer }) {
  return [
    'You are grading a spaced-repetition retrieval attempt for a system-design / DSA study tool.',
    'The learner saw a probe question, wrote an answer from memory, then compared against a canonical reference.',
    'Your job: score the learner\'s answer strictly against the canonical, and list what they got right vs. missed.',
    '',
    'Scoring scale (match Anki semantics):',
    '  0 = Again — missed the core idea entirely or wrote something incorrect',
    '  1 = Hard  — got the gist with clear gaps; would not pass an interview',
    '  2 = Good  — covered the key points; minor omissions are fine',
    '  3 = Easy  — complete, specific, and matches the canonical in structure',
    '',
    'Grading rules:',
    '- Reward concrete components, decisions, and trade-offs. Penalize vague hand-waving.',
    '- If the learner uses different but equivalent terminology (e.g. "write-ahead log" vs "commit log"), count it as correct.',
    '- The canonical is the ground truth. If the learner contradicts it, that\'s a miss.',
    '- "missing" and "correct" must be short, specific bullet strings (max ~80 chars each).',
    '- Be stingy with Easy. Default to Good when in doubt.',
    '',
    'Respond with ONLY this JSON shape, no prose:',
    '{',
    '  "suggestedGrade": 0 | 1 | 2 | 3,',
    '  "correct": ["bullet string", ...],',
    '  "missing": ["bullet string", ...],',
    '  "rationale": "one sentence, why this grade"',
    '}',
    '',
    '─── PROBE QUESTION ───',
    question || '(no explicit probe — grade as a general recall attempt)',
    '',
    '─── CANONICAL REFERENCE ───',
    canonical,
    '',
    '─── LEARNER ANSWER ───',
    userAnswer,
  ].join('\n');
}

app.post('/api/llm/grade', async (req, res) => {
  const id = ++requestId;
  const { question, canonical, userAnswer } = req.body || {};

  if (!canonical || !userAnswer) {
    logError(`[#${id}] llm/grade: missing fields`);
    return res.status(400).json({ error: 'canonical and userAnswer are required' });
  }

  log(`[#${id}] llm/grade: ${userAnswer.length} chars user vs ${canonical.length} chars canonical`);
  const start = Date.now();

  try {
    const prompt = buildGradePrompt({ question, canonical, userAnswer });
    // Temperature 0 for grading consistency — two identical answers should
    // produce identical grades. `format: "json"` turns on llama.cpp's grammar-
    // constrained decoding so we are guaranteed valid JSON back; our parser
    // only needs to validate the shape, not recover from malformed output.
    const result = await ollamaFetch('/api/generate', {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0, num_ctx: 8192 },
    });

    const raw = typeof result.response === 'string' ? result.response : '';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      logError(`[#${id}] llm/grade: JSON parse failed: ${e.message}`);
      return res.status(502).json({ error: 'model returned unparseable JSON', raw });
    }

    // Shape validation — defend against the model satisfying `format: "json"`
    // with a conformant-but-wrong-shape object.
    const grade = parsed.suggestedGrade;
    if (![0, 1, 2, 3].includes(grade)) {
      logError(`[#${id}] llm/grade: invalid grade ${JSON.stringify(grade)}`);
      return res.status(502).json({ error: 'model returned invalid grade', parsed });
    }
    const clean = {
      suggestedGrade: grade,
      correct: Array.isArray(parsed.correct) ? parsed.correct.filter((s) => typeof s === 'string').slice(0, 8) : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing.filter((s) => typeof s === 'string').slice(0, 8) : [],
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
      model: OLLAMA_MODEL,
      elapsedMs: Date.now() - start,
    };

    log(`[#${id}] llm/grade: grade=${clean.suggestedGrade} in ${clean.elapsedMs}ms`);
    res.json(clean);
  } catch (e) {
    logError(`[#${id}] llm/grade: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/llm/generate-probe', async (req, res) => {
  const id = ++requestId;
  const { canonical, systemName } = req.body || {};

  if (!canonical) {
    logError(`[#${id}] llm/generate-probe: missing canonical`);
    return res.status(400).json({ error: 'canonical is required' });
  }

  log(`[#${id}] llm/generate-probe: ${canonical.length} chars for "${systemName || '(unnamed)'}"`);
  const start = Date.now();

  try {
    const prompt = [
      'You are a senior engineering interviewer conducting the deep-dive phase of a system design interview.',
      systemName ? `The candidate just finished sketching their design for: ${systemName}.` : '',
      'Based on the reference material below, generate ONE specific deep-dive interview question.',
      '',
      'Rules:',
      '- Ask about a specific design decision, failure mode, scaling challenge, or tradeoff from the material.',
      '- Be concrete: name specific components, data flows, or edge cases — not vague "tell me about" questions.',
      '- The question must be answerable from the reference material below.',
      '- Do NOT ask about topics not covered in the material.',
      '- Frame it as an interviewer would: "How do you handle...", "What happens when...", "Walk me through..."',
      '',
      'Respond with ONLY this JSON shape, no prose:',
      '{',
      '  "question": "the interview question",',
      '  "label": "2-3 word topic label",',
      '  "placeholder": "hint at answer structure without giving it away"',
      '}',
      '',
      '─── REFERENCE MATERIAL ───',
      canonical,
    ].join('\n');

    const result = await ollamaFetch('/api/generate', {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0.7, num_ctx: 8192 },
    });

    const raw = typeof result.response === 'string' ? result.response : '';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      logError(`[#${id}] llm/generate-probe: JSON parse failed`);
      return res.status(502).json({ error: 'unparseable JSON', raw });
    }

    if (typeof parsed.question !== 'string' || parsed.question.length < 10) {
      logError(`[#${id}] llm/generate-probe: invalid question`);
      return res.status(502).json({ error: 'invalid question', parsed });
    }

    const clean = {
      question: parsed.question,
      label: typeof parsed.label === 'string' ? parsed.label : 'Deep dive',
      placeholder: typeof parsed.placeholder === 'string' ? parsed.placeholder : '',
      model: OLLAMA_MODEL,
      elapsedMs: Date.now() - start,
    };

    log(`[#${id}] llm/generate-probe: "${clean.label}" in ${clean.elapsedMs}ms`);
    res.json(clean);
  } catch (e) {
    logError(`[#${id}] llm/generate-probe: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

const PORT = 3456;
app.listen(PORT, () => {
  log(`Claude API server running on http://localhost:${PORT}`);
  log(`Claude model: ${MODEL}, Timeout: 120s, Retries: 2`);
  log(`Ollama: ${OLLAMA_HOST} · model: ${OLLAMA_MODEL}`);
});
