import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_PATH = '/Users/jaykim/.local/bin/claude';

function timestamp() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function log(...args) {
  console.log(`[${timestamp()}]`, ...args);
}

function logError(...args) {
  console.error(`[${timestamp()}] ERROR:`, ...args);
}

// Build a clean env — strip Claude Code session vars
function cleanEnv() {
  const env = {};
  for (const [key, val] of Object.entries(process.env)) {
    if (key === 'CLAUDECODE' || key.startsWith('CLAUDE_')) continue;
    env[key] = val;
  }
  return env;
}

let requestId = 0;

app.post('/api/ask', (req, res) => {
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

  const args = ['-p', prompt, '--model', 'haiku'];
  log(`[#${id}] Spawning: claude -p "<prompt>" --model haiku`);

  const startTime = Date.now();

  // execFile is equivalent to Python's subprocess.run(capture_output=True)
  execFile(CLAUDE_PATH, args, {
    env: cleanEnv(),
    timeout: 120000,
    maxBuffer: 1024 * 1024,
  }, (error, stdout, stderr) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (error) {
      logError(`[#${id}] CLI failed (${elapsed}s): code=${error.code}, signal=${error.signal}, killed=${error.killed}`);
      if (stderr) logError(`[#${id}] stderr: ${stderr.trim()}`);
      logError(`[#${id}] error.message: ${error.message}`);
      return res.status(500).json({
        error: 'Claude CLI failed',
        details: stderr?.trim() || error.message,
      });
    }

    const answer = stdout.trim();
    log(`[#${id}] Success (${elapsed}s), ${answer.length} chars`);
    log(`[#${id}] Response: "${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}"`);
    res.json({ answer });
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  log(`Claude API server running on http://localhost:${PORT}`);
  log(`Claude CLI path: ${CLAUDE_PATH}`);
  log(`Timeout: 120s`);
});
