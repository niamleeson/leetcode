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
        typeof lesson.source !== 'string' || typeof lesson.sourceHash !== 'string' || !Array.isArray(lesson.questions) ||
        lesson.questions.length < 3 || lesson.questions[0]?.stage !== 'pattern' || lesson.questions[1]?.stage !== 'structure' ||
        lesson.questions.some(question => !Array.isArray(question.choices) || question.choices.length < 3 ||
          question.choices.filter(choice => choice.correct === true).length !== 1)) {
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
