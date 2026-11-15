export interface FlamePixelMetrics {
  pixelCount: number
  flameLikePixels: number
  areaPercent: number
  bounds: { x: number; y: number; width: number; height: number } | null
  centroid: { x: number; y: number } | null
  colors: { orange: number; yellow: number; red: number; blue: number }
}

export interface ImageFrameResult extends FlamePixelMetrics {
  fileName: string
  width: number
  height: number
  originalPreview: string
  annotatedPreview: string
}

export function isFlameLikePixel(red: number, green: number, blue: number): boolean {
  return red >= 150 && green >= 38 && red > green * 1.08 && red > blue * 1.18
}

export function analyzeFlamePixels(data: Uint8ClampedArray, width: number, height: number): FlamePixelMetrics {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || data.length !== width * height * 4) {
    throw new Error('Image pixel data dimensions are invalid.')
  }

  let flameLikePixels = 0
  let totalX = 0
  let totalY = 0
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  const colors = { orange: 0, yellow: 0, red: 0, blue: 0 }

  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset]
    const green = data[offset + 1]
    const blue = data[offset + 2]
    if (blue > red * 1.1 && blue > green * 1.1 && blue > 80) colors.blue += 1
    if (!isFlameLikePixel(red, green, blue)) continue

    const pixel = offset / 4
    const x = pixel % width
    const y = Math.floor(pixel / width)
    flameLikePixels += 1
    totalX += x
    totalY += y
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    if (red > 200 && green > 150) colors.yellow += 1
    else if (red > 200 && green > 80) colors.orange += 1
    else colors.red += 1
  }

  return {
    pixelCount: width * height,
    flameLikePixels,
    areaPercent: (flameLikePixels / (width * height)) * 100,
    bounds: flameLikePixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null,
    centroid: flameLikePixels ? { x: totalX / flameLikePixels, y: totalY / flameLikePixels } : null,
    colors,
  }
}

export async function inspectImageFile(file: File): Promise<ImageFrameResult> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not a supported image.`)
  if (file.size > 12 * 1024 * 1024) throw new Error(`${file.name} exceeds the 12 MB per-image limit.`)
  if (typeof createImageBitmap !== 'function') throw new Error('This browser does not support local image decoding.')

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 960 / bitmap.width, 640 / bitmap.height)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const original = document.createElement('canvas')
    original.width = width
    original.height = height
    const context = original.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Could not create an image-processing canvas.')

    context.drawImage(bitmap, 0, 0, width, height)
    const image = context.getImageData(0, 0, width, height)
    const metrics = analyzeFlamePixels(image.data, width, height)
    const overlay = new Uint8ClampedArray(image.data.length)

    for (let offset = 0; offset < image.data.length; offset += 4) {
      const red = image.data[offset]
      const green = image.data[offset + 1]
      const blue = image.data[offset + 2]
      if (!isFlameLikePixel(red, green, blue)) continue
      overlay[offset] = 255
      overlay[offset + 1] = 122
      overlay[offset + 2] = 48
      overlay[offset + 3] = 118
    }

    const annotated = document.createElement('canvas')
    annotated.width = width
    annotated.height = height
    const annotatedContext = annotated.getContext('2d')
    if (!annotatedContext) throw new Error('Could not create an annotation canvas.')
    annotatedContext.drawImage(original, 0, 0)
    annotatedContext.putImageData(new ImageData(overlay, width, height), 0, 0)
    if (metrics.bounds) {
      annotatedContext.strokeStyle = '#7dd3fc'
      annotatedContext.lineWidth = Math.max(2, width / 360)
      annotatedContext.strokeRect(metrics.bounds.x, metrics.bounds.y, metrics.bounds.width, metrics.bounds.height)
    }

    return {
      ...metrics,
      fileName: file.name,
      width,
      height,
      originalPreview: original.toDataURL('image/jpeg', 0.88),
      annotatedPreview: annotated.toDataURL('image/jpeg', 0.88),
    }
  } finally {
    bitmap.close()
  }
}

export async function createIllustrativeSampleFile(): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 320
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create the illustrative sample image.')

  const background = context.createLinearGradient(0, 0, 0, canvas.height)
  background.addColorStop(0, '#111827')
  background.addColorStop(1, '#080d1b')
  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  const glow = context.createRadialGradient(240, 218, 8, 240, 218, 150)
  glow.addColorStop(0, 'rgba(255, 122, 48, 0.42)')
  glow.addColorStop(1, 'rgba(255, 122, 48, 0)')
  context.fillStyle = glow
  context.fillRect(70, 50, 340, 270)

  context.save()
  context.translate(240, 0)
  context.beginPath()
  context.moveTo(0, 58)
  context.bezierCurveTo(-16, 110, -82, 155, -78, 221)
  context.bezierCurveTo(-75, 276, -37, 295, 0, 296)
  context.bezierCurveTo(41, 295, 79, 269, 77, 220)
  context.bezierCurveTo(74, 171, 29, 136, 23, 101)
  context.bezierCurveTo(20, 84, 11, 68, 0, 58)
  context.closePath()
  const flame = context.createLinearGradient(0, 80, 0, 296)
  flame.addColorStop(0, '#fde68a')
  flame.addColorStop(0.38, '#fb923c')
  flame.addColorStop(0.75, '#f97316')
  flame.addColorStop(1, '#ef4444')
  context.fillStyle = flame
  context.shadowColor = '#fb923c'
  context.shadowBlur = 28
  context.fill()
  context.restore()

  context.beginPath()
  context.moveTo(240, 167)
  context.bezierCurveTo(222, 203, 224, 221, 229, 244)
  context.bezierCurveTo(233, 262, 247, 266, 255, 252)
  context.bezierCurveTo(267, 229, 251, 199, 240, 167)
  context.closePath()
  context.fillStyle = '#fff3b0'
  context.shadowColor = '#fff3b0'
  context.shadowBlur = 16
  context.fill()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not encode the illustrative sample image.')
  return new File([blob], 'project-generated-illustrative-flame.png', { type: 'image/png' })
}
