import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initNoise } from './noise'

gsap.registerPlugin(ScrollTrigger)

// --- Config ---
const TOTAL_FRAMES = 75
const FRAME_PATH = (i: number) => `/frames/frame_${String(i).padStart(4, '0')}.jpg`

// --- Elements ---
const canvas = document.getElementById('scroll-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const loopVideo = document.getElementById('loop-video') as HTMLVideoElement
const scrollIndicator = document.getElementById('scroll-indicator')!
const progressFill = document.getElementById('progress-fill')!
const heroContent = document.getElementById('hero-content')!
const loader = document.getElementById('loader')!
const loaderFill = loader.querySelector('.loader-fill') as HTMLElement
const loaderPercent = loader.querySelector('.loader-percent') as HTMLElement

// --- State ---
const frames: HTMLImageElement[] = []
let currentFrame = 0
let targetFrame = 0
let loopStarted = false
let indicatorHidden = false
let ready = false

// --- Lenis smooth scroll ---
const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
  wheelMultiplier: 0.8,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// --- Canvas sizing ---
function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  if (ready) drawFrame(currentFrame)
}
window.addEventListener('resize', resizeCanvas)
resizeCanvas()

// --- Draw a frame to canvas (cover fit) ---
function drawFrame(index: number) {
  const img = frames[index]
  if (!img) return

  const cw = canvas.width
  const ch = canvas.height
  const iw = img.naturalWidth
  const ih = img.naturalHeight

  // Cover fit
  const scale = Math.max(cw / iw, ch / ih)
  const dw = iw * scale
  const dh = ih * scale
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2

  ctx.clearRect(0, 0, cw, ch)
  ctx.drawImage(img, dx, dy, dw, dh)
}

// --- Preload all frames ---
function preloadFrames(): Promise<void> {
  let loaded = 0

  return new Promise((resolve) => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = FRAME_PATH(i)
      img.onload = () => {
        loaded++
        const pct = Math.round((loaded / TOTAL_FRAMES) * 100)
        loaderFill.style.width = `${pct}%`
        loaderPercent.textContent = `${pct}%`
        if (loaded === TOTAL_FRAMES) resolve()
      }
      img.onerror = () => {
        loaded++
        if (loaded === TOTAL_FRAMES) resolve()
      }
      frames[i - 1] = img
    }
  })
}

// --- Lerp animation loop (butter-smooth frame interpolation) ---
function startRenderLoop() {
  function tick() {
    // Lerp current toward target
    currentFrame += (targetFrame - currentFrame) * 0.12

    const frameIndex = Math.min(Math.max(Math.round(currentFrame), 0), TOTAL_FRAMES - 1)

    if (!loopStarted) {
      drawFrame(frameIndex)
    }

    requestAnimationFrame(tick)
  }
  tick()
}

// --- Setup ScrollTrigger ---
function setupScroll() {
  ScrollTrigger.create({
    trigger: '#scroll-section',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      targetFrame = self.progress * (TOTAL_FRAMES - 1)

      progressFill.style.width = `${self.progress * 100}%`

      if (self.progress > 0.03 && !indicatorHidden) {
        indicatorHidden = true
        scrollIndicator.classList.add('hidden')
      }

      if (self.progress >= 0.95) {
        startLoopVideo()
      } else if (self.progress < 0.9) {
        stopLoopVideo()
      }
    },
  })
}

// --- Loop video transitions ---
function startLoopVideo() {
  if (loopStarted) return
  loopStarted = true

  loopVideo.play()
  gsap.to(loopVideo, { opacity: 1, duration: 1, ease: 'power2.inOut' })
  gsap.to(canvas, { opacity: 0, duration: 1, ease: 'power2.inOut' })
  gsap.to('#progress-bar', { opacity: 0, duration: 0.5 })

  heroContent.classList.add('visible')
  animateHeroIn()
}

function stopLoopVideo() {
  if (!loopStarted) return
  loopStarted = false

  loopVideo.pause()
  gsap.to(loopVideo, { opacity: 0, duration: 0.4, ease: 'power2.inOut' })
  gsap.to(canvas, { opacity: 1, duration: 0.4, ease: 'power2.inOut' })
  gsap.to('#progress-bar', { opacity: 1, duration: 0.3 })

  heroContent.classList.remove('visible')
  resetHero()
}

// --- Text splitting for blur-reveal ---
let splitDone = false

function splitTextIntoChars(selector: string) {
  const el = document.querySelector(selector) as HTMLElement
  if (!el || el.dataset.split === '1') return
  const text = el.textContent || ''
  el.innerHTML = ''
  el.dataset.split = '1'
  for (const char of text) {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = char === ' ' ? '\u00A0' : char
    el.appendChild(span)
  }
}

