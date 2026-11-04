import { basicChallenges } from './basic';
import { formChallenges } from './forms';
import { promptImages } from './promptImages';
import { andurilBasicChallenges } from './andurilBasic';
import { andurilAdvancedChallenges } from './andurilAdvanced';
import { ariaReferenceChallenge } from './ariaReference';
import { spreadsheetChallenge } from './spreadsheet';
import { greatFrontendChallenges } from './greatfrontend';
import { sunoAudioChallenge } from './sunoAudio';
import { sunoFeedChallenge } from './sunoFeed';
import { sunoDesignBriefChallenge, sunoNotificationChallenge } from './sunoDesign';
import { sunoReferralChallenge, sunoDagChallenge } from './sunoAlgorithms';
import { sunoIntervalChallenge } from './sunoInterval';
import type { ReactChallenge } from './types';

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

const hackerRankChallenges = [...basicChallenges, ...formChallenges]
  .map(challenge => ({ ...challenge, images: promptImages[challenge.slug] }))
  .sort((a, b) => challengeOrder.indexOf(a.slug) - challengeOrder.indexOf(b.slug));

export const reactChallenges: ReactChallenge[] = [
  ...hackerRankChallenges,
  sunoAudioChallenge,
  sunoFeedChallenge,
  sunoDesignBriefChallenge,
  sunoReferralChallenge,
  sunoDagChallenge,
  sunoIntervalChallenge,
  sunoNotificationChallenge,
  ...andurilBasicChallenges,
  ...andurilAdvancedChallenges,
  ...greatFrontendChallenges,
  spreadsheetChallenge,
  ariaReferenceChallenge,
];

export type { ReactChallenge } from './types';
