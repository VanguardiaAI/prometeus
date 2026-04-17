import './agent.css'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { initNoise } from './noise'

gsap.registerPlugin(Flip, ScrollTrigger, SplitText)

// --- Page transition overlay (white flash bridge from main page) ---
const transitionOverlay = document.getElementById('page-transition-overlay') as HTMLElement | null

if (transitionOverlay && sessionStorage.getItem('prometeus-transition')) {
  sessionStorage.removeItem('prometeus-transition')

  // Start fully white (no transition so it's instant)
  transitionOverlay.classList.add('active')

  // After a frame, remove .active — the CSS transition kicks in and fades to 0
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      transitionOverlay.classList.remove('active')
    })
  })
}

// --- Lenis smooth scroll ---
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// --- HERO scroll animation ---
const heroCopySplit = SplitText.create('.hero-copy h3', {
  type: 'words',
  wordsClass: 'word',
})

let isHeroCopyHidden = false

ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: `+${window.innerHeight * 3.5}px`,
  pin: true,
  pinSpacing: false,
  scrub: 1,
  onUpdate: (self) => {
    const progress = self.progress

    // Slide hero header up
    const heroHeaderProgress = Math.min(progress / 0.29, 1)
    gsap.set('.hero-header', { yPercent: -heroHeaderProgress * 100 })

    // Word-by-word reveal of hero copy
    const heroWordsProgress = Math.max(0, Math.min((progress - 0.29) / 0.21, 1))
    const totalWords = heroCopySplit.words.length
    heroCopySplit.words.forEach((word, i) => {
      const wordStart = i / totalWords
      const wordEnd = (i + 1) / totalWords
      const wordOpacity = Math.max(0, Math.min((heroWordsProgress - wordStart) / (wordEnd - wordStart), 1))
      gsap.set(word, { opacity: wordOpacity })
    })

    // Hide hero copy after 64%
    if (progress > 0.64 && !isHeroCopyHidden) {
      isHeroCopyHidden = true
      gsap.to('.hero-copy h3', { opacity: 0, duration: 0.2 })
    } else if (progress <= 0.64 && isHeroCopyHidden) {
      isHeroCopyHidden = false
      gsap.to('.hero-copy h3', { opacity: 1, duration: 0.2 })
    }

    // Shrink hero image to thumbnail
    const heroImgProgress = Math.max(0, Math.min((progress - 0.71) / 0.29, 1))
    const heroImgWidth = gsap.utils.interpolate(window.innerWidth, 150, heroImgProgress)
    const heroImgHeight = gsap.utils.interpolate(window.innerHeight, 150, heroImgProgress)
    const heroImgBorderRadius = gsap.utils.interpolate(0, 10, heroImgProgress)
    gsap.set('.hero-img', {
      width: heroImgWidth,
      height: heroImgHeight,
      borderRadius: heroImgBorderRadius,
    })
  },
})

// --- ABOUT image columns parallax ---
const aboutImgCols = [
  { id: '#about-imgs-col-1', y: -500 },
  { id: '#about-imgs-col-2', y: -250 },
  { id: '#about-imgs-col-3', y: -250 },
  { id: '#about-imgs-col-4', y: -500 },
]

