import { logicManifest } from './manifest';
import { guidedRevision } from './guided-manifest';
import type { GuidedLanguage, GuidedLesson } from './guided-types';

export { guidedRevision };
export type { GuidedChoice, GuidedJavaScriptExecution, GuidedLanguage, GuidedLesson, GuidedQuestion, GuidedStage, GuidedWitness } from './guided-types';

const ids = new Set(logicManifest.map(problem => problem.id));
const pending = new Map<string, Promise<GuidedLesson>>();

export function hasGuidedLesson(id: number, language: GuidedLanguage = 'python'): boolean {
  return ids.has(id) && (language === 'python' || language === 'javascript');
}

export function guidedLessonUrl(id: number, language: GuidedLanguage = 'python'): string {
  if (!hasGuidedLesson(id, language)) throw new Error('No guided lesson for this problem and language.');
  return import.meta.env.BASE_URL + 'logic/lessons/' + guidedRevision + '/' + id + '-' + language + '.json';
}

// The build independently parses and executes the lessons. Keep a small
// download-time guard too, so a stale or partial document cannot end a quiz early.
function validSequence(lesson: GuidedLesson): boolean {
  if (!Array.isArray(lesson.questions) || lesson.questions.length < 3 || !lesson.coverage) return false;
  const sourceLines = lesson.source.split('\n');
  const validLine = (line: number) => Number.isInteger(line) && line >= 1 && line <= sourceLines.length;
  const covered = new Set<number>();
  let previousEnd = 0;
  for (const [index, question] of lesson.questions.entries()) {
    const stage = index === 0 ? 'pattern' : index === 1 ? 'structure' : 'implementation';
    if (!question || question.stage !== stage || !Array.isArray(question.choices) ||
      question.choices.length < (stage === 'pattern' ? 8 : stage === 'structure' ? 4 : 2) ||
      question.choices.length > (stage === 'pattern' ? 8 : 4) ||
      question.choices.filter(choice => choice?.correct === true).length !== 1) return false;
    if (stage !== 'implementation') continue;
    const { line, endLine } = question;
    if (line === undefined || endLine === undefined || !validLine(line) || !validLine(endLine) ||
      line <= previousEnd || endLine < line || question.choices.some(choice => typeof choice?.code !== 'string')) return false;
    const correct = question.choices.find(choice => choice.correct)!;
    if (correct.code!.trimEnd() !== sourceLines.slice(line - 1, endLine).join('\n').trimEnd()) return false;
    for (let row = line; row <= endLine; row++) covered.add(row);
    previousEnd = endLine;
  }
  const { requiredLines, coveredLines, terminalLines, contextOnly = [] } = lesson.coverage;
  if (![requiredLines, coveredLines, terminalLines].every(lines => Array.isArray(lines) && lines.every(validLine)) ||
    !requiredLines.length || !Array.isArray(contextOnly)) return false;
  if (contextOnly.some(item => !item || !validLine(item.line) || !validLine(item.endLine) ||
    item.endLine < item.line || typeof item.reason !== 'string' || !item.reason.trim())) return false;
  const included = (line: number) => covered.has(line) || contextOnly.some(item => item.line <= line && line <= item.endLine);
  return requiredLines.every(included) && terminalLines.every(included) && coveredLines.every(line => covered.has(line));
}

export function loadGuidedLesson(id: number, language: GuidedLanguage = 'python'): Promise<GuidedLesson> {
  if (!hasGuidedLesson(id, language)) return Promise.reject(new Error('No guided lesson for this problem and language.'));
  const key = id + ':' + language;
  if (!pending.has(key)) {
    const request = fetch(guidedLessonUrl(id, language)).then(async response => {
      if (!response.ok) throw new Error('The guided lesson could not load. Please retry.');
      const value: unknown = await response.json();
      if (!value || typeof value !== 'object') throw new Error('The guided lesson is invalid. Please retry.');
      const lesson = value as GuidedLesson;
      if (lesson.id !== id || lesson.language !== language || lesson.revision !== guidedRevision ||
        typeof lesson.source !== 'string' || typeof lesson.sourceHash !== 'string' || !validSequence(lesson)) {
        throw new Error('The guided lesson does not match the requested problem. Please retry.');
      }
      return lesson;
    }).catch(error => {
      pending.delete(key);
      throw error;
    });
    pending.set(key, request);
  }
  return pending.get(key)!;
}
