import { describe, expect, it } from 'vitest'
import { analyzeCsvText, parseCsv } from './csvAnalysis'

describe('CSV parsing and analysis', () => {
  it('handles quoted commas, escaped quotes, and CRLF rows', () => {
    expect(parseCsv('name,note\r\n"sample, 1","said ""yes"""\r\n')).toEqual([
      ['name', 'note'],
      ['sample, 1', 'said "yes"'],
    ])
  })

  it('summarizes numeric columns and reports missing values', () => {
    const result = analyzeCsvText('time,temp,label\n0,10,a\n1,20,b\n2,,c\n')
    expect(result.numeric).toEqual([
      { name: 'time', count: 3, missing: 0, mean: 1, min: 0, max: 2 },
      { name: 'temp', count: 2, missing: 1, mean: 15, min: 10, max: 20 },
    ])
  })

  it('rejects malformed rows and duplicate headers', () => {
    expect(() => analyzeCsvText('a,b\n1\n')).toThrow('Row 2')
    expect(() => analyzeCsvText('a,a\n1,2\n')).toThrow('unique')
  })
})
