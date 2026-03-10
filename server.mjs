import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

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

const PORT = 3456;
app.listen(PORT, () => {
  log(`Claude API server running on http://localhost:${PORT}`);
  log(`Model: ${MODEL}, Timeout: 120s, Retries: 2`);
});
