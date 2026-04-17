# Prometeus

> Stealing fire from the gods.

A monumental editorial landing page for **Prometeus** — an autonomous agent that thinks, remembers, and evolves on your own infrastructure.

Persistent memory. Self-improving skills. Multi-platform gateway. Your infrastructure.

---

## Stack

- **Vite 8** + **TypeScript**
- **GSAP** (ScrollTrigger · Flip · SplitText) for scroll-driven animation
- **Lenis** for smooth scroll
- Scroll-driven canvas sequence (150 frames) + looping video hero
- Two entry points: `/` (hero) and `/agent.html` (agent deep-dive)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

## Production build

```bash
npm run build     # tsc + vite build → ./dist
npm run preview   # serve the built output
```

## Deployment on a VPS (Docker)

The repository ships with a multi-stage `Dockerfile` and an nginx config tuned for long-cache hashed assets + gzip.

```bash
# 1. Clone on the server
git clone https://github.com/VanguardiaAI/prometeus.git
cd prometeus

# 2. Build + run
docker compose up -d --build

# 3. Reverse-proxy to :8080 with your existing nginx / Caddy / Traefik
#    (or edit docker-compose.yml to bind to :80 directly)
```

The container exposes the built static site on port **80** (mapped to host **8080** by default).

### Direct nginx deploy (no Docker)

```bash
# On the server
git clone https://github.com/VanguardiaAI/prometeus.git
cd prometeus

# Build
npm ci
npm run build

# Serve ./dist with your preferred web server.
# Example: rsync ./dist to /var/www/prometeus and point nginx at it
#          (use the shipped nginx.conf as a starting template).
```

## Project structure

```
.
├── index.html              # Main hero page (scroll-driven video)
├── agent.html              # Agent deep-dive (capabilities, integrations, architecture, quick start)
├── src/
│   ├── main.ts             # Main page logic
│   ├── agent.ts            # Agent page logic
│   ├── noise.ts            # Animated film-grain overlay
│   ├── style.css           # Main page styles
│   └── agent.css           # Agent page styles
├── public/
│   ├── frames/             # 150 scroll-driven hero frames
│   ├── videos/             # Looping hero video
│   ├── agent/              # Desk items (music, cd, macmini, …)
│   ├── agent-hero/         # About-section image columns
│   └── images/             # Shared imagery
├── Dockerfile              # Multi-stage build (node → nginx)
├── nginx.conf              # Tuned nginx config (gzip, cache, security headers)
└── docker-compose.yml      # One-command deploy
```

## License

MIT.