aboutImgCols.forEach(({ id, y }) => {
  gsap.to(id, {
    y,
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
})

// --- DESK Elements ---
const desk = document.querySelector('.desk') as HTMLElement
const header = document.querySelector('.header') as HTMLElement
const headerTitle = header.querySelector('h1') as HTMLElement
const headerBody = header.querySelector('p') as HTMLElement
const items = gsap.utils.toArray('.item') as HTMLElement[]
const flipTargets = [header, ...items]
const progressFill = document.getElementById('progress-fill') as HTMLElement

let activeMode = 'chaos'

// --- Copy per mode ---
const modeCopy: Record<string, { title: string; body: string }> = {
  chaos: {
    title: 'Raw Potential',
    body: 'Before intelligence, there\u2019s noise. Scattered tools, fragmented data, disconnected systems \u2014 waiting to be understood.',
  },
  cleanup: {
    title: 'Structure Emerges',
    body: 'Order from chaos. Every tool finds its place, every connection mapped, every signal separated from noise.',
  },
  notebook: {
    title: 'Ready to Act',
    body: 'Unified intelligence. Persistent memory. One agent that thinks, remembers, and evolves \u2014 Prometeus.',
  },
}

// --- Item sizes ---
const itemSizes: Record<string, number> = {
  music: 325,
  appicon: 100,
  cd: 400,
  cursor: 125,
  dialog: 300,
  folder: 150,
  lighter: 225,
  macmini: 250,
  paper: 375,
  passport: 250,
  portrait: 375,
}

// --- Mode order for scroll ---
const modes = ['chaos', 'cleanup', 'notebook']

// --- Arrangements ---
const arrangements: Record<string, {
  header: { x: number; y: number; center: boolean }
  items: { id: string; x: number; y: number; rotation: number }[]
}> = {
  chaos: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: 'music', x: -2.5, y: -2.5, rotation: -15 },
      { id: 'appicon', x: 20, y: 15, rotation: 5 },
      { id: 'cd', x: 72.5, y: 5, rotation: 0 },
      { id: 'cursor', x: 72.5, y: 75, rotation: 0 },
      { id: 'dialog', x: 80, y: 60, rotation: 15 },
      { id: 'folder', x: 90, y: 50, rotation: 5 },
      { id: 'lighter', x: 2.5, y: 45, rotation: -10 },
      { id: 'macmini', x: 9.5, y: 55, rotation: 15 },
      { id: 'paper', x: 5, y: 15, rotation: 10 },
      { id: 'passport', x: -2.5, y: 65, rotation: -35 },
      { id: 'portrait', x: 65, y: 20, rotation: -5 },
    ],
  },
  cleanup: {
    header: { x: 70, y: 37.5, center: false },
    items: [
      { id: 'music', x: 76.5, y: -5, rotation: 0 },
      { id: 'appicon', x: 64.5, y: 6, rotation: 0 },
      { id: 'cd', x: 0, y: 47.5, rotation: 0 },
      { id: 'cursor', x: 63.5, y: 23, rotation: 0 },
      { id: 'dialog', x: 34.5, y: 59, rotation: 0 },
      { id: 'folder', x: 24.5, y: 33, rotation: 0 },
      { id: 'lighter', x: -6, y: 3.5, rotation: 0 },
      { id: 'macmini', x: 82.5, y: 66, rotation: 0 },
      { id: 'paper', x: 9, y: -3.5, rotation: 0 },
      { id: 'passport', x: 60, y: 65.5, rotation: 0 },
      { id: 'portrait', x: 36.5, y: 5.5, rotation: 0 },
    ],
  },
  notebook: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: 'music', x: 45, y: 0.5, rotation: 20 },
      { id: 'appicon', x: 65, y: 70, rotation: 25 },
      { id: 'cd', x: 27.5, y: 15, rotation: 10 },
      { id: 'cursor', x: 75, y: 35, rotation: 0 },
      { id: 'dialog', x: 30, y: 57.5, rotation: 10 },
      { id: 'folder', x: 25, y: 40, rotation: 10 },
      { id: 'lighter', x: 30, y: 7.5, rotation: 30 },
      { id: 'macmini', x: 50, y: 50, rotation: -5 },
      { id: 'paper', x: 10, y: 10, rotation: -30 },
      { id: 'passport', x: 16.5, y: 50, rotation: -20 },
      { id: 'portrait', x: 57.5, y: 20, rotation: 10 },
    ],
  },
}

