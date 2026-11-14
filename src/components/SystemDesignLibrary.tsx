import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { systemDesignArticles } from '../data/system-design-articles';
import CondensedSystemDesignArticle from './CondensedSystemDesignArticle';

const categories = ['Question breakdowns', 'Patterns', 'Key technologies'] as const;
type Article = typeof systemDesignArticles[number];
const articleUrl = (article: Article) => `${import.meta.env.BASE_URL}system-design/hello-interview/${article.filename}?v=${article.revision}`;
const textLink = 'text-sm text-blue-400 hover:underline light:text-blue-700';

function ArticleFrame({ article }: { article: Article }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<() => void>(() => {});
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [height, setHeight] = useState(900);

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
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
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
          if (heading) window.scrollTo({ top: window.scrollY + frame.getBoundingClientRect().top + heading.getBoundingClientRect().top - 20 });
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
    resize();
    setStatus('ready');
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

export default function SystemDesignLibrary() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('category') || 'All';
  const article = systemDesignArticles.find(item => item.slug === slug);

  useEffect(() => { if (slug) window.scrollTo(0, 0); }, [slug]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'All') next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  if (slug && !article) {
    return <div className="space-y-3 text-gray-300 light:text-gray-700"><p>Article not found.</p><Link className={textLink} to="/system-design">Back to all articles</Link></div>;
  }

  if (article) {
    const condensed = params.get('view') !== 'full';
    const index = systemDesignArticles.findIndex(item => item.slug === article.slug);
    const previous = systemDesignArticles[index - 1];
    const next = systemDesignArticles[index + 1];
    return (
      <section className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/system-design" className={textLink}>← All articles</Link>
          <span className="text-xs text-gray-500 light:text-gray-600">{article.category}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white light:text-gray-900">{article.title}</h2>
          <a className={textLink} href={article.sourceUrl} target="_blank" rel="noreferrer">Original article</a>
        </div>
        <nav aria-label={`${article.title} reading mode`} className="flex flex-wrap gap-5 border-b border-gray-800 pb-3 light:border-gray-200">
            <Link to={`/system-design/${article.slug}`} aria-current={condensed ? 'page' : undefined} className={`${textLink} ${condensed ? 'font-semibold underline underline-offset-4' : ''}`}>Condensed notes</Link>
            <Link to={`/system-design/${article.slug}?view=full`} aria-current={!condensed ? 'page' : undefined} className={`${textLink} ${!condensed ? 'font-semibold underline underline-offset-4' : ''}`}>Full article</Link>
            {condensed && <a href={`${import.meta.env.BASE_URL}system-design/notes/${article.slug}.txt`} download className={`${textLink} sm:ml-auto`}>Download notes</a>}
        </nav>
        {condensed ? (
          <CondensedSystemDesignArticle key={article.slug} slug={article.slug} title={article.title} />
        ) : <ArticleFrame key={article.slug} article={article} />}
        <nav aria-label="Adjacent articles" className="flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200">
          {previous ? <Link className={textLink} to={`/system-design/${previous.slug}`}>← {previous.title}</Link> : <span />}
          {next && <Link className={textLink} to={`/system-design/${next.slug}`}>{next.title} →</Link>}
        </nav>
      </section>
    );
  }

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
