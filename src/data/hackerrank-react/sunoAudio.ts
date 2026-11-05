import type { ReactChallenge } from './types';

export const sunoAudioChallenge: ReactChallenge = {
  collection: 'Suno',
  kind: 'coding',
  slug: 'suno-audio-player',
  title: 'Audio Player + Playlist',
  difficulty: 'Medium',
  topics: ['Media elements', 'Effects', 'Async cleanup', 'State'],
  sourceUrl: 'https://www.jointaro.com/interviews/companies/suno/experiences/staff-software-engineer-march-6-2025-no-offer-negative-c09ee7b1/',
  sourceLabel: 'Staff Software Engineer candidate report on Taro',
  additionalSources: [{ label: 'MDN: play() promises and playback errors', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play' }],
  report: 'A Staff Software Engineer candidate account displayed March 7, 2025 reports a Suno design task involving an audio player and playlist. It does not specify React or detailed playback requirements. The runnable React exercise below is an original practice adaptation.',
  summary: 'Connect one native audio element to a selectable playlist and handle track changes safely.',
  prompt: 'Design an audio player with a playlist. For this React practice adaptation, implement track selection, playback controls, previous and next navigation, and automatic advancement when a track finishes.',
  assumptions: [
    'These interactions are practice assumptions, not a transcript of Suno’s interview prompt. The public report describes a design task and does not establish a React coding round.',
    'The playlist is fixed for the lifetime of the mounted player. Each track has a unique id, a title, and a playable src URL. An empty playlist shows an empty state.',
    'The first track starts paused. Selecting a different playlist row starts it from the beginning; the current row is disabled.',
    'Previous and Next start the adjacent track from the beginning and preserve paused versus playing state. Navigation does not wrap, and ending the final track stops playback.',
    'Native audio controls provide play, pause, volume, and seeking. Shuffle, repeat, uploads, and playlist editing are outside this practice contract.',
  ],
  requirements: [
    'Show the current title, an accessible playlist, and exactly one audio element with native controls.',
    'Disable Previous at the first track and Next at the last track; identify the current playlist item with aria-current.',
    'Start a selected track, preserve playback state during adjacent navigation, and advance automatically after an ended event.',
    'Catch rejected play promises and display a useful error. Ignore results from an old playback request after navigation or unmount.',
    'Pause the previous audio element when switching tracks and pause the active element on unmount.',
  ],
  sampleData: {
    title: 'Two playable MDN audio samples',
    description: 'These public demo URLs are included in the solution. Replace them with your own hosted audio to practice a longer playlist.',
    code: `[
  {
    id: 'roar', title: 'T. rex roar',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  },
  {
    id: 'outfoxing', title: 'Outfoxing the Fox',
    src: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
  },
]`,
  },
  example: {
    actions: 'Play T. rex roar using the native controls. Select Next, pause, and then select Previous.',
    result: 'Outfoxing the Fox starts playing. After pausing and selecting Previous, T. rex roar is selected at the beginning and remains paused.',
  },
  steps: [
    'Store the selected index together with whether the newly selected track should start playing. The audio element remains the source of truth for current playback state.',
    'Render the audio element with key={track.id}. Changing tracks creates a fresh element, which resets the playback position and keeps old media events separate.',
    'Playlist buttons request playback. Previous and Next read the current element’s paused property to decide whether the next selection should play.',
    'In an effect, capture the selected audio element and await play only when requested. Show an alert for playback failures; an AbortError from pausing a pending request is expected.',
    'Cleanup sets isCancelled to true and pauses the captured element. The flag does not cancel the promise: if it resolves later, pause the old audio again; if it rejects later, leave the current track’s error message alone.',
    'Handle ended by selecting the next track with playback enabled. At the last track, leave the selection unchanged and let native playback stop.',
  ],
  pitfalls: [
    'A play request is asynchronous and may fail because of browser playback policies, a missing file, or an unsupported format. Do not assume it always starts.',
    'Read audio.paused when navigating; a separate React playing flag can drift from native play and pause controls.',
    'Capture the old audio element inside the effect. Reading ref.current in cleanup can accidentally pause the new track instead.',
    'Ignore a late rejection from an old play request so a slow previous track cannot overwrite the active track’s message.',
    'Do not use a timer to guess when a track ends. Use the media element’s ended event and native seeking controls.',
  ],
  complexity: 'For N tracks, rendering the playlist takes O(N) time and rendered output uses O(N) space. Each selection update uses O(1) application state and renders the O(N) playlist. The app owns one audio element; browser media buffering and decoding are outside this accounting.',
  integrationNotes: [
    'Copy the standalone JSX into a React component file and render its default export. The MDN sample URLs require network access; audio playback and seeking are supplied by the browser.',
    'Pass a fixed tracks array to use your own files. For local media, place files in public/audio and use URLs such as /audio/song.mp3. Remount the component when replacing the entire playlist.',
    'If automatic playback is blocked, use the native Play control to retry. Native control appearance and available seeking behavior depend on the browser and media file.',
  ],
  testCases: [
    { action: 'Load the sample playlist.', expected: 'The first track is paused, Previous is disabled, and native controls are available.' },
    { action: 'Play a track, then select Next.', expected: 'The old element is paused and the next track starts from the beginning.' },
    { action: 'Pause, then select Previous.', expected: 'The previous track is selected and stays paused.' },
    { action: 'Select another playlist row while paused.', expected: 'The selected track starts playing and is marked current.' },
    { action: 'Let a track finish, then let the final track finish.', expected: 'Playback advances once, then stops on the final track without wrapping.' },
    { action: 'Reject playback, or reject an old request after changing tracks.', expected: 'A current failure shows an alert; a failure from an old request does not affect the current track.' },
    { action: 'Unmount the player or provide an empty playlist.', expected: 'Unmount pauses active audio; an empty playlist displays No tracks available.' },
  ],
  code: String.raw`import { useEffect, useRef, useState } from 'react';

const TRACKS = [
  {
    id: 'roar', title: 'T. rex roar',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
  },
  {
    id: 'outfoxing', title: 'Outfoxing the Fox',
    src: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
  },
];

export default function AudioPlaylist({ tracks = TRACKS }) {
  const [selection, setSelection] = useState({ index: 0, shouldPlay: false });
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const track = tracks[selection.index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let isCancelled = false;
    setError('');

    async function startPlayback() {
      if (!selection.shouldPlay) return;
      try {
        await audio.play();
        if (isCancelled) audio.pause();
      } catch (error) {
        if (!isCancelled && error.name !== 'AbortError') {
          setError('Playback could not start. Use Play to retry or choose another track.');
        }
      }
    }

    startPlayback();
    return () => {
      isCancelled = true;
      audio.pause();
    };
  }, [selection, track]);

  function selectTrack(index, shouldPlay = true) {
    if (index < 0 || index >= tracks.length) return;
    setSelection({ index, shouldPlay });
  }

  function moveTrack(offset) {
    const shouldPlay = !audioRef.current.paused;
    selectTrack(selection.index + offset, shouldPlay);
  }

  function handleEnded() {
    if (selection.index < tracks.length - 1) {
      selectTrack(selection.index + 1);
    }
  }

  if (!track) return <p>No tracks available.</p>;

  return (
    <section aria-label="Audio player">
      <h2>{track.title}</h2>
      <p>Use the audio controls to play, pause, or seek.</p>
      <audio
        key={track.id}
        ref={audioRef}
        src={track.src}
        controls
        preload="metadata"
        aria-label={'Audio for ' + track.title}
        onPlay={() => setError('')}
        onEnded={handleEnded}
        onError={() => setError('Audio could not be loaded. Check the URL or choose another track.')}
      />
      <div>
        <button
          type="button"
          disabled={selection.index === 0}
          onClick={() => moveTrack(-1)}
        >
          Previous
        </button>{' '}
        <button
          type="button"
          disabled={selection.index === tracks.length - 1}
          onClick={() => moveTrack(1)}
        >
          Next
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <ol aria-label="Playlist">
        {tracks.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={index === selection.index ? 'true' : undefined}
              disabled={index === selection.index}
              onClick={() => selectTrack(index)}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}`,
};
