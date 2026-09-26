import Sidebar from './Sidebar.jsx'

export default function MobileNav({ open, onClose, sections, activeId, onNavigate }) {
  const handleNavigate = (id) => {
    onNavigate(id)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close book navigation"
        className={`mobile-scrim fixed inset-0 z-40 lg:hidden ${open ? 'mobile-scrim--open' : ''}`}
        onClick={onClose}
      />
      <div
        className={`mobile-drawer fixed top-0 left-0 z-50 h-full w-[min(86vw,320px)] transform transition-transform lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[68px] items-center justify-between px-4 border-b border-white/10">
          <span className="font-semibold text-az-20">Azora Engine Book</span>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close navigation">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 68px)' }}>
          <Sidebar sections={sections} activeId={activeId} onNavigate={handleNavigate} />
        </div>
      </div>
    </>
  )
}
