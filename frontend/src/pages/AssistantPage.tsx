import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, BrainCircuit, Search, ShieldAlert } from 'lucide-react'
import { investigations } from '../data/investigations'
import { researchSources } from '../data/sources'

const examples = [
  'Which records cover smoke measurements?',
  'What metadata is available for SAFFIRE?',
  'Find NASA sources about on-orbit fire incidents',
  'Compare flame extinction and fire detection topics',
]
const ignored = new Set(['about', 'which', 'what', 'from', 'with', 'that', 'this', 'cover', 'find', 'records', 'metadata', 'sources', 'NASA', 'the', 'for'])

function terms(value: string) {
  return value.toLowerCase().match(/[a-z0-9-]+/g)?.filter((term) => term.length > 2 && !ignored.has(term)) ?? []
}

export function AssistantPage() {
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [searched, setSearched] = useState(false)
  const queryTerms = useMemo(() => terms(submitted), [submitted])
  const records = useMemo(() => investigations.map((item) => {
    const text = `${item.title} ${item.acronym} ${item.summary} ${item.objective} ${item.category} ${item.fuelsAndMaterials?.join(' ') ?? ''}`.toLowerCase()
    const matched = queryTerms.filter((term) => text.includes(term))
    return { item, matched }
  }).filter(({ matched }) => matched.length > 0).sort((a, b) => b.matched.length - a.matched.length).slice(0, 5), [queryTerms])
  const sources = useMemo(() => researchSources.map((source) => {
    const text = `${source.title} ${source.kind} ${source.relevance}`.toLowerCase()
    const matched = queryTerms.filter((term) => text.includes(term))
    return { source, matched }
  }).filter(({ matched }) => matched.length > 0).sort((a, b) => b.matched.length - a.matched.length).slice(0, 5), [queryTerms])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(question.trim())
    setSearched(Boolean(question.trim()))
  }

  return (
    <div className="page-content tool-page assistant-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">SOURCE-GROUNDED DISCOVERY</span><h1>SI research assistant</h1><p>Search the curated investigation metadata and supplied NASA source catalog.</p></div>
        <span className="assistant-mode"><BrainCircuit size={16} /> LOCAL RETRIEVAL</span>
      </header>
      <section className="panel assistant-query-panel">
        <div className="assistant-intro"><div className="assistant-avatar"><BrainCircuit size={21} /></div><div><h2>Ask about the research catalog</h2><p>Results are keyword-retrieved source metadata, not generated scientific conclusions.</p></div></div>
        <form className="assistant-form" onSubmit={submit}>
          <label className="tool-search assistant-input"><Search size={17} /><span className="sr-only">Ask a research question</span><input onChange={(event) => setQuestion(event.target.value)} placeholder="Try: Which records cover smoke measurements?" value={question} /></label>
          <button className="button-primary" disabled={!question.trim()} type="submit">Search evidence</button>
        </form>
        <div className="prompt-chips">{examples.map((example) => <button key={example} onClick={() => { setQuestion(example); setSubmitted(example); setSearched(true) }} type="button">{example}</button>)}</div>
      </section>
      {searched && <section className="assistant-results">
        <div className="panel-heading"><div><span className="section-kicker">RETRIEVAL RESULTS</span><h2>Evidence matching “{submitted}”</h2></div></div>
        {records.length + sources.length === 0 ? <div className="empty-state"><Search size={22} /><h2>No matching catalog evidence</h2><p>Try investigation acronyms, topics, or source titles.</p></div> : <>
          {records.length > 0 && <><h3 className="result-group-title">Investigation metadata</h3><div className="assistant-result-grid">{records.map(({ item, matched }) => <article className="assistant-result-card" key={item.accession}><div className="library-card-head"><span className="source-id">{item.accession}</span><span className="library-kind">{matched.length} matched terms</span></div><h3>{item.acronym} · {item.title}</h3><p>{item.summary}</p><p className="result-objective"><strong>Cataloged objective:</strong> {item.objective}</p><a className="text-link" href={item.sourceUrl} rel="noreferrer" target="_blank">Open source record <ArrowUpRight size={13} /></a></article>)}</div></>}
          {sources.length > 0 && <><h3 className="result-group-title">Research sources</h3><div className="assistant-result-grid">{sources.map(({ source, matched }) => <article className="assistant-result-card" key={source.id}><div className="library-card-head"><span className="source-id">{source.id}</span><span className="library-kind">{matched.length} matched terms</span></div><h3>{source.title}</h3><p>{source.relevance}</p><a className="text-link" href={source.url} rel="noreferrer" target="_blank">Open NASA source <ArrowUpRight size={13} /></a></article>)}</div></>}
        </>}
      </section>}
      <aside className="evidence-boundary"><ShieldAlert size={16} /><p><strong>Evidence boundary:</strong> this tool searches curated metadata and source descriptions only. It does not retrieve full NASA documents, inspect raw files, or use an LLM. Verify scientific claims in the linked source; if the catalog does not establish an answer, the information remains unknown.</p></aside>
    </div>
  )
}