// --- Layout engine ---
function setLayout(mode: string) {
  const deskWidth = desk.offsetWidth
  const deskHeight = desk.offsetHeight
  const layout = arrangements[mode]

  const isMobile = deskWidth < 1000
  const offsetX = isMobile
    ? header.offsetWidth / 2
    : layout.header.center
      ? header.offsetWidth / 2
      : 0
  const offsetY = isMobile
    ? header.offsetHeight / 2
    : layout.header.center
      ? header.offsetHeight / 2
      : 0
  const headerX = isMobile ? 50 : layout.header.x
  const headerY = isMobile ? 47.5 : layout.header.y

  gsap.set(header, {
    x: (headerX / 100) * deskWidth - offsetX,
    y: (headerY / 100) * deskHeight - offsetY,
    rotation: 0,
  })

  layout.items.forEach(({ id, x, y, rotation }) => {
    gsap.set(`#${id}`, {
      x: (x / 100) * deskWidth,
      y: (y / 100) * deskHeight,
      width: itemSizes[id],
      height: itemSizes[id],
      rotation,
    })
  })
}

// --- Text transition ---
function animateTextChange(mode: string) {
  const copy = modeCopy[mode]
  const tl = gsap.timeline()

  // Fade out current text
  tl.to([headerTitle, headerBody], {
    opacity: 0,
    filter: 'blur(8px)',
    duration: 0.3,
    ease: 'power2.in',
  })

  // Swap content and fade in
  tl.call(() => {
    headerTitle.textContent = copy.title
    headerBody.textContent = copy.body
  })

  tl.to([headerTitle, headerBody], {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 0.5,
    ease: 'power2.out',
  })
}

// --- Mode switching with Flip + text ---
function switchMode(mode: string) {
  if (mode === activeMode) return

  const state = Flip.getState(flipTargets)
  setLayout(mode)

  Flip.from(state, {
    duration: 1.25,
    ease: 'power3.inOut',
    stagger: { amount: 0.1, from: 'center' },
    absolute: true,
  })

  animateTextChange(mode)
  activeMode = mode
}

// --- Init layout + text ---
setLayout('chaos')
headerTitle.textContent = modeCopy.chaos.title
headerBody.textContent = modeCopy.chaos.body

// --- ScrollTrigger: pin desk and switch modes on scroll ---
ScrollTrigger.create({
  trigger: '#scroll-section',
  start: 'top top',
  end: 'bottom bottom',
  pin: '.desk',
  onUpdate: (self) => {
    const progress = self.progress

    // Update progress bar
    progressFill.style.width = `${progress * 100}%`

    // Map scroll progress to mode index
    const modeIndex = Math.min(Math.floor(progress * modes.length), modes.length - 1)
    const targetMode = modes[modeIndex]

    if (targetMode !== activeMode) {
      switchMode(targetMode)
    }
  },
})

// --- Resize handler ---
window.addEventListener('resize', () => setLayout(activeMode))

// --- Scroll reveal for new sections ---
function revealOnScroll(selector: string, options: { stagger?: number; y?: number; delay?: number } = {}) {
  const els = gsap.utils.toArray(selector) as HTMLElement[]
  if (!els.length) return

  gsap.set(els, { opacity: 0, y: options.y ?? 24, filter: 'blur(6px)' })

  ScrollTrigger.batch(els, {
    start: 'top 85%',
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: options.stagger ?? 0.08,
        delay: options.delay ?? 0,
        ease: 'power3.out',
        overwrite: true,
      })
    },
  })
}

revealOnScroll('.capabilities .section-head', { y: 20 })
revealOnScroll('.capabilities .cap-item', { stagger: 0.06, y: 20 })
revealOnScroll('.integrations .section-head', { y: 20 })
revealOnScroll('.architecture .section-head', { y: 20 })
revealOnScroll('.arch-spec > div', { stagger: 0.06, y: 16 })
revealOnScroll('.arch-copy p', { stagger: 0.1, y: 16 })
revealOnScroll('.quickstart .section-head', { y: 20 })
revealOnScroll('.qs-code', { y: 24 })
revealOnScroll('.qs-cta-row', { y: 16, delay: 0.1 })

// --- Noise grain overlay ---
const noiseCanvas = document.getElementById('noise-canvas') as HTMLCanvasElement
if (noiseCanvas) {
  initNoise(noiseCanvas, { size: 512, alpha: 15, refreshInterval: 3 })
}
