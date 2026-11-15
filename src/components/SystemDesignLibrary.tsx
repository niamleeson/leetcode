import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { systemDesignArticles } from '../data/system-design-articles';
import CondensedSystemDesignArticle from './CondensedSystemDesignArticle';
import { useReadingPosition } from '../hooks/useReadingPosition';

const categories = ['Question breakdowns', 'Patterns', 'Key technologies'] as const;
type Article = typeof systemDesignArticles[number];
const articleUrl = (article: Article) => `${import.meta.env.BASE_URL}system-design/hello-interview/${article.filename}?v=${article.revision}`;
const textLink = 'text-sm text-blue-400 hover:underline light:text-blue-700';
const accordionStates = new Map<string, Map<string, boolean>>();

function ArticleFrame({ article, onReady }: { article: Article; onReady: () => void }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [height, setHeight] = useState(900);

  useLayoutEffect(() => {
    if (status === 'ready') onReady();
  }, [status, onReady]);

  useEffect(() => {
    setStatus('loading');
    const timeout = window.setTimeout(() => setStatus(value => value === 'loading' ? 'error' : value), 25000);
    return () => {
      window.clearTimeout(timeout);
      cleanupRef.current();
    };
  }, [article.slug, attempt]);

  const loaded = useCallback(() => {
    cleanupRef.current();
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    const content = doc?.querySelector<HTMLElement>('#markdown');
    if (!frame || !doc || !content) {
      setStatus('error');
      return;
    }
    const readerStyle = doc.createElement('style');
    readerStyle.textContent = `
      html, body { margin: 0 !important; padding: 0 !important; background: transparent !important; }
      html { overflow: hidden !important; }
      body { display: flow-root !important; color: rgb(var(--foreground)); }
      #markdown { width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; }
      #markdown img { background: white; }
      #markdown [data-reader-panel] { animation: none !important; }
      #markdown [data-reader-panel][hidden] { display: none !important; }
      #markdown button[aria-controls] { transition: none !important; }
    `;
    doc.head.appendChild(readerStyle);
    const syncTheme = () => {
      const theme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
      doc.documentElement.dataset.theme = theme;
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const resize = () => setHeight(Math.max(640, Math.ceil(doc.body.getBoundingClientRect().height)));
    const observer = new ResizeObserver(resize);
    observer.observe(doc.body);
    const savedAccordions = accordionStates.get(article.slug) ?? new Map<string, boolean>();
    accordionStates.set(article.slug, savedAccordions);
    const accordions = new Map<HTMLButtonElement, HTMLElement>();
    const setExpanded = (button: HTMLButtonElement, panel: HTMLElement, expanded: boolean) => {
      const state = expanded ? 'open' : 'closed';
      button.setAttribute('aria-expanded', String(expanded));
      button.dataset.state = state;
      panel.dataset.state = state;
      panel.hidden = !expanded;
      // Keep the original header, chevron, and wrapper styles in sync with the panel.
      const heading = button.parentElement;
      if (heading) heading.dataset.state = state;
      if (heading?.parentElement) heading.parentElement.dataset.state = state;
    };
    content.querySelectorAll<HTMLButtonElement>('button[aria-expanded][aria-controls]').forEach(button => {
      const panel = doc.getElementById(button.getAttribute('aria-controls')!);
      if (!panel || !content.contains(panel)) return;
      const label = button.textContent?.trim() ?? '';
      const solution = /^(Bad|Good|Great) Solution\b/i.test(label);
      const defaultExpanded = solution ? /^Great Solution\b/i.test(label) : button.getAttribute('aria-expanded') === 'true';
      panel.dataset.readerPanel = '';
      accordions.set(button, panel);
      setExpanded(button, panel, savedAccordions.get(panel.id) ?? defaultExpanded);
    });
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>('button[aria-controls]');
      const panel = button && accordions.get(button);
      if (button && panel) {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        setExpanded(button, panel, expanded);
        savedAccordions.set(panel.id, expanded);
        resize();
        return;
      }
      const anchor = target?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(anchor.href);
      const linked = systemDesignArticles.find(item => new URL(item.sourceUrl).pathname === url.pathname && url.hostname === 'www.hellointerview.com');
      if (linked) {
        event.preventDefault();
        if (linked.slug === article.slug && url.hash) {
          let id = url.hash.slice(1);
          try { id = decodeURIComponent(id); } catch { /* Keep malformed anchors harmless. */ }
          const heading = doc.getElementById(id);
          if (heading) {
            // A direct section link can target content inside a collapsed solution.
            accordions.forEach((panel, button) => {
              if (panel.contains(heading)) {
                setExpanded(button, panel, true);
                savedAccordions.set(panel.id, true);
              }
            });
            resize();
            requestAnimationFrame(() => {
              const toolbarHeight = document.querySelector('[data-reading-mode-nav]')?.getBoundingClientRect().height ?? 0;
              window.scrollTo({ top: window.scrollY + frame.getBoundingClientRect().top + heading.getBoundingClientRect().top - toolbarHeight - 20 });
            });
          }
        } else {
          navigate(`/system-design/${linked.slug}?view=full`);
        }
      }
    };
    doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(anchor => {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });
    doc.addEventListener('click', handleClick);
    cleanupRef.current = () => {
      observer.disconnect();
      themeObserver.disconnect();
      doc.removeEventListener('click', handleClick);
      readerStyle.remove();
    };
    void doc.fonts.ready.then(() => {
      if (!frame.isConnected || frame.contentDocument !== doc) return;
      resize();
      setStatus('ready');
    });
  }, [article.slug, navigate]);

  return (
    <div>
      {status === 'loading' && <p role="status" className="py-4 text-sm text-gray-400 light:text-gray-600">Loading {article.title}…</p>}
      {status === 'error' && (
        <div role="alert" className="rounded border border-gray-700 p-4 text-gray-300 light:border-gray-300 light:text-gray-700">
          <p>This article could not be loaded.</p>
          <button className={`${textLink} mt-2`} onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Try again</button>
          <a className={`${textLink} ml-5`} href={articleUrl(article)} target="_blank" rel="noreferrer">Open full page</a>
        </div>
      )}
      <iframe
        key={`${article.slug}-${attempt}`}
        ref={frameRef}
        src={articleUrl(article)}
        title={`${article.title} — full article`}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        onLoad={loaded}
        onError={() => setStatus('error')}
        className={`block w-full border-0 bg-transparent ${status !== 'ready' ? 'invisible h-0' : ''}`}
        style={{ height: status === 'ready' ? height : 0 }}
      />
    </div>
  );
}