function splitTextIntoWords(selector: string) {
  const el = document.querySelector(selector) as HTMLElement
  if (!el || el.dataset.split === '1') return
  // Preserve <br> tags
  const html = el.innerHTML
  const parts = html.split(/<br\s*\/?>/i)
  el.innerHTML = ''
  el.dataset.split = '1'
  parts.forEach((part, pi) => {
    const words = part.trim().split(/\s+/)
    words.forEach((word, wi) => {
      const span = document.createElement('span')
      span.className = 'word'
      span.textContent = word
      el.appendChild(span)
      if (wi < words.length - 1) {
        const space = document.createElement('span')
        space.className = 'word'
        space.innerHTML = '&nbsp;'
        el.appendChild(space)
      }
    })
    if (pi < parts.length - 1) {
      el.appendChild(document.createElement('br'))
    }
  })
}

function ensureSplit() {
  if (splitDone) return
  splitDone = true
  splitTextIntoChars('.hero-title')
  splitTextIntoChars('.hero-subtitle')
  splitTextIntoWords('.hero-body')
}

function animateHeroIn() {
  ensureSplit()

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // Title — char-by-char blur reveal L→R
  const titleChars = document.querySelectorAll('.hero-title .char')
  gsap.set(titleChars, { opacity: 0, filter: 'blur(12px)' })
  gsap.set('.hero-title', { opacity: 1, y: 0 })
  tl.to(titleChars, {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 0.6,
    stagger: 0.045,
    ease: 'power2.out',
  })

  // Subtitle — char-by-char blur reveal L→R
  const subChars = document.querySelectorAll('.hero-subtitle .char')
  gsap.set(subChars, { opacity: 0, filter: 'blur(10px)' })
  gsap.set('.hero-subtitle', { opacity: 1, y: 0 })
  tl.to(subChars, {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 0.5,
    stagger: 0.025,
    ease: 'power2.out',
  }, '-=0.4')

  // Body — word-by-word blur reveal
  const bodyWords = document.querySelectorAll('.hero-body .word')
  gsap.set(bodyWords, { opacity: 0, filter: 'blur(6px)' })
  gsap.set('.hero-body', { opacity: 1, y: 0 })
  tl.to(bodyWords, {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 0.4,
    stagger: 0.03,
    ease: 'power2.out',
  }, '-=0.3')

  // CTA + footer — simple fade
  tl.to('.hero-cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
    .to('.hero-footer', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
}

function resetHero() {
  gsap.set(['.hero-title', '.hero-subtitle', '.hero-body', '.hero-cta', '.hero-footer'], {
    opacity: 0, y: 20,
  })
  // Reset individual chars/words too
  document.querySelectorAll('.hero-title .char, .hero-subtitle .char, .hero-body .word').forEach(el => {
    ;(el as HTMLElement).style.opacity = '0'
    ;(el as HTMLElement).style.filter = 'blur(12px)'
  })
}

// --- Init ---
async function init() {
  await preloadFrames()

  ready = true
  drawFrame(0)

  // Hide loader
  gsap.to(loader, {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    onComplete: () => { loader.style.display = 'none' },
  })

  setupScroll()
  startRenderLoop()
}

// --- Flash effect on Begin hover ---
const flashImage = document.getElementById('flash-image') as HTMLImageElement
const flashWhite = document.getElementById('flash-white') as HTMLElement
const ctaPrimary = document.querySelector('.cta-primary') as HTMLAnchorElement
let flashActive = false

function flashIn() {
  if (flashActive) return
  flashActive = true

  const tl = gsap.timeline()

  // 1. White flash IN
  tl.to(flashWhite, { opacity: 0.9, duration: 0.3, ease: 'power2.in' })
  // 2. Show image behind the flash
    .set(flashImage, { opacity: 1 })
  // 3. Fade white flash OUT to reveal the image
    .to(flashWhite, { opacity: 0, duration: 0.7, ease: 'power2.out' })
}

function flashOut() {
  if (!flashActive) return
  flashActive = false

  const tl = gsap.timeline()

  // 1. White flash IN
  tl.to(flashWhite, { opacity: 0.9, duration: 0.3, ease: 'power2.in' })
  // 2. Hide image behind the flash
    .set(flashImage, { opacity: 0 })
  // 3. Fade white flash OUT to reveal loop video again
    .to(flashWhite, { opacity: 0, duration: 0.7, ease: 'power2.out' })
}

ctaPrimary.addEventListener('mouseenter', flashIn)
ctaPrimary.addEventListener('mouseleave', flashOut)
ctaPrimary.addEventListener('click', (e) => {
  e.preventDefault()

  // Kill any running hover flash timeline
  gsap.killTweensOf(flashWhite)
  gsap.killTweensOf(flashImage)

  // Ensure the flash image is visible
  gsap.set(flashImage, { opacity: 1 })

  // Animate white overlay to full opacity, then navigate
  gsap.to(flashWhite, {
    opacity: 1,
    duration: 0.35,
    ease: 'power2.in',
    onComplete: () => {
      sessionStorage.setItem('prometeus-transition', '1')
      window.location.href = '/agent.html'
    },
  })
})

// --- Noise grain overlay ---
const noiseCanvas = document.getElementById('noise-canvas') as HTMLCanvasElement
initNoise(noiseCanvas, { size: 512, alpha: 15, refreshInterval: 3 })

loopVideo.load()
init()
