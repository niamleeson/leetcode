import { STUDY_ORDER } from '../data/problems';
import type { Topic } from '../types';

export function topicToSlug(topic: string): string {
  return topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

export function slugToTopic(slug: string): Topic | null {
  return (STUDY_ORDER.find(topic => topicToSlug(topic) === slug) as Topic) || null;
}
