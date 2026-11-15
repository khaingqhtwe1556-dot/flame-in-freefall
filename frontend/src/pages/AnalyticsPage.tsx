import { useMemo, useState, type ChangeEvent } from 'react'
import { AlertCircle, ChartNoAxesCombined, FileSpreadsheet, ShieldAlert } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { analyzeCsvText, validateCsvFile, type CsvAnalysis } from '../services/csvAnalysis'
import { readApiResponse } from '../services/api'

type ModelMode = 'classification' | 'regression' | 'anomaly'

interface ModelResult {
  model: string
  limitation: string
  target_column?: string
  split_method?: string
  train_rows?: number
  test_rows?: number
  metrics?: Record<string, number | { labels: string[]; values: number[][] }>
  feature_importance?: { feature: string; importance: number }[]
  anomaly_count?: number
  anomalies?: { data_row: number; anomaly_score: number }[]
}

interface CorrelationResult {
  row_count: number
  pairwise_correlations: { left: string; right: string; pearson_r: number | null }[]
}

export function AnalyticsPage() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null)
  const [series, setSeries] = useState('')
  const [fileName, setFileName] = useState('')
  const [csvText, setCsvText] = useState('')
  const [modelMode, setModelMode] = useState<ModelMode>('classification')
  const [targetColumn, setTargetColumn] = useState('')
  const [groupColumn, setGroupColumn] = useState('')
  const [modelResult, setModelResult] = useState<ModelResult | null>(null)
  const [modelError, setModelError] = useState('')
  const [modelLoading, setModelLoading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiResult, setApiResult] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const chartData = useMemo(() => {
    if (!analysis || !series) return []
    const columnIndex = analysis.headers.indexOf(series)
    return analysis.rows.slice(0, 1000).flatMap((row, index) => {
      const value = Number(row[columnIndex])
      return Number.isFinite(value) ? [{ observation: index + 1, value }] : []
    })
  }, [analysis, series])
  const modelTargets = modelMode === 'regression'
    ? analysis?.numeric.map(({ name }) => name) ?? []
    : analysis?.headers ?? []

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setAnalysis(null)
    setLoading(true)
    try {
      validateCsvFile(file)
      const content = await file.text()
      setCsvText(content)
      const result = analyzeCsvText(content)
      setAnalysis(result)
      setFileName(file.name)
      setSeries(result.numeric[0]?.name ?? '')
      setTargetColumn(result.headers.find((header) => !result.numeric.some((column) => column.name === header)) ?? result.numeric[0]?.name ?? '')
      setGroupColumn('')
      setModelResult(null)
      setModelError('')
      setApiResult('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read the CSV file.')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  async function analyzeWithLocalApi() {
    setApiLoading(true)
    setApiResult('')
    try {
      const response = await fetch('/api/analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_text: csvText }),
      })
      const result = await readApiResponse<CorrelationResult>(response)
      const correlations = (result.pairwise_correlations ?? [])
        .map(({ left, right, pearson_r }) => `${left} / ${right}: ${pearson_r === null ? 'not defined' : pearson_r.toFixed(3)}`)
        .join('; ')
      setApiResult(`Local API analyzed ${result.row_count ?? 0} rows. Pairwise Pearson r: ${correlations || 'no numeric pairs'}.`)
    } catch (reason) {
      setApiResult(reason instanceof Error ? reason.message : 'Could not contact the local analysis API.')
    } finally {
      setApiLoading(false)
    }
  }

  async function runModel() {
    setModelLoading(true)
    setModelError('')
    setModelResult(null)
    try {
      const requestBody = modelMode === 'anomaly'
        ? { csv_text: csvText, contamination: 0.05 }
        : {
            csv_text: csvText,
            target_column: targetColumn,
            problem_type: modelMode,
            group_column: groupColumn || null,
            test_size: 0.2,
          }
      const response = await fetch(
        modelMode === 'anomaly' ? '/api/analytics/anomalies' : '/api/analytics/train',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
      )
      const result = await readApiResponse<ModelResult>(response)
      setModelResult(result)
    } catch (reason) {
      setModelError(reason instanceof Error ? reason.message : 'Could not contact the local model API.')
    } finally {
      setModelLoading(false)
    }
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">USER-PROVIDED DATA</span><h1>Fire risk analytics</h1><p>Inspect a CSV you provide. This workspace computes descriptive statistics only; it does not predict fire risk.</p></div>
        <span className="assistant-mode"><ChartNoAxesCombined size={16} /> LOCAL ANALYSIS</span>
      </header>
      <section className="panel analytics-upload">
        <div className="upload-copy"><span className="upload-icon"><FileSpreadsheet size={20} /></span><div><h2>Upload an experimental CSV</h2><p>Maximum 10 MB and 50,000 rows. Data stays in this browser unless you explicitly submit it to the local API.</p></div></div>
        <label className="button-primary upload-button">Choose CSV file<input accept=".csv,text/csv" onChange={loadFile} type="file" /></label>
        {loading && <span className="small-muted">Reading and validating file…</span>}
        {fileName && <span className="file-loaded">{fileName} · {analysis?.rows.length.toLocaleString()} rows</span>}
      </section>
      {error && <div className="error-banner" role="alert"><AlertCircle size={16} />{error}</div>}
      {!analysis && !error && <div className="analytics-empty"><FileSpreadsheet size={25} /><h2>No file selected</h2><p>Upload a CSV to inspect its columns, missing values, numeric summaries, and trends.</p></div>}
      {analysis && <>
        <section className="panel tool-panel">
          <div className="panel-heading"><div><span className="section-kicker">DATA QUALITY SNAPSHOT</span><h2>Numeric column summaries</h2></div><span className="small-muted">{analysis.headers.length} columns · {analysis.rows.length.toLocaleString()} records</span></div>
          {analysis.numeric.length === 0 ? <p className="panel-description">No columns with enough numeric values were detected.</p> : <div className="summary-table-wrap"><table className="comparison-table summary-table"><thead><tr><th>Column</th><th>Values</th><th>Missing</th><th>Mean</th><th>Minimum</th><th>Maximum</th></tr></thead><tbody>{analysis.numeric.map((item) => <tr key={item.name}><th>{item.name}</th><td>{item.count.toLocaleString()}</td><td>{item.missing.toLocaleString()}</td><td>{item.mean.toPrecision(5)}</td><td>{item.min.toPrecision(5)}</td><td>{item.max.toPrecision(5)}</td></tr>)}</tbody></table></div>}
        </section>
        {analysis.numeric.length > 0 && <section className="panel tool-panel">
          <div className="panel-heading"><div><span className="section-kicker">OBSERVATION ORDER</span><h2>Numeric series preview</h2></div><label className="select-field">Column<select onChange={(event) => setSeries(event.target.value)} value={series}>{analysis.numeric.map(({ name }) => <option key={name}>{name}</option>)}</select></label></div>
          <div className="analytics-chart"><ResponsiveContainer height="100%" width="100%"><LineChart data={chartData}><CartesianGrid stroke="#1b2b3c" strokeDasharray="3 3" /><XAxis dataKey="observation" stroke="#71879b" tick={{ fill: '#64748b', fontFamily: 'Inter', fontSize: 10 }} tickLine={false} /><YAxis stroke="#71879b" tick={{ fill: '#94a3b8', fontFamily: 'Inter', fontSize: 10 }} tickLine={false} width={54} /><Tooltip contentStyle={{ background: '#0c1928', border: '1px solid #26394d', borderRadius: 8, color: '#f8fafc', fontFamily: 'Inter' }} /><Line dataKey="value" dot={false} name={series} stroke="#54d6ee" strokeWidth={2} type="monotone" /></LineChart></ResponsiveContainer></div>
          <p className="panel-description">Chart displays up to the first 1,000 valid values in row order. No time, run, or test-condition semantics are inferred.</p>
        </section>}
        <section className="panel tool-panel api-analysis-panel">
          <div><span className="section-kicker">OPTIONAL LOCAL SERVICE</span><h2>Pairwise correlation analysis</h2><p className="panel-description">Send this CSV to your local FastAPI service for pairwise Pearson correlations. The API does not send files to NASA or an external model.</p></div>
          <button className="button-secondary" disabled={apiLoading} onClick={analyzeWithLocalApi} type="button">{apiLoading ? 'Analyzing…' : 'Run local API analysis'}</button>
          {apiResult && <p aria-live="polite" className="api-analysis-result" role="status">{apiResult}</p>}
        </section>
        <section className="panel tool-panel model-panel">
          <div className="panel-heading"><div><span className="section-kicker">EXPLORATORY MACHINE LEARNING</span><h2>Train or detect anomalies</h2></div><span className="library-kind">LOCAL API</span></div>
          <p className="panel-description">Use the FastAPI service for Random Forest classification/regression or Isolation Forest anomaly detection. Choose a target explicitly; use a run/group column to keep related observations in the same split where available.</p>
          <div className="model-controls">
            <label className="select-field">Analysis type<select onChange={(event) => { const next = event.target.value as ModelMode; setModelMode(next); if (next === 'regression' && analysis.numeric.length) setTargetColumn(analysis.numeric[0].name); else if (next === 'classification' && !analysis.headers.includes(targetColumn)) setTargetColumn(analysis.headers[0] ?? ''); setModelResult(null); setModelError('') }} value={modelMode}><option value="classification">Random Forest classification</option><option value="regression">Random Forest regression</option><option value="anomaly">Isolation Forest anomaly detection</option></select></label>
            {modelMode !== 'anomaly' && <label className="select-field">Prediction target<select onChange={(event) => setTargetColumn(event.target.value)} value={targetColumn}>{modelTargets.length === 0 && <option value="">No compatible target column</option>}{modelTargets.map((header) => <option key={header}>{header}</option>)}</select></label>}
            {modelMode !== 'anomaly' && <label className="select-field">Group column (optional)<select onChange={(event) => setGroupColumn(event.target.value)} value={groupColumn}><option value="">Random split</option>{analysis.headers.filter((header) => header !== targetColumn).map((header) => <option key={header}>{header}</option>)}</select></label>}
            <button className="button-primary" disabled={modelLoading || (modelMode !== 'anomaly' && (!targetColumn || !modelTargets.includes(targetColumn)))} onClick={runModel} type="button">{modelLoading ? 'Running…' : 'Run exploratory model'}</button>
          </div>
          {modelError && <p className="error-banner" role="alert"><AlertCircle size={15} />{modelError}</p>}
          {modelResult && <div className="model-result" role="status">
            <div className="model-result-heading"><strong>{modelResult.model}</strong><span>{modelResult.train_rows !== undefined ? `${modelResult.train_rows} train / ${modelResult.test_rows} test rows · ${modelResult.split_method}` : `${modelResult.anomaly_count} flagged observations`}</span></div>
            {modelResult.metrics && <pre>{JSON.stringify(modelResult.metrics, null, 2)}</pre>}
            {modelResult.feature_importance && <div className="importance-list">{modelResult.feature_importance.map(({ feature, importance }) => <div key={feature}><span>{feature}</span><div><i style={{ width: `${importance * 100}%` }} /></div><strong>{importance.toFixed(3)}</strong></div>)}</div>}
            {modelResult.anomalies && <p className="panel-description">Flagged data rows: {modelResult.anomalies.map(({ data_row }) => data_row).join(', ') || 'none'}.</p>}
            <p className="model-limitation">{modelResult.limitation}</p>
          </div>}
        </section>
        <section className="panel tool-panel">
          <div className="panel-heading"><div><span className="section-kicker">RAW PREVIEW</span><h2>First 10 records</h2></div></div>
          <div className="comparison-scroll"><table className="comparison-table summary-table"><thead><tr><th>#</th>{analysis.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{analysis.rows.slice(0, 10).map((row, index) => <tr key={`${index}-${row[0]}`}><th>{index + 1}</th>{row.map((cell, cellIndex) => <td key={`${cellIndex}-${analysis.headers[cellIndex]}`}>{cell || <span className="missing-cell">missing</span>}</td>)}</tr>)}</tbody></table></div>
        </section>
      </>}
      <aside className="evidence-boundary"><ShieldAlert size={16} /><p>Uploaded data are not presumed to be NASA data. The local API only receives file contents when you explicitly run an API analysis; no external service receives them. Models are exploratory and not flight-certified or NASA-validated.</p></aside>
    </div>
  )
}
