import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MobileNav from './components/MobileNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import { sections } from './content/0.0.1/index.js'
import { BookIcon, CodeIcon, DocsIcon, TerminalIcon } from './AzIcons.jsx'

function pageFromHash() {
  const id = window.location.hash.slice(1)
  const index = sections.findIndex((section) => section.id === id)
  return index >= 0 ? index : 0
}

export default function App() {
  const [page, setPage] = useState(pageFromHash)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)

  const current = sections[page]
  const Component = current.component
  const results = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    return sections
      .filter((section) =>
        `${section.number} ${section.title} ${section.keywords || ''}`.toLowerCase().includes(query),
      )
      .slice(0, 7)
  }, [search])

  const navigateTo = useCallback((id) => {
    const index = sections.findIndex((section) => section.id === id)
    if (index < 0) return
    window.location.hash = id
    setPage(index)
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      setPage(pageFromHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'ArrowLeft' && page > 0) navigateTo(sections[page - 1].id)
      if (event.key === 'ArrowRight' && page < sections.length - 1) navigateTo(sections[page + 1].id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigateTo, page])

  return (
    <div className="book-shell min-h-screen text-az-10">
      <header className="book-topbar fixed inset-x-0 top-0 z-30 flex items-center px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="icon-button lg:hidden mr-2"
          aria-label="Open book navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <a className="book-brand" href="https://azoraengine.org" aria-label="Azora Engine home">
          <img src="/azora_logo.svg" alt="" className="book-brand__logo" />
          <span className="book-brand__name">Azora Engine</span>
          <span className="book-brand__product">Book</span>
          <span className="version-tag">v0.0.1</span>
        </a>

        <div className="book-search ml-auto">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the book"
            aria-label="Search chapters"
          />
          <kbd>Ctrl K</kbd>
          {results.length > 0 && (
            <div className="search-results">
              {results.map((result) => (
                <button type="button" key={result.id} onClick={() => navigateTo(result.id)}>
                  <span>{result.number}</span>
                  <strong>{result.title}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
        <nav className="az-topbar-links">
          <a href="https://azoralang.org"><TerminalIcon />Language</a>
          <a href="https://book.azoralang.org"><BookIcon />Book</a>
          <a href="https://docs.azoralang.org"><DocsIcon />Docs</a>
          <a href="https://code.azoralang.org"><CodeIcon />Playground</a>
        </nav>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sections={sections}
        activeId={current.id}
        onNavigate={navigateTo}
      />

      <aside className="book-sidebar hidden lg:block fixed left-0 w-72 overflow-hidden">
        <Sidebar sections={sections} activeId={current.id} onNavigate={navigateTo} />
      </aside>

      <main className="book-main lg:pl-72">
        <article className="book-article">
          <Component />

          <nav className="chapter-pager" aria-label="Chapter navigation">
            {page > 0 ? (
              <button type="button" onClick={() => navigateTo(sections[page - 1].id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
                <span><small>Previous</small>{sections[page - 1].title}</span>
              </button>
            ) : <span />}
            {page < sections.length - 1 ? (
              <button type="button" className="chapter-pager__next" onClick={() => navigateTo(sections[page + 1].id)}>
                <span><small>Next</small>{sections[page + 1].title}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ) : <span />}
          </nav>

          <footer className="book-footer">
            <p>Azora Engine Book v0.0.1</p>
            <a href="https://azoraengine.org">Azora Engine</a>
            <a href="https://azoralang.org">Azora Lang</a>
            <a href="https://azora.dev">Community</a>
          </footer>
        </article>
      </main>
    </div>
  )
}
