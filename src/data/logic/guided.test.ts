import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { logicManifest } from './manifest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuidedLanguage, GuidedLesson, GuidedStage } from './guided-types';

const fetchMock = vi.fn();
beforeEach(() => { vi.resetModules(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); });
afterEach(() => vi.unstubAllGlobals());

function lesson(id: number, language: GuidedLanguage, revision: string): GuidedLesson {
  return {
    id, language, revision, title: 'Example', source: 'def solve(value):\n    return value', sourceHash: 'source-hash', patternId: 'hashing',
    questions: (['pattern', 'structure', 'implementation'] as GuidedStage[]).map((stage, index) => ({
      id: stage, stage, prompt: 'Choose the next decision.',
      ...(stage === 'implementation' ? {line: 2, endLine: 2, coveredLines: [2], decisionLines: [2]} : {}),
      choices: Array.from({ length: index === 0 ? 8 : index === 1 ? 4 : 3 }, (_, choice) => ({
        id: String(choice), label: 'Choice ' + choice, correct: choice === 0, feedback: 'Reason',
        ...(stage === 'implementation' ? {code: choice === 0 ? '    return value' : '    return value + ' + choice} : {}),
      })),
    })),
    coverage: {requiredLines: [2], coveredLines: [2], terminalLines: [2]},
    validation: { correctCases: 2, wrongChoices: 2, testedWitnesses: 2 },
  };
}

describe('guided lesson loading', () => {
  it('accepts every published lesson in both languages through the real download validator', async () => {
    const loader = await import('./guided');
    fetchMock.mockImplementation(async (url: string) => ({ok: true,
      json: async () => JSON.parse(readFileSync(resolve('public/logic/lessons', url.split('logic/lessons/')[1]), 'utf8'))}));
    expect(logicManifest).toHaveLength(250);
    for (const problem of logicManifest) {
      for (const language of ['javascript', 'python'] as const) {
        const value = await loader.loadGuidedLesson(problem.id, language);
        expect(value.id).toBe(problem.id);
      }
    }
    expect(fetchMock).toHaveBeenCalledTimes(500);
  });

  it('requests one lesson on demand and keeps Python and JavaScript caches separate', async () => {
    const loader = await import('./guided');
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'python', loader.guidedRevision) })
      .mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'javascript', loader.guidedRevision) });
    const python = loader.loadGuidedLesson(1, 'python');
    expect(loader.loadGuidedLesson(1, 'python')).toBe(python);
    expect((await python).language).toBe('python');
    expect((await loader.loadGuidedLesson(1, 'javascript')).language).toBe('javascript');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/1-python\.json$/);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/1-javascript\.json$/);
  });

  it('allows a retry after a failed request and rejects stale identity or revision', async () => {
    const loader = await import('./guided');
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'javascript', loader.guidedRevision) })
      .mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'python', 'old-revision') })
      .mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'python', loader.guidedRevision) });
    await expect(loader.loadGuidedLesson(1, 'python')).rejects.toThrow('could not load');
    await expect(loader.loadGuidedLesson(1, 'python')).rejects.toThrow('does not match');
    await expect(loader.loadGuidedLesson(1, 'python')).rejects.toThrow('does not match');
    expect((await loader.loadGuidedLesson(1, 'python')).id).toBe(1);
  });

  it('accepts a two-choice implementation decision while preserving eight patterns', async () => {
    const loader = await import('./guided');
    const value = lesson(1, 'python', loader.guidedRevision);
    value.questions[2].choices.pop();
    fetchMock.mockResolvedValueOnce({ok: true, json: async () => value});
    expect((await loader.loadGuidedLesson(1, 'python')).questions[2].choices).toHaveLength(2);
  });

  it('accepts several small structure questions before implementation, but rejects later structure cards or a full outline', async () => {
    const loader = await import('./guided');
    const value = lesson(1, 'python', loader.guidedRevision);
    const structure = value.questions[1];
    structure.choices.pop();
    value.questions.splice(2,0,{...structure,id:'structure-next'});
    const misplaced = structuredClone(value);
    misplaced.questions.push({...structure,id:'structure-too-late'});
    fetchMock.mockResolvedValueOnce({ok:true,json:async()=>misplaced});
    await expect(loader.loadGuidedLesson(1,'python')).rejects.toThrow('does not match');
    const outline = structuredClone(value);
    outline.questions[1].choices[0].feedbackCode='for every item:\n  process it\nreturn answer';
    fetchMock.mockResolvedValueOnce({ok:true,json:async()=>outline});
    await expect(loader.loadGuidedLesson(1,'python')).rejects.toThrow('does not match');
    fetchMock.mockResolvedValueOnce({ok:true,json:async()=>value});
    expect((await loader.loadGuidedLesson(1,'python')).questions.map(question=>question.stage))
      .toEqual(['pattern','structure','structure','implementation']);
  });

  it('rejects a truncated implementation even when its metadata claims the final line is covered', async () => {
    const loader = await import('./guided');
    const value = lesson(1, 'python', loader.guidedRevision);
    value.source = 'def solve(value):\n    result = value\n    return result';
    value.questions[2].choices[0].code = '    result = value';
    value.coverage = {requiredLines: [2, 3], coveredLines: [2, 3], terminalLines: [3]};
    fetchMock.mockResolvedValueOnce({ok: true, json: async () => value});
    await expect(loader.loadGuidedLesson(1, 'python')).rejects.toThrow('does not match');
    value.questions.push({...value.questions[2], id: 'finish', line: 3, endLine: 3,
      choices: value.questions[2].choices.map(choice => ({...choice, code: choice.correct ? '    return result' : '    return 0'}))});
    fetchMock.mockResolvedValueOnce({ok: true, json: async () => value});
    expect((await loader.loadGuidedLesson(1, 'python')).questions).toHaveLength(4);
  });

  it('rejects unsupported problems and ambiguous grading without retaining a broken cache entry', async () => {
    const loader = await import('./guided');
    await expect(loader.loadGuidedLesson(-1, 'python')).rejects.toThrow('No guided lesson');
    expect(fetchMock).not.toHaveBeenCalled();
    const invalid = lesson(1, 'python', loader.guidedRevision);
    invalid.questions[2].choices[1].correct = true;
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => invalid });
    await expect(loader.loadGuidedLesson(1, 'python')).rejects.toThrow('does not match');
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => lesson(1, 'python', loader.guidedRevision) });
    expect((await loader.loadGuidedLesson(1, 'python')).questions).toHaveLength(3);
  });
});
