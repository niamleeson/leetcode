import type { ReactChallenge } from './types';

export const sunoFeedChallenge: ReactChallenge = {
  collection: 'Suno',
  kind: 'coding',
  slug: 'suno-media-feed',
  title: 'Hooks-Style Media Feed',
  difficulty: 'Medium',
  topics: ['Effects', 'Media playback', 'Intersection Observer', 'Shared state'],
  sourceUrl: 'https://www.glassdoor.co.uk/Interview/Suno-Interview-E10318172-RVW104735801.htm',
  sourceLabel: 'Growth Engineer candidate report on Glassdoor',
  additionalSources: [
    {
      label: 'The Growth Engineer account hosted on Taro',
      url: 'https://www.jointaro.com/interviews/companies/suno/experiences/growth-engineer-july-9-2026-no-offer-negative-a66b0d9c/',
    },
    { label: 'MDN: media play() promises', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play' },
    { label: 'MDN: Intersection Observer', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API' },
  ],
  report: 'A Growth Engineer candidate, posting July 10, 2026 about a June 2026 interview, reports building an app resembling Suno Hooks from scratch. The interviewer described a TikTok-like app, left features and tools open, and later asked about architectural decisions. The account does not specify React or a fixed feature checklist. This is a candidate recollection, not an official Suno problem statement.',
  summary: 'Practice a small vertical media feed with independent likes and coordinated video playback.',
  prompt: 'Build a React prototype of a vertical short-video feed. Display sample clips, let users like each clip independently, and coordinate playback as the user scrolls. Explain how you separate UI state from browser media effects.',
  assumptions: [
    'React, scroll snapping, likes, and the playback rules below are original practice choices; the report leaves the implementation open-ended.',
    'The feed is a fixed, small list with unique string IDs. Likes are local to this mounted component and are not persisted.',
    'Use the largest positive intersection ratio reported by the observer to choose one active card. Ties favor the earlier card. If every card is offscreen, no clip is active.',
    'Automatically started clips are muted. Users may use native controls to play, pause, or enable sound on the active clip. A rejected play request leaves those controls available.',
    'The included MDN demonstration videos stand in for user clips; they are not Suno content. This browser example assumes IntersectionObserver is available.',
  ],
  requirements: [
    'Render three titled clips inside a keyboard-focusable vertical scroll-snap container.',
    'Toggle likes by clip ID using immutable state and expose the pressed state on each button.',
    'Only the active visible clip may play. Pause other clips and pause all playback when the document becomes hidden.',
    'Keep native video controls, handle rejected play promises, and prevent a delayed play request from restarting an inactive clip.',
    'Disconnect the observer, remove the visibility listener, and pause media on unmount.',
  ],
  example: {
    actions: 'Like Flower, scroll to Rabbit, then return to Flower. Switch to another browser tab.',
    result: 'Flower remains liked while Rabbit stays unliked. Scrolling pauses the previous clip and attempts muted playback on the active clip. Hiding the tab pauses all clips.',
  },
  steps: [
    'Start with a fixed clip array and a Set of liked IDs. Copy the Set before adding or deleting an ID.',
    'Use CSS scroll snapping for the layout and native video controls for manual playback and sound.',
    'Observe each card against the viewport. Keep its latest ratio because each callback may contain only the cards whose thresholds changed.',
    'Scan the stored ratios to choose the active card, save its ID in activeId.current, and pass that ID into syncPlayback(selectedId). The ref lets both the effect and the JSX play handler read the latest selection.',
    'Before automatic playback, mute the chosen video. Catch play() rejection and recheck isCancelled, document.hidden, and activeId.current when its promise resolves.',
    'Wrap the visibilitychange listener so it calls syncPlayback(activeId.current) with the latest selected ID rather than the browser event. When hidden, pause every video and return early. Keep the selected ID so the active clip can resume when the page becomes visible.',
    'Cleanup sets isCancelled to true, releases both subscriptions, and pauses every captured video. The flag prevents late callbacks from restarting playback; it does not cancel pending promises.',
  ],
  pitfalls: [
    'An observer callback is a partial update, not a complete snapshot. Selecting only from its entries can choose the wrong clip.',
    'Observer ratios update at thresholds; they are not continuous measurements. The small threshold list is sufficient for this practice feed, with deterministic ties.',
    'Calling play() does not guarantee playback. Browsers may reject it, and a pending request can finish after the user scrolls away.',
    'Muting only on the initial render is insufficient: a user can enable sound. Mute again before an automatic restart.',
    'A user can click native controls on an inactive clip. Guard the play event as well as the automatic playback path.',
    'The report invites an architectural discussion. Explain local likes, one playback coordinator, and what pagination, persistence, and captions would require.',
  ],
  complexity: 'For N clips and L liked IDs, an observer update scans O(N) cards and a playback transition visits O(N) videos. Rendering takes O(N); a like toggle copies O(L) IDs and rerenders O(N) cards. Stored ratios, video references, likes, and DOM output use O(N) space. Browser decoding and network costs are separate.',
  integrationNotes: [
    'Paste this complete snippet into App.jsx in a React browser project. It includes all layout styles and three public MDN video URLs; playback requires network access.',
    'Flower comes from the MDN interactive examples, Rabbit from the MDN video tutorial, and Sintel from the MDN media API tutorial. Replace these demonstration assets with your own licensed media and captions for a real product.',
    'Focus the feed and use browser scrolling keys, a mouse wheel, or touch. Use the visible video controls if automatic playback is blocked.',
    'For an interview, agree on the scope first. A larger feed would need pagination and virtualization; a production service would also need durable likes and media delivery.',
  ],
  testCases: [
    { action: 'Like Flower, then like Rabbit and unlike Flower.', expected: 'Only Rabbit has a pressed like button.' },
    { action: 'Scroll until a different card has the greatest reported visible ratio.', expected: 'The old clip pauses and the new clip attempts muted playback.' },
    { action: 'Scroll the whole feed out of view or hide the browser tab.', expected: 'All clips pause.' },
    { action: 'Reject automatic playback, then use the active clip’s native controls.', expected: 'The rejection is handled and manual playback remains available.' },
    { action: 'Unmount while play() is still pending.', expected: 'Subscriptions are removed, videos pause, and a late resolution cannot restart playback.' },
  ],
  code: String.raw`import { useEffect, useRef, useState } from 'react';

const CLIPS = [
  {
    id: 'flower', title: 'Flower',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rabbit', title: 'Rabbit',
    src: 'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4',
  },
  {
    id: 'sintel', title: 'Sintel',
    src: 'https://mdn.github.io/learning-area/javascript/apis/video-audio/finished/video/sintel-short.mp4',
  },
];

export default function MediaFeed() {
  const [liked, setLiked] = useState(() => new Set());
  const feedRef = useRef(null);
  const activeId = useRef(null);

  useEffect(() => {
    const cards = Array.from(feedRef.current.children);
    const videos = cards.map((card) => card.querySelector('video'));
    const ratios = new Map();
    let isCancelled = false;

    async function playVideo(video, id) {
      video.muted = true;
      try {
        await video.play();
        if (isCancelled || document.hidden || activeId.current !== id) {
          video.pause();
        }
      } catch {
        // Native controls remain usable if playback is blocked.
      }
    }

    function syncPlayback(selectedId) {
      if (document.hidden) {
        videos.forEach((video) => video.pause());
        return;
      }

      cards.forEach((card, index) => {
        const id = card.dataset.clipId;
        const video = videos[index];
        if (id !== selectedId) {
          video.pause();
          return;
        }
        playVideo(video, id);
      });
    }

    const observer = new IntersectionObserver((entries) => {
      if (isCancelled) return;
      for (const entry of entries) {
        ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      let nextId = null;
      let bestRatio = 0;
      for (const card of cards) {
        const ratio = ratios.get(card) ?? 0;
        if (ratio > bestRatio) {
          nextId = card.dataset.clipId;
          bestRatio = ratio;
        }
      }
      if (nextId !== activeId.current) {
        activeId.current = nextId;
        syncPlayback(activeId.current);
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

    function handleVisibilityChange() {
      syncPlayback(activeId.current);
    }

    cards.forEach((card) => observer.observe(card));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isCancelled = true;
      activeId.current = null;
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      videos.forEach((video) => video.pause());
    };
  }, []);

  function toggleLike(id) {
    setLiked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main>
      <h1>Media feed</h1>
      <p>Scroll for another clip. Use the video controls for playback and sound.</p>
      <section
        ref={feedRef}
        aria-label="Media feed"
        tabIndex={0}
        style={{ height: '70vh', maxWidth: 480, overflowY: 'auto',
          scrollSnapType: 'y mandatory', border: '1px solid #aaa' }}
      >
        {CLIPS.map((clip) => (
          <article
            key={clip.id}
            data-clip-id={clip.id}
            aria-label={clip.title}
            style={{ height: '100%', boxSizing: 'border-box', padding: 16,
              scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <h2 style={{ margin: 0 }}>{clip.title}</h2>
            <video
              src={clip.src}
              aria-label={clip.title + ' video'}
              controls muted loop playsInline preload="metadata"
              style={{ width: '100%', minHeight: 0, flex: 1,
                objectFit: 'contain', background: '#111' }}
              onPlay={(event) => {
                if (document.hidden || activeId.current !== clip.id) {
                  event.currentTarget.pause();
                }
              }}
            />
            <button
              type="button"
              aria-label={'Like ' + clip.title}
              aria-pressed={liked.has(clip.id)}
              onClick={() => toggleLike(clip.id)}
            >
              {liked.has(clip.id) ? 'Liked' : 'Like'}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}`,
};
