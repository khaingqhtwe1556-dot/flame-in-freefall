import { useMemo, useState } from 'react'
import { Database, Download, FileText, Printer, ShieldAlert } from 'lucide-react'
import { investigations } from '../data/investigations'
import { researchSources } from '../data/sources'
import { readApiResponse } from '../services/api'

export function ReportsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['PSI-98', 'PSI-69'])
  const [question, setQuestion] = useState('Which curated NASA combustion records may inform spacecraft fire-safety research?')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const selected = useMemo(() => investigations.filter(({ accession }) => selectedIds.includes(accession)), [selectedIds])
  const report = useMemo(() => [
    '# FLAMEGUARD SI Research Brief',
    '',
    'Generated: local export time',
    '',
    '## Research question',
    question || 'Not specified.',
    '',
    '## Executive summary',
    `This brief summarizes ${selected.length} selected PSI catalog record(s). It contains curated metadata, not verified experimental measurements or conclusions.`,
    '',
    '## Selected investigation metadata',
    ...selected.flatMap((item) => [
      `### ${item.acronym} (${item.accession})`,
      `- Title: ${item.title}`,
      `- Summary: ${item.summary}`,
      `- Cataloged objective: ${item.objective}`,
      `- Gravity context: ${item.gravityContext}`,
      `- Listed formats: ${item.formats.join(', ') || 'Not established'}`,
      `- File availability: unverified`,
      `- Source: ${item.sourceUrl}`,
      '',
    ]),
    '## Scientific limitations',
    '- PSI file inventories are metadata; files have not been verified or analyzed by this application.',
    '- Rankings and mission relevance are project-defined and are not NASA-validated findings.',
    '- No experimental measurements, model outputs, or operational recommendations are included.',
    '',
    '## Supplied research sources',
    ...researchSources.map((source) => `- [${source.title}](${source.url}) — ${source.relevance}`),
    '',
  ].join('\n'), [question, selected])

  function download() {
    const url = URL.createObjectURL(new Blob([report], { type: 'text/markdown;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'flameguard-research-brief.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function saveToLocalApi() {
    setSaving(true)
    setSaveMessage('')
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'FLAMEGUARD SI Research Brief',
          research_question: question,
          markdown: report,
          source_urls: researchSources.map(({ url }) => url),
        }),
      })
      const result = await readApiResponse<{ id: string }>(response)
      setSaveMessage(`Saved in the local report library · ${result.id}`)
    } catch (reason) {
      setSaveMessage(reason instanceof Error ? reason.message : 'Could not save report to the local API.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">EVIDENCE EXPORT</span><h1>Report generator</h1><p>Create a source-linked research brief from the curated catalog.</p></div>
        <span className="assistant-mode"><FileText size={16} /> MARKDOWN / PRINT</span>
      </header>
      <div className="report-layout">
        <section className="panel report-controls">
          <div className="panel-heading"><div><span className="section-kicker">REPORT INPUTS</span><h2>Choose content</h2></div></div>
          <label className="select-field">Research question<textarea onChange={(event) => setQuestion(event.target.value)} rows={4} value={question} /></label>
          <p className="small-muted">Select investigation records to include</p>
          <div className="report-record-list">{investigations.map((item) => <label className="report-record-option" key={item.accession}><input checked={selectedIds.includes(item.accession)} onChange={(event) => setSelectedIds((ids) => event.target.checked ? [...ids, item.accession] : ids.filter((id) => id !== item.accession))} type="checkbox" /><span><strong>{item.acronym}</strong><small>{item.accession} · {item.title}</small></span></label>)}</div>
          <div className="report-actions"><button className="button-primary" onClick={download} type="button"><Download size={15} /> Download Markdown</button><button className="button-secondary" onClick={() => window.print()} type="button"><Printer size={15} /> Print / Save as PDF</button><button className="button-secondary" disabled={saving} onClick={saveToLocalApi} type="button"><Database size={15} /> {saving ? 'Saving…' : 'Save to local library'}</button>{saveMessage && <p aria-live="polite" className="report-save-message" role="status">{saveMessage}</p>}</div>
        </section>
        <section className="panel report-preview">
          <div className="panel-heading"><div><span className="section-kicker">LIVE PREVIEW</span><h2>FLAMEGUARD SI Research Brief</h2></div></div>
          <div className="report-preview-content"><p className="report-meta">Generated from curated catalog · {selected.length} records</p><h3>Research question</h3><p>{question || 'Not specified.'}</p><h3>Executive summary</h3><p>This brief summarizes selected PSI catalog metadata. It contains no verified experimental measurements or validated conclusions.</p><h3>Selected investigations</h3>{selected.length === 0 ? <p>No investigations selected.</p> : selected.map((item) => <article className="report-item" key={item.accession}><h4>{item.acronym} · {item.title}</h4><p>{item.summary}</p><p><strong>Objective:</strong> {item.objective}</p><a href={item.sourceUrl} rel="noreferrer" target="_blank">{item.accession} source</a></article>)}<h3>Limitations</h3><p>PSI file availability is unverified. Ranking and mission relevance are project-defined. This report is not a NASA analysis or operational recommendation.</p><h3>References</h3><ul>{researchSources.map((source) => <li key={source.id}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a></li>)}</ul></div>
        </section>
      </div>
      <aside className="evidence-boundary"><ShieldAlert size={16} /><p>Exports preserve the catalog's uncertainty and source links. They do not transform metadata into scientific findings.</p></aside>
    </div>
  )
}
