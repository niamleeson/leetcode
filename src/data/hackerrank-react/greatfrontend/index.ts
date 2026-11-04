import { greatFrontendHooks } from './hooks';
import { greatFrontendBasic } from './uiBasic';
import { greatFrontendAdvanced } from './uiAdvanced';

export const greatFrontendChallenges = [
  ...[...greatFrontendBasic, ...greatFrontendAdvanced].sort((a, b) => a.title.localeCompare(b.title)),
  ...[...greatFrontendHooks].sort((a, b) => a.title.localeCompare(b.title)),
];
