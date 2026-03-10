import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { createInterface } from 'readline';

const app = express();
app.use(cors());
app.use(express.json());

const MODEL = 'opus';

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

// ---------------------------------------------------------------------------
// Persistent Claude CLI process
// ---------------------------------------------------------------------------
let claudeProcess = null;
let claudeReady = false;
let responseCallback = null;
let responseBuf = '';
let restartCount = 0;
const MAX_RESTARTS = 5;

function spawnClaude() {
  log(`Spawning persistent Claude CLI (model: ${MODEL})...`);

  claudeProcess = spawn('claude', [
    '-p',
    '--model', MODEL,
    '--verbose',
    '--output-format', 'stream-json',
    '--input-format', 'stream-json',
  ], {
    env: cleanEnv(),
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  log(`Claude process spawned (PID: ${claudeProcess.pid})`);
  claudeReady = true;

  // Read stdout line by line (each line is a JSON message)
  const rl = createInterface({ input: claudeProcess.stdout });
  rl.on('line', (line) => {
    try {
      const msg = JSON.parse(line);

      if (msg.type === 'assistant' && msg.subtype === 'text') {
        // Accumulate text chunks
        responseBuf += msg.content || '';
      } else if (msg.type === 'result') {
        // Final result — resolve the pending callback
        const finalText = msg.result || responseBuf;
        log(`Claude response complete (${finalText.length} chars)`);
        if (responseCallback) {
          responseCallback.resolve(finalText.trim());
          responseCallback = null;
        }
        responseBuf = '';
      }
    } catch {
      // Non-JSON line, ignore
    }
  });

  claudeProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log(`Claude stderr: ${text}`);
  });

  claudeProcess.on('close', (code, signal) => {
    logError(`Claude process exited (code: ${code}, signal: ${signal})`);
    claudeReady = false;
    claudeProcess = null;
    if (responseCallback) {
      responseCallback.reject(new Error(`Claude process died (code ${code})`));
      responseCallback = null;
    }
    // Auto-restart after 2s (with cap)
    restartCount++;
    if (restartCount <= MAX_RESTARTS) {
      log(`Restarting Claude process in 2s... (restart ${restartCount}/${MAX_RESTARTS})`);
      setTimeout(spawnClaude, 2000);
    } else {
      logError(`Max restarts (${MAX_RESTARTS}) reached. Not restarting. Fix the issue and restart the server.`);
    }
  });

  claudeProcess.on('error', (err) => {
    logError(`Claude process error: ${err.message}`);
    claudeReady = false;
  });
}

function sendToClaude(prompt) {
  return new Promise((resolve, reject) => {
    if (!claudeProcess || !claudeReady) {
      return reject(new Error('Claude process not ready'));
    }
    if (responseCallback) {
      return reject(new Error('Another request is in progress'));
    }

    responseBuf = '';
    responseCallback = { resolve, reject };

    // Send user message as stream-json
    const msg = JSON.stringify({ type: 'user', content: prompt });
    claudeProcess.stdin.write(msg + '\n');
  });
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
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

  const startTime = Date.now();

  try {
    log(`[#${id}] Sending to persistent Claude process...`);
    const answer = await sendToClaude(prompt);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    log(`[#${id}] Success (${elapsed}s), ${answer.length} chars`);
    log(`[#${id}] Response: "${answer.substring(0, 150)}${answer.length > 150 ? '...' : ''}"`);
    return res.json({ answer });
  } catch (e) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    logError(`[#${id}] Failed (${elapsed}s): ${e.message}`);
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    ready: claudeReady,
    pid: claudeProcess?.pid || null,
    model: MODEL,
    busy: !!responseCallback,
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  log(`Claude API server running on http://localhost:${PORT}`);
  log(`Model: ${MODEL}`);
  spawnClaude();
});
