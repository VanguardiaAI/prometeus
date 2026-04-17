/**
 * Film-grain noise overlay — vanilla port of React Bits <Noise />.
 * Draws random luminance pixels into a fixed canvas at low alpha,
 * refreshing every `refreshInterval` animation frames.
 */

interface NoiseOptions {
  /** Internal resolution of the grain tile (px). Default 256. */
  size?: number
  /** Grain opacity 0-255. Default 20. */
  alpha?: number
  /** Re-draw every N frames (higher = cheaper). Default 2. */
  refreshInterval?: number
}

export function initNoise(
  canvas: HTMLCanvasElement,
  opts: NoiseOptions = {},
) {
  const {
    size = 256,
    alpha = 20,
    refreshInterval = 2,
  } = opts

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  canvas.width = size
  canvas.height = size

  const imageData = ctx.createImageData(size, size)
  const data = imageData.data
  let frame = 0
  let raf: number

  function draw() {
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0
      data[i] = v       // R
      data[i + 1] = v   // G
      data[i + 2] = v   // B
      data[i + 3] = alpha
    }
    ctx!.putImageData(imageData, 0, 0)
  }

  function loop() {
    if (frame % refreshInterval === 0) draw()
    frame++
    raf = requestAnimationFrame(loop)
  }

  draw()   // first frame immediately
  loop()

  return () => cancelAnimationFrame(raf)
}
