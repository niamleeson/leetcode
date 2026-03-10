import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

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

// Build a clean env that strips all Claude Code session vars
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
  log(`[#${id}] Spawning Claude CLI: ${CLAUDE_PATH} ${args.map(a => a === prompt ? '"<prompt>"' : a).join(' ')}`);

  const startTime = Date.now();
  const child = spawn(CLAUDE_PATH, args, {
    env: cleanEnv(),
    timeout: 60000,
  });

  log(`[#${id}] Claude process spawned (PID: ${child.pid})`);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
    log(`[#${id}] stdout chunk received (${data.length} bytes)`);
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
    log(`[#${id}] stderr chunk: ${data.toString().trim()}`);
  });

  child.on('close', (code, signal) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (code !== 0) {
      logError(`[#${id}] Claude CLI exited with code ${code}, signal ${signal} (${elapsed}s)`);
      logError(`[#${id}] stderr: ${stderr}`);
      return res.status(500).json({ error: 'Claude CLI failed', details: stderr });
    }

    const answer = stdout.trim();
    log(`[#${id}] Claude CLI completed successfully (${elapsed}s)`);
    log(`[#${id}] Response (${answer.length} chars): "${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}"`);
    res.json({ answer });
  });

  child.on('error', (err) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    logError(`[#${id}] Failed to spawn Claude CLI (${elapsed}s):`, err.message);
    res.status(500).json({ error: 'Failed to spawn Claude CLI' });
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  log(`Claude API server running on http://localhost:${PORT}`);
  log(`Claude CLI path: ${CLAUDE_PATH}`);
});
