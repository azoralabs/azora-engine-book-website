export default function Sidebar({ sections, activeId, onNavigate }) {
  return (
    <nav className="h-full overflow-y-auto py-4 px-3" aria-label="Book chapters">
      <ul className="space-y-0.5 pb-16">
        {sections.map((section) => (
          <li key={section.id} className={section.depth === 0 && section.number !== '1' ? 'mt-4' : ''}>
            <button
              type="button"
              onClick={() => onNavigate(section.id)}
              style={{ paddingLeft: `${12 + (section.depth || 0) * 16}px` }}
              className={`chapter-link w-full text-left px-3 py-2 transition-colors cursor-pointer ${
                section.depth === 0 ? 'text-sm font-semibold' : 'text-[13px]'
              } ${
                activeId === section.id
                  ? 'chapter-link--active text-az-primary font-medium'
                  : 'text-az-50 hover:text-az-25 hover:bg-az-80/70'
              }`}
              aria-current={activeId === section.id ? 'page' : undefined}
            >
              <span className="mr-2 text-xs opacity-50">{section.number}</span>
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
