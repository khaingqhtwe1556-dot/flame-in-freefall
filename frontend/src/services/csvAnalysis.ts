export interface NumericSummary {
  name: string
  count: number
  missing: number
  mean: number
  min: number
  max: number
}

export interface CsvAnalysis {
  headers: string[]
  rows: string[][]
  numeric: NumericSummary[]
}

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_ROWS = 50_000
const MAX_COLUMNS = 200

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.')
  row.push(cell)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  return rows
}

export function analyzeCsvText(text: string): CsvAnalysis {
  if (new TextEncoder().encode(text).byteLength > MAX_FILE_BYTES) {
    throw new Error('CSV exceeds the 10 MB upload limit.')
  }
  const parsed = parseCsv(text)
  if (parsed.length < 2) throw new Error('CSV must include a header and at least one data row.')
  if (parsed.length - 1 > MAX_ROWS) throw new Error(`CSV exceeds the ${MAX_ROWS.toLocaleString()} row limit.`)

  const headers = parsed[0].map((header) => header.trim())
  if (headers.length > MAX_COLUMNS) throw new Error(`CSV exceeds the ${MAX_COLUMNS} column limit.`)
  if (headers.some((header) => header.length === 0)) throw new Error('Every CSV column needs a header.')
  if (new Set(headers).size !== headers.length) throw new Error('CSV column headers must be unique.')

  const rows = parsed.slice(1).map((cells, rowIndex) => {
    if (cells.length !== headers.length) {
      throw new Error(`Row ${rowIndex + 2} has ${cells.length} cells; expected ${headers.length}.`)
    }
    return cells
  })

  const numeric = headers.flatMap((name, columnIndex) => {
    const present = rows.map((row) => row[columnIndex].trim()).filter(Boolean)
    const values = present.map(Number).filter(Number.isFinite)
    if (values.length < 2 || values.length < present.length * 0.8) return []
    return [{
      name,
      count: values.length,
      missing: rows.length - values.length,
      mean: values.reduce((total, value) => total + value, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }]
  })

  return { headers, rows, numeric }
}

export function validateCsvFile(file: File): void {
  if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Choose a .csv file.')
  if (file.size > MAX_FILE_BYTES) throw new Error('CSV exceeds the 10 MB upload limit.')
}