function ArticleReader({ article, condensed }: { article: Article; condensed: boolean }) {
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);
    const rememberPosition = useReadingPosition(`${article.slug}:${condensed ? 'condensed' : 'full'}`, ready);
    const index = systemDesignArticles.findIndex(item => item.slug === article.slug);
    const previous = systemDesignArticles[index - 1];
    const next = systemDesignArticles[index + 1];
    return (
      <section data-reading-ready={ready} className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/system-design" className={textLink}>← All articles</Link>
          {!condensed && <span className="text-xs text-gray-500 light:text-gray-600">{article.category}</span>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white light:text-gray-900">{article.title}</h2>
          {!condensed && <a className={textLink} href={article.sourceUrl} target="_blank" rel="noreferrer">Original article</a>}
        </div>
        <nav data-reading-mode-nav aria-label={`${article.title} reading mode`} className="sticky top-0 z-20 flex flex-wrap gap-5 border-b border-gray-800 bg-gray-950 py-3 light:border-gray-200 light:bg-white">
            <Link to={`/system-design/${article.slug}`} onClick={rememberPosition} aria-current={condensed ? 'page' : undefined} className={`${textLink} ${condensed ? 'font-semibold underline underline-offset-4' : ''}`}>Condensed notes</Link>
            <Link to={`/system-design/${article.slug}?view=full`} onClick={rememberPosition} aria-current={!condensed ? 'page' : undefined} className={`${textLink} ${!condensed ? 'font-semibold underline underline-offset-4' : ''}`}>Full article</Link>
        </nav>
        {condensed ? (
          <CondensedSystemDesignArticle key={article.slug} slug={article.slug} title={article.title} onReady={onReady} />
        ) : <ArticleFrame key={article.slug} article={article} onReady={onReady} />}
        <nav aria-label="Adjacent articles" className="flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200">
          {previous ? <Link className={textLink} to={`/system-design/${previous.slug}`}>← {previous.title}</Link> : <span />}
          {next && <Link className={textLink} to={`/system-design/${next.slug}`}>{next.title} →</Link>}
        </nav>
      </section>
    );
}

export default function SystemDesignLibrary() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('category') || 'All';
  const article = systemDesignArticles.find(item => item.slug === slug);
  const condensed = params.get('view') !== 'full';

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  if (slug && !article) {
    return <div className="space-y-3 text-gray-300 light:text-gray-700"><p>Article not found.</p><Link className={textLink} to="/system-design">Back to all articles</Link></div>;
  }
  if (article) return <ArticleReader key={`${article.slug}:${condensed}`} article={article} condensed={condensed} />;

  const filtered = systemDesignArticles.filter(item => (category === 'All' || item.category === category) && item.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-gray-400 light:text-gray-600">32 question breakdowns, 7 patterns, and 10 key technologies. Each article includes condensed notes, diagrams, and the full article.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input aria-label="Search system design articles" type="search" value={query} onChange={e => updateFilter('q', e.target.value)} placeholder="Search articles…" className="min-w-0 flex-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none light:border-gray-300 light:bg-white light:text-gray-900" />
          <select aria-label="Article category" value={category} onChange={e => updateFilter('category', e.target.value)} className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800">
            <option value="All">All categories</option>
            {categories.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <p role="status" className="text-xs text-gray-500 light:text-gray-600">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}</p>
      </div>
      {!filtered.length && <p className="text-gray-400 light:text-gray-600">No articles match these filters.</p>}
      {categories.map(name => {
        const items = filtered.filter(item => item.category === name);
        return items.length ? <section key={name} className="space-y-3">
          <h2 className="text-lg font-semibold text-white light:text-gray-900">{name} <span className="ml-2 text-sm font-normal text-gray-500">{items.length}</span></h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => <li key={item.slug}><Link to={`/system-design/${item.slug}`} className="flex h-full items-center justify-between gap-2 rounded-md border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-200 transition-colors hover:border-gray-600 hover:bg-gray-800 light:border-gray-200 light:bg-white light:text-gray-800 light:hover:border-gray-400 light:hover:bg-gray-50">
              <span>{item.title}</span><span className="text-xs text-blue-400 light:text-blue-700">Notes</span>
            </Link></li>)}
          </ul>
        </section> : null;
      })}
    </section>
  );
}
