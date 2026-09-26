import Section from '../../components/Section.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'

export { Section, CodeBlock }

export function Lead({ children }) {
  return <p className="chapter-lead">{children}</p>
}

export function Subheading({ children }) {
  return <h3 className="text-lg font-semibold mt-8 mb-2 text-az-20">{children}</h3>
}

export function Note({ children, tone = 'blue' }) {
  return <div className={`book-note book-note--${tone}`}>{children}</div>
}

export function ApiTable({ rows }) {
  return (
    <div className="my-5 overflow-x-auto rounded-md border border-az-75/80">
      <table className="w-full text-left text-sm">
        <thead className="bg-az-85/80 text-az-20">
          <tr>
            <th className="px-4 py-3 font-semibold">API</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([api, meaning]) => (
            <tr key={api} className="border-t border-az-75/70 align-top">
              <td className="px-4 py-3 font-mono text-pastel-blue whitespace-nowrap">{api}</td>
              <td className="px-4 py-3 text-az-35 leading-6">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Steps({ children }) {
  return <ol className="book-steps">{children}</ol>
}

export function ChapterIntro({ eyebrow, title, children }) {
  return (
    <div className="chapter-intro">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  )
}
