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
revealOnScroll('#arch-term-wrap', { y: 24 })
revealOnScroll('.quickstart .section-head', { y: 20 })
revealOnScroll('.qs-steps', { y: 16 })
revealOnScroll('#qs-term-wrap', { y: 24 })
revealOnScroll('.qs-cta-row', { y: 16, delay: 0.1 })

// --- Typewriter helper for SVG <text> elements ---
function typewrite(target: string, finalText: string): gsap.core.Tween {
  const el = document.querySelector(target) as SVGTextElement | null
  if (!el) return gsap.to({}, { duration: 0 })

  const originalText = finalText
  el.textContent = ''

  const proxy = { n: 0 }
  return gsap.to(proxy, {
    n: originalText.length,
    duration: Math.max(0.35, originalText.length * 0.025),
    ease: 'none',
    onUpdate: () => {
      const len = Math.floor(proxy.n)
      el.textContent = originalText.slice(0, len)
    },
    onComplete: () => {
      el.textContent = originalText
    },
  })
}

// --- Architecture terminal animation ---
function initArchTerminalAnimation() {
  const term = document.getElementById('arch-term')
  if (!term) return

  const archCmd = 'prometeus status'
  const typedEl = term.querySelector('.a-typed-1') as SVGTextElement | null
  if (typedEl) typedEl.textContent = ''

  const lines = [
    '.a-l1', '.a-l2', '.a-l3', '.a-l4', '.a-l5', '.a-l6', '.a-l7',
    '.a-l8', '.a-l9', '.a-l10', '.a-l11', '.a-l12', '.a-l13', '.a-l14',
  ]
  lines.forEach((sel) => gsap.set(`#arch-term ${sel}`, { opacity: 0 }))
  gsap.set('#arch-term .a-progress', { attr: { width: 0 } })

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 3.2,
    defaults: { ease: 'power2.out' },
  })

  // Prompt appears, command types
  tl.to('#arch-term .a-l1', { opacity: 1, duration: 0.35 })
    .add(typewrite('#arch-term .a-typed-1', archCmd), '>')
    .to('#arch-term .a-l2', { opacity: 1, duration: 0.35 }, '+=0.15')

  // Status lines stagger in
  tl.to(
    ['#arch-term .a-l3', '#arch-term .a-l4', '#arch-term .a-l5', '#arch-term .a-l6'],
    { opacity: 1, duration: 0.3, stagger: 0.14 },
    '+=0.05',
  )

  // Channel badges
  tl.to('#arch-term .a-l7', { opacity: 1, duration: 0.4 }, '+=0.1')

  // Incoming message
  tl.to('#arch-term .a-l8', { opacity: 1, duration: 0.35 }, '+=0.3')

  // Processing lines + progress bar
  tl.to('#arch-term .a-l9', { opacity: 1, duration: 0.32 }, '+=0.2')
    .to('#arch-term .a-l10', { opacity: 1, duration: 0.32 }, '+=0.15')
    .to('#arch-term .a-l11', { opacity: 1, duration: 0.32 }, '+=0.15')
    .to('#arch-term .a-l12', { opacity: 1, duration: 0.25 }, '<')
    .to('#arch-term .a-progress', { attr: { width: 400 }, duration: 1.1, ease: 'power1.inOut' }, '<0.1')

  // Outgoing + final prompt
  tl.to('#arch-term .a-l13', { opacity: 1, duration: 0.4 }, '+=0.2')
    .to('#arch-term .a-l14', { opacity: 1, duration: 0.35 }, '+=0.35')

  // Hold, then fade out for next loop
  tl.to({}, { duration: 1.4 })
  tl.to(
    lines.map((s) => `#arch-term ${s}`),
    {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      stagger: { amount: 0.25, from: 'start' },
      onComplete: () => {
        if (typedEl) typedEl.textContent = ''
        gsap.set('#arch-term .a-progress', { attr: { width: 0 } })
      },
    },
  )

  ScrollTrigger.create({
    trigger: '#arch-term-wrap',
    start: 'top 80%',
    end: 'bottom 10%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  })
}

// --- Quick Start terminal animation ---
function initQuickStartTerminalAnimation() {
  const term = document.getElementById('qs-term')
  if (!term) return

  const qLines = [
    '.q-l1', '.q-l2', '.q-l3', '.q-l4', '.q-l5', '.q-l6',
    '.q-l7', '.q-l8', '.q-l9', '.q-l10',
    '.q-l11', '.q-l12', '.q-l13', '.q-l14', '.q-l15', '.q-l16', '.q-l17', '.q-l18',
  ]
  qLines.forEach((sel) => gsap.set(`#qs-term ${sel}`, { opacity: 0 }))

  // Reset state
  gsap.set(['#qs-term .q-bar-1', '#qs-term .q-bar-2', '#qs-term .q-bar-3'], { attr: { width: 0 } })

  const bar1Label = term.querySelector('.q-bar-label-1') as SVGTextElement | null
  const bar2Label = term.querySelector('.q-bar-label-2') as SVGTextElement | null
  const bar3Label = term.querySelector('.q-bar-label-3') as SVGTextElement | null
  const uptimeEl = term.querySelector('.q-uptime') as SVGTextElement | null

  // Clear typed targets
  term.querySelectorAll<SVGTextElement>('.q-typed').forEach((el) => (el.textContent = ''))

  const steps = document.querySelectorAll<HTMLElement>('.qs-step')
  const setActiveStep = (i: number) => {
    steps.forEach((el, idx) => el.classList.toggle('is-active', idx === i))
  }

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 3.5,
    defaults: { ease: 'power2.out' },
  })

  // STEP 01 — CLONE
  tl.call(() => setActiveStep(0))
  tl.to('#qs-term .q-l1', { opacity: 1, duration: 0.35 })
    .add(typewrite('#qs-term .q-typed-1', 'git clone https://github.com/VanguardiaAI/prometeus'), '>')
    .to('#qs-term .q-l2', { opacity: 1, duration: 0.35 }, '+=0.25')

  // Progress bars — show lines then animate fills with counters
  tl.to('#qs-term .q-l3', { opacity: 1, duration: 0.35 }, '+=0.15')
  const barProxy1 = { p: 0 }
  tl.to(barProxy1, {
    p: 1,
    duration: 0.9,
    ease: 'power1.inOut',
    onUpdate: () => {
      gsap.set('#qs-term .q-bar-1', { attr: { width: 220 * barProxy1.p } })
      if (bar1Label) bar1Label.textContent = `${Math.round(barProxy1.p * 100)}%`
    },
  }, '<')

  tl.to('#qs-term .q-l4', { opacity: 1, duration: 0.35 }, '+=0.08')
  const barProxy2 = { p: 0 }
  tl.to(barProxy2, {
    p: 1,
    duration: 1.1,
    ease: 'power1.inOut',
    onUpdate: () => {
      gsap.set('#qs-term .q-bar-2', { attr: { width: 220 * barProxy2.p } })
      if (bar2Label) bar2Label.textContent = `${Math.round(barProxy2.p * 1247).toLocaleString()} / 1,247`
    },
  }, '<')

  tl.to('#qs-term .q-l5', { opacity: 1, duration: 0.35 }, '+=0.08')
  const barProxy3 = { p: 0 }
  tl.to(barProxy3, {
    p: 1,
    duration: 0.75,
    ease: 'power1.inOut',
    onUpdate: () => {
      gsap.set('#qs-term .q-bar-3', { attr: { width: 220 * barProxy3.p } })
      if (bar3Label) bar3Label.textContent = `${Math.round(barProxy3.p * 842)} / 842`
    },
  }, '<')

  tl.to('#qs-term .q-l6', { opacity: 1, duration: 0.4 }, '+=0.2')

  // STEP 02 — CONFIGURE
  tl.call(() => setActiveStep(1))
  tl.to('#qs-term .q-l7', { opacity: 1, duration: 0.35 }, '+=0.25')
  tl.to('#qs-term .q-l8', { opacity: 1, duration: 0.35 }, '+=0.1')
    .add(typewrite('#qs-term .q-typed-2', 'cd prometeus && cp .env.example .env'), '>')

  tl.to('#qs-term .q-l9', { opacity: 1, duration: 0.5 }, '+=0.3')
  tl.to('#qs-term .q-l10', { opacity: 1, duration: 0.4 }, '+=0.2')

  // STEP 03 — LAUNCH
  tl.call(() => setActiveStep(2))
  tl.to('#qs-term .q-l11', { opacity: 1, duration: 0.35 }, '+=0.3')
  tl.to('#qs-term .q-l12', { opacity: 1, duration: 0.35 }, '+=0.1')
    .add(typewrite('#qs-term .q-typed-4', 'docker compose up -d'), '>')

  tl.to('#qs-term .q-l13', { opacity: 1, duration: 0.35 }, '+=0.25')
  tl.to(
    ['#qs-term .q-l14', '#qs-term .q-l15', '#qs-term .q-l16', '#qs-term .q-l17'],
    { opacity: 1, duration: 0.3, stagger: 0.22 },
    '+=0.1',
  )

  // Live banner + uptime ticker
  tl.to('#qs-term .q-l18', { opacity: 1, duration: 0.6, ease: 'power3.out' }, '+=0.25')

  const uptimeProxy = { s: 0 }
  tl.to(uptimeProxy, {
    s: 14,
    duration: 2.5,
    ease: 'none',
    onUpdate: () => {
      if (!uptimeEl) return
      const total = Math.floor(uptimeProxy.s)
      const hh = '00'
      const mm = '00'
      const ss = String(total).padStart(2, '0')
      uptimeEl.textContent = `${hh}:${mm}:${ss}`
    },
  }, '<0.3')

  // Hold, fade out, then reset
  tl.to({}, { duration: 2 })
  tl.to(qLines.map((s) => `#qs-term ${s}`), {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.in',
    stagger: { amount: 0.3, from: 'start' },
    onComplete: () => {
      setActiveStep(-1)
      term.querySelectorAll<SVGTextElement>('.q-typed').forEach((el) => (el.textContent = ''))
      if (bar1Label) bar1Label.textContent = '0%'
      if (bar2Label) bar2Label.textContent = '0 / 1,247'
      if (bar3Label) bar3Label.textContent = '0 / 842'
      gsap.set(['#qs-term .q-bar-1', '#qs-term .q-bar-2', '#qs-term .q-bar-3'], { attr: { width: 0 } })
    },
  })

  ScrollTrigger.create({
    trigger: '#qs-term-wrap',
    start: 'top 80%',
    end: 'bottom 10%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  })
}

initArchTerminalAnimation()
initQuickStartTerminalAnimation()

// --- Capabilities showcase: WhatsApp phone ---
function initCapPhoneAnimation() {
  const phone = document.getElementById('cap-phone')
  if (!phone) return

  const waLines = ['.wa-l0', '.wa-l1', '.wa-l2', '.wa-l3', '.wa-l4', '.wa-l5']
  waLines.forEach((sel) => gsap.set(`#cap-phone ${sel}`, { opacity: 0, y: 10 }))
  gsap.set('#cap-phone .wa-typing', { opacity: 0 })

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 4,
    defaults: { ease: 'power2.out' },
  })

  tl.to('#cap-phone .wa-l0', { opacity: 1, y: 0, duration: 0.45 }, 0.1)
    .to('#cap-phone .wa-l1', { opacity: 1, y: 0, duration: 0.35 }, '+=0.35')
    .to('#cap-phone .wa-l2', { opacity: 1, y: 0, duration: 0.45 }, '+=0.4')
    .to('#cap-phone .wa-typing', { opacity: 1, duration: 0.3 }, '+=0.5')
    .to('#cap-phone .wa-typing', { opacity: 0, duration: 0.3 }, '+=1.6')
    .to('#cap-phone .wa-l3', { opacity: 1, y: 0, duration: 0.55 }, '<0.1')
    .to('#cap-phone .wa-l4', { opacity: 1, y: 0, duration: 0.45 }, '+=0.9')
    .to('#cap-phone .wa-typing', { opacity: 1, duration: 0.3 }, '+=0.5')
    .to('#cap-phone .wa-typing', { opacity: 0, duration: 0.3 }, '+=1.2')
    .to('#cap-phone .wa-l5', { opacity: 1, y: 0, duration: 0.5 }, '<0.1')
    .to({}, { duration: 2.5 })
    .to(
      waLines.map((s) => `#cap-phone ${s}`),
      {
        opacity: 0,
        y: -6,
        duration: 0.5,
        ease: 'power2.in',
        stagger: { amount: 0.3, from: 'start' },
      },
    )

  ScrollTrigger.create({
    trigger: '#cap-showcase',
    start: 'top 85%',
    end: 'bottom 10%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  })
}

// --- Capabilities showcase: CLI console ---
function initCapCliAnimation() {
  const cli = document.getElementById('cap-cli')
  if (!cli) return

  const cLines = ['.c-l1', '.c-l2', '.c-l3', '.c-l4', '.c-l5', '.c-l6', '.c-l7', '.c-l8', '.c-l9', '.c-l10', '.c-l11', '.c-l12']
  cLines.forEach((sel) => gsap.set(`#cap-cli ${sel}`, { opacity: 0 }))
  gsap.set('#cap-cli .c-tp-bar', { attr: { width: 0 } })

  const typedEl = cli.querySelector('.c-typed-1') as SVGTextElement | null
  if (typedEl) typedEl.textContent = ''

  const tpLabel = cli.querySelector('.c-tp-label') as SVGTextElement | null

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 3,
    defaults: { ease: 'power2.out' },
  })

  tl.to('#cap-cli .c-l1', { opacity: 1, duration: 0.35 })
    .add(typewrite('#cap-cli .c-typed-1', 'prometeus logs --follow'), '>')
    .to('#cap-cli .c-l2', { opacity: 1, duration: 0.35 }, '+=0.15')

  // Events stream in, staggered
  tl.to(
    ['#cap-cli .c-l3', '#cap-cli .c-l4', '#cap-cli .c-l5', '#cap-cli .c-l6', '#cap-cli .c-l7', '#cap-cli .c-l8', '#cap-cli .c-l9', '#cap-cli .c-l10'],
    { opacity: 1, duration: 0.3, stagger: 0.22 },
    '+=0.2',
  )

  // Throughput bar
  tl.to('#cap-cli .c-l11', { opacity: 1, duration: 0.4 }, '+=0.2')
  const tpProxy = { p: 0 }
  tl.to(tpProxy, {
    p: 1,
    duration: 1.5,
    ease: 'power1.inOut',
    onUpdate: () => {
      gsap.set('#cap-cli .c-tp-bar', { attr: { width: 280 * tpProxy.p } })
      if (tpLabel) tpLabel.textContent = `${(tpProxy.p * 12.4).toFixed(1)} ev/s`
    },
  }, '<')

  tl.to('#cap-cli .c-l12', { opacity: 1, duration: 0.35 }, '+=0.3')

  tl.to({}, { duration: 2.5 })
  tl.to(cLines.map((s) => `#cap-cli ${s}`), {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in',
    stagger: { amount: 0.25, from: 'start' },
    onComplete: () => {
      if (typedEl) typedEl.textContent = ''
      gsap.set('#cap-cli .c-tp-bar', { attr: { width: 0 } })
      if (tpLabel) tpLabel.textContent = '0 ev/s'
    },
  })

  ScrollTrigger.create({
    trigger: '#cap-showcase',
    start: 'top 85%',
    end: 'bottom 10%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  })
}

// --- Capabilities showcase: cron bash ---
function initCapCronAnimation() {
  const cron = document.getElementById('cap-cron')
  if (!cron) return

  const crLines = ['.cr-l1', '.cr-l2', '.cr-l3', '.cr-l4', '.cr-l5', '.cr-l6', '.cr-l7', '.cr-l8', '.cr-l9', '.cr-l10', '.cr-l11']
  crLines.forEach((sel) => gsap.set(`#cap-cron ${sel}`, { opacity: 0 }))

  const typed1 = cron.querySelector('.cr-typed-1') as SVGTextElement | null
  const typed2 = cron.querySelector('.cr-typed-2') as SVGTextElement | null
  if (typed1) typed1.textContent = ''
  if (typed2) typed2.textContent = ''

  const countdown = cron.querySelector('.cr-countdown') as SVGTextElement | null

  const tl = gsap.timeline({
    paused: true,
    repeat: -1,
    repeatDelay: 3,
    defaults: { ease: 'power2.out' },
  })

  tl.to('#cap-cron .cr-l1', { opacity: 1, duration: 0.35 })
    .add(typewrite('#cap-cron .cr-typed-1', 'prometeus cron list'), '>')
    .to('#cap-cron .cr-l2', { opacity: 1, duration: 0.3 }, '+=0.15')

  tl.to(
    ['#cap-cron .cr-l3', '#cap-cron .cr-l4', '#cap-cron .cr-l5', '#cap-cron .cr-l6'],
    { opacity: 1, duration: 0.3, stagger: 0.18 },
    '+=0.1',
  )

  tl.to('#cap-cron .cr-l7', { opacity: 1, duration: 0.35 }, '+=0.35')
    .add(typewrite('#cap-cron .cr-typed-2', 'prometeus cron add "call mom every sunday at 7pm"'), '>')

  tl.to('#cap-cron .cr-l8', { opacity: 1, duration: 0.35 }, '+=0.2')
    .to('#cap-cron .cr-l9', { opacity: 1, duration: 0.5 }, '+=0.25')

  // Countdown tick
  tl.to('#cap-cron .cr-l10', { opacity: 1, duration: 0.4 }, '+=0.35')
  if (countdown) {
    const ticker = { m: 18 }
    tl.to(ticker, {
      m: 12,
      duration: 2,
      ease: 'none',
      onUpdate: () => {
        countdown.textContent = `3d 9h ${Math.round(ticker.m)}m`
      },
    }, '<')
  }

  tl.to('#cap-cron .cr-l11', { opacity: 1, duration: 0.3 }, '+=0.2')

  tl.to({}, { duration: 2.5 })
  tl.to(crLines.map((s) => `#cap-cron ${s}`), {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in',
    stagger: { amount: 0.25, from: 'start' },
    onComplete: () => {
      if (typed1) typed1.textContent = ''
      if (typed2) typed2.textContent = ''
      if (countdown) countdown.textContent = '3d 9h 18m'
    },
  })

  ScrollTrigger.create({
    trigger: '#cap-showcase',
    start: 'top 85%',
    end: 'bottom 10%',
    onEnter: () => tl.play(),
    onEnterBack: () => tl.play(),
    onLeave: () => tl.pause(),
    onLeaveBack: () => tl.pause(),
  })
}

// --- Capabilities showcase: floating WhatsApp notification ---
function initCapMsgAnimation() {
  const msg = document.getElementById('cap-msg-wrap')
  if (!msg) return

  gsap.set(msg, { opacity: 0, y: 18, scale: 0.96 })
  gsap.set('#cap-msg .msg-arrow', { x: 0 })

  ScrollTrigger.create({
    trigger: '#cap-showcase',
    start: 'top 80%',
    onEnter: () => {
      gsap.to(msg, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        delay: 0.6,
        ease: 'power3.out',
      })
    },
  })

  // Gentle float loop
  gsap.to(msg, {
    y: -8,
    duration: 2.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1.8,
  })

  // Arrow nudge
  gsap.to('#cap-msg .msg-arrow', {
    x: 4,
    duration: 1.1,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

initCapPhoneAnimation()
initCapCliAnimation()
initCapCronAnimation()
initCapMsgAnimation()

// --- Noise grain overlay ---
const noiseCanvas = document.getElementById('noise-canvas') as HTMLCanvasElement
if (noiseCanvas) {
  initNoise(noiseCanvas, { size: 512, alpha: 15, refreshInterval: 3 })
}
