import type { ReactPromptImage } from './types';
import itemListManager from '../../assets/hackerrank-react/item-list-manager.gif';
import codeReviewFeedback from '../../assets/hackerrank-react/code-review-feedback.gif';
import articleSorting from '../../assets/hackerrank-react/react-article-sorting.gif';
import slideshow from '../../assets/hackerrank-react/react-slideshow-1.gif';
import employeeValidation from '../../assets/hackerrank-react/employee-validation.gif';
import cryptoRankExchange from '../../assets/hackerrank-react/cryptorank-exchange.gif';

// Original HackerRank prompt GIF bytes are stored locally without conversion.
export const promptImages: Partial<Record<string, ReactPromptImage[]>> = {
  'item-list-manager': [{
    src: itemListManager,
    alt: 'Item List Manager with an empty item field, an Add Item button, and an empty list below.',
    sourceUrl: 'https://s3.amazonaws.com/hr-assets/0/1719046513-25632d1299-hrc-idea-manager-list-animation.gif',
    width: 600,
    height: 517,
  }],
  'code-review-feedback': [{
    src: codeReviewFeedback,
    alt: 'Five code-quality cards, each with Upvote and Downvote buttons and independent counters starting at zero.',
    sourceUrl: 'https://s3.amazonaws.com/hr-assets/0/1729722211-95d9063039-ReactApp-GoogleChrome2024-09-1200-53-27-ezgif.com-video-to-gif-converter.gif',
    width: 800,
    height: 450,
  }],
  'react-article-sorting': [{
    src: articleSorting,
    alt: 'Article table with title, upvote, and date columns and controls for sorting by Most Upvoted or Most Recent.',
    sourceUrl: 'https://hrcdn.net/s3_pub/istreet-assets/cxj8qBL9QgGAMyKrRbBGDA/sorting-articles.gif',
    width: 600,
    height: 495,
  }],
  'react-slideshow-1': [{
    src: slideshow,
    alt: 'Slideshow displaying a title and description, with Restart, Prev, and Next controls; Restart and Prev are disabled on the first slide.',
    sourceUrl: 'https://hrcdn.net/s3_pub/istreet-assets/j3Q6jXZ3DOOPRlCs9hFcnQ/slideshow.gif',
    width: 600,
    height: 495,
  }],
  'employee-validation': [{
    src: employeeValidation,
    alt: 'Employee form with empty name, email, employee ID, and joining-date fields, validation messages, and a disabled Submit button.',
    sourceUrl: 'https://s3.amazonaws.com/hr-assets/0/1729723881-648947a309-Untitledvideo-MadewithClipchamp-ezgif.com-optimize.gif',
    width: 600,
    height: 750,
  }],
  'cryptorank-exchange': [{
    src: cryptoRankExchange,
    alt: 'CryptoRank Exchange with an empty dollar amount field and a cryptocurrency table showing exchange rates and zero coin quantities to eight decimal places.',
    sourceUrl: 'https://s3.amazonaws.com/hr-assets/0/1729744935-207f026c08-Untitledvideo-MadewithClipchamp1-ezgif.com-optimize.gif',
    width: 600,
    height: 530,
  }],
};
