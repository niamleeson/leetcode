import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_PATH = '/Users/jaykim/.local/bin/claude';

// Build a clean env that strips all Claude Code session vars
function cleanEnv() {
  const env = {};
  for (const [key, val] of Object.entries(process.env)) {
    if (key === 'CLAUDECODE' || key.startsWith('CLAUDE_')) continue;
    env[key] = val;
  }
  return env;
}

app.post('/api/ask', (req, res) => {
  const { highlighted, question } = req.body;
  if (!highlighted || !question) {
    return res.status(400).json({ error: 'highlighted and question are required' });
  }

  const prompt = `The user is studying LeetCode/DSA and highlighted the following text:\n\n"${highlighted}"\n\nTheir question: ${question}\n\nGive a concise, helpful explanation. Keep it under 200 words.`;

  const child = spawn(CLAUDE_PATH, ['-p', prompt, '--model', 'haiku'], {
    env: cleanEnv(),
    timeout: 60000,
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => { stdout += data.toString(); });
  child.stderr.on('data', (data) => { stderr += data.toString(); });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error('Claude CLI error:', stderr);
      return res.status(500).json({ error: 'Claude CLI failed', details: stderr });
    }
    res.json({ answer: stdout.trim() });
  });

  child.on('error', (err) => {
    console.error('Failed to spawn Claude CLI:', err);
    res.status(500).json({ error: 'Failed to spawn Claude CLI' });
  });
});

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`Claude API server running on http://localhost:${PORT}`);
});
