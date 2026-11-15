import { describe, expect, it, vi } from 'vitest'
import { analyzeFlamePixels, createIllustrativeSampleFile, isFlameLikePixel } from './imageAnalysis'

describe('local flame-pixel heuristic', () => {
  it('detects warm flame-like pixels and reports their bounds', () => {
    const data = new Uint8ClampedArray([
      20, 40, 90, 255,
      240, 130, 30, 255,
      240, 200, 80, 255,
      30, 40, 50, 255,
    ])
    const result = analyzeFlamePixels(data, 2, 2)

    expect(isFlameLikePixel(240, 130, 30)).toBe(true)
    expect(result.flameLikePixels).toBe(2)
    expect(result.areaPercent).toBe(50)
    expect(result.bounds).toEqual({ x: 0, y: 0, width: 2, height: 2 })
    expect(result.colors.orange).toBe(1)
    expect(result.colors.yellow).toBe(1)
  })

  it('returns an empty result for images with no matching pixels', () => {
    const result = analyzeFlamePixels(new Uint8ClampedArray([10, 20, 30, 255]), 1, 1)
    expect(result.flameLikePixels).toBe(0)
    expect(result.bounds).toBeNull()
    expect(result.centroid).toBeNull()
  })

  it('rejects inconsistent image dimensions', () => {
    expect(() => analyzeFlamePixels(new Uint8ClampedArray(4), 2, 2)).toThrow('dimensions are invalid')
  })

  it('creates a clearly named project-generated image file', async () => {
    const gradient = { addColorStop: vi.fn() }
    const context = {
      createLinearGradient: vi.fn(() => gradient),
      createRadialGradient: vi.fn(() => gradient),
      fillRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      restore: vi.fn(),
      fillStyle: '' as string | CanvasGradient,
      shadowColor: '',
      shadowBlur: 0,
    }
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
      toBlob: (callback: BlobCallback) => callback(new Blob(['illustrative sample'], { type: 'image/png' })),
    }
    vi.stubGlobal('document', { createElement: () => canvas })

    try {
      const sample = await createIllustrativeSampleFile()
      expect(sample.name).toBe('project-generated-illustrative-flame.png')
      expect(sample.type).toBe('image/png')
      expect(sample.size).toBeGreaterThan(0)
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(320)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
