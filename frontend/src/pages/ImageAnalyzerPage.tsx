import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, Camera, ImagePlus, Info, LoaderCircle, RotateCcw, ScanSearch, Sparkles } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { createIllustrativeSampleFile, inspectImageFile, type ImageFrameResult } from '../services/imageAnalysis'
import { readApiResponse } from '../services/api'
import { EvidenceCallout } from '../components/EvidenceCallout'

const MAX_IMAGES = 12
const MAX_TOTAL_BYTES = 48 * 1024 * 1024

interface OpenCvResult {
  file_name: string
  width: number
  height: number
  candidate_pixels: number
  area_percent: number
  bounds: { x: number; y: number; width: number; height: number } | null
  centroid: { x: number; y: number } | null
  annotated_image_base64: string
  algorithm: string
  limitation: string
}

function readImageBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected image.'))
        return
      }
      const separator = reader.result.indexOf(',')
      if (separator < 0) {
        reject(new Error('The selected image could not be encoded.'))
        return
      }
      resolve(reader.result.slice(separator + 1))
    }
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.readAsDataURL(file)
  })
}

export function ImageAnalyzerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<ImageFrameResult[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selected, setSelected] = useState(0)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [opencvResult, setOpenCvResult] = useState<OpenCvResult | null>(null)
  const [opencvError, setOpenCvError] = useState('')
  const [opencvLoading, setOpenCvLoading] = useState(false)
  const chartData = useMemo(() => results.map((result, index) => ({ frame: index + 1, area: Number(result.areaPercent.toFixed(3)), name: result.fileName })), [results])
  const current = results[selected]

  async function processFiles(files: File[]) {
    setError('')
    setOpenCvError('')
    setOpenCvResult(null)
    setResults([])
    setSelectedFiles([])
    setSelected(0)
    setProcessing(true)
    try {
      if (!files.length) return
      if (files.length > MAX_IMAGES) throw new Error(`Select no more than ${MAX_IMAGES} images at once.`)
      if (files.some((file) => !file.type.startsWith('image/'))) throw new Error('Choose image files only. Ordered image sequences are supported; video files are not.')
      if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) throw new Error('The selected images exceed the 48 MB total limit.')

      const inspected: ImageFrameResult[] = []
      for (const file of files) inspected.push(await inspectImageFile(file))
      setResults(inspected)
      setSelectedFiles(files)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The selected images could not be analyzed.')
    } finally {
      setProcessing(false)
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    await processFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function loadIllustrativeSample() {
    setProcessing(true)
    setError('')
    try {
      await processFiles([await createIllustrativeSampleFile()])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The illustrative sample could not be loaded.')
      setProcessing(false)
    }
  }

  function clearResults() {
    setResults([])
    setSelectedFiles([])
    setSelected(0)
    setError('')
    setOpenCvError('')
    setOpenCvResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function runOpenCv() {
    const file = selectedFiles[selected]
    if (!file) return
    setOpenCvLoading(true)
    setOpenCvError('')
    setOpenCvResult(null)
    try {
      const imageBase64 = await readImageBase64(file)
      const response = await fetch('/api/analytics/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64, file_name: file.name }),
      })
      setOpenCvResult(await readApiResponse<OpenCvResult>(response))
    } catch (reason) {
      setOpenCvError(reason instanceof Error ? reason.message : 'The local OpenCV service could not analyze the image.')
    } finally {
      setOpenCvLoading(false)
    }
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">LOCAL IMAGE PROCESSING</span><h1>Flame image analyzer</h1><p>Inspect a combustion image or ordered image sequence with a transparent pixel-color heuristic.</p></div>
        <span className="assistant-mode"><ScanSearch size={15} /> NO TRAINED AI MODEL</span>
      </header>
      <section className="panel image-upload-panel">
        <div className="image-upload-copy"><span className="image-upload-icon"><ImagePlus size={20} /></span><div><strong>Choose images to analyze</strong><span>Up to {MAX_IMAGES} images · 12 MB each · processed locally in your browser</span></div></div>
        <input accept="image/*" aria-label="Upload flame images" className="sr-only" multiple onChange={(event) => void handleUpload(event)} ref={inputRef} type="file" />
        <div className="image-upload-actions">
          <button className="button-primary" disabled={processing} onClick={() => inputRef.current?.click()} type="button"><Camera size={15} />{processing ? 'Analyzing…' : 'Select images'}</button>
          <button className="button-secondary" disabled={processing} onClick={() => void loadIllustrativeSample()} type="button">{processing ? 'Preparing…' : 'Try illustrative sample'}</button>
          {results.length > 0 && <button className="button-secondary" onClick={clearResults} type="button"><RotateCcw size={14} /> Clear</button>}
        </div>
      </section>
      <EvidenceCallout kind="illustrative" title="Sample image is generated by this project">
        The demo flame is drawn in your browser. It is not NASA imagery, experimental data, or a fire-risk example; it helps you preview the image-processing controls.
      </EvidenceCallout>
      {error && <p className="error-banner" role="alert"><AlertCircle size={15} />{error}</p>}
      {!current && !processing && <div className="image-empty-state"><div><ImagePlus size={24} /><strong>Waiting for an image</strong><span>Flame-like pixels will be highlighted in orange. This visual heuristic does not determine fire risk.</span></div></div>}
      {current && (
        <>
          <div className="image-analysis-grid">
            <section className="panel image-preview-panel">
              <div className="panel-heading"><div><span className="section-kicker">FRAME {String(selected + 1).padStart(2, '0')} / {String(results.length).padStart(2, '0')}</span><h2>{current.fileName}</h2></div><span className="library-kind">{current.width} × {current.height}</span></div>
              <div className="image-pair">
                <figure><img alt={`Original ${current.fileName}`} src={current.originalPreview} /><figcaption>Original image</figcaption></figure>
                <figure><img alt={`Heuristic flame-pixel annotation of ${current.fileName}`} src={current.annotatedPreview} /><figcaption><i /> Candidate pixels + extent box</figcaption></figure>
              </div>
              {results.length > 1 && <div className="frame-selector" aria-label="Select image frame">{results.map((frame, index) => <button aria-pressed={selected === index} key={`${frame.fileName}-${index}`} onClick={() => { setSelected(index); setOpenCvResult(null); setOpenCvError('') }} type="button"><img alt="" src={frame.originalPreview} /><span>{String(index + 1).padStart(2, '0')}</span></button>)}</div>}
            </section>
            <section className="panel image-metrics-panel">
              <div className="panel-heading"><div><span className="section-kicker">HEURISTIC DESCRIPTORS</span><h2>Image metrics</h2></div></div>
              <div className="image-metric-grid">
                <div><span>Candidate pixel area</span><strong>{current.areaPercent.toFixed(2)}%</strong></div>
                <div><span>Candidate pixels</span><strong>{current.flameLikePixels.toLocaleString()}</strong></div>
                <div><span>Bounding extent</span><strong>{current.bounds ? `${current.bounds.width} × ${current.bounds.height}` : 'None found'}</strong></div>
                <div><span>Centroid</span><strong>{current.centroid ? `${Math.round(current.centroid.x)}, ${Math.round(current.centroid.y)}` : 'None found'}</strong></div>
              </div>
              {results.length > 1 && <div className="sequence-chart"><div className="panel-heading"><div><span className="section-kicker">IMAGE SEQUENCE</span><h3>Candidate pixel area</h3></div></div><div className="chart-wrap"><ResponsiveContainer height="100%" width="100%"><LineChart data={chartData}><CartesianGrid stroke="#26344c" strokeDasharray="3 3" /><XAxis dataKey="frame" stroke="#71839a" tick={{ fill: '#64748b', fontFamily: 'Inter', fontSize: 10 }} tickLine={false} /><YAxis stroke="#71839a" tick={{ fill: '#94a3b8', fontFamily: 'Inter', fontSize: 10 }} tickLine={false} unit="%" width={44} /><Tooltip contentStyle={{ background: '#111b2e', border: '1px solid #344760', borderRadius: 8, color: '#f8fafc', fontFamily: 'Inter' }} formatter={(value) => [`${value}%`, 'Candidate pixel area']} /><Line dataKey="area" dot={{ r: 3 }} name="Candidate pixel area" stroke="#ff7a30" strokeWidth={2} type="monotone" /></LineChart></ResponsiveContainer></div></div>}
              <div className="image-color-legend"><span><i className="color-orange" /> Orange {current.colors.orange.toLocaleString()}</span><span><i className="color-yellow" /> Yellow {current.colors.yellow.toLocaleString()}</span><span><i className="color-red" /> Red {current.colors.red.toLocaleString()}</span><span><i className="color-blue" /> Blue {current.colors.blue.toLocaleString()}</span></div>
              <button className="button-secondary opencv-button" disabled={opencvLoading} onClick={() => void runOpenCv()} type="button">{opencvLoading ? <LoaderCircle className="spin-icon" size={14} /> : <Sparkles size={14} />}{opencvLoading ? 'Running OpenCV…' : 'Run OpenCV on local API'}</button>
              <p className="local-transfer-note">Optional: sends only the selected image to your local FastAPI service; it is not uploaded to NASA or an external server.</p>
              {opencvError && <p className="error-banner" role="alert"><AlertCircle size={14} />{opencvError}</p>}
              {opencvResult && <div className="opencv-result" role="status"><div><span className="section-kicker">LOCAL OPENCV RESULT</span><strong>{opencvResult.area_percent.toFixed(2)}% candidate pixels</strong><small>{opencvResult.algorithm}</small></div><img alt={`OpenCV candidate-region annotation of ${opencvResult.file_name}`} src={`data:image/jpeg;base64,${opencvResult.annotated_image_base64}`} /><small>{opencvResult.limitation}</small></div>}
            </section>
          </div>
          <aside className="evidence-boundary"><Info size={16} /><p>Color-threshold heuristics only; no image is sent externally. Browser analysis stays in the browser; the optional OpenCV action sends the selected image only to your local API. Metrics describe pixels in your upload, not NASA measurements. Lighting, background, camera settings, smoke, and non-flame objects can produce false matches. This is not an AI model or a fire-risk estimate.</p></aside>
        </>
      )}
    </div>
  )
}
