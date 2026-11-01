import { basicChallenges } from './basic';
import { formChallenges } from './forms';
import { promptImages } from './promptImages';

const challengeOrder = [
  'item-list-manager',
  'code-review-feedback',
  'react-article-sorting',
  'react-contact-form',
  'patient-medical-records',
  'blog-post',
  'react-slideshow-1',
  'employee-validation',
  'react-word-omitter',
  'cryptorank-exchange',
];

export const reactChallenges = [...basicChallenges, ...formChallenges]
  .map(challenge => ({ ...challenge, images: promptImages[challenge.slug] }))
  .sort((a, b) => challengeOrder.indexOf(a.slug) - challengeOrder.indexOf(b.slug));

export type { ReactChallenge } from './types';
