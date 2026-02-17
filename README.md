# Susan's 70th Birthday Trip — California

A markdown-driven travel itinerary site. Edit one file (`full-trip.md`), run the generator, and the entire site updates — titles, flights, daily schedule, day-by-day activities, and location data.

---

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

To regenerate site data after editing the itinerary:

```bash
pnpm generate     # parses full-trip.md → TypeScript data files + locations.json sync
```

`pnpm build` runs the generator automatically via `prebuild`.

---

## Content Pipeline

The single source of truth is **`src/data/full-trip.md`** — a structured markdown file with headings, time blocks, travel lines, and tables. A build-time script parses it into typed data that the React app imports directly.

```
full-trip.md
    │
    ▼  pnpm generate (scripts/generate-data.ts)
    │
    ├─► itinerary.generated.ts   9 days, 53 activities, travel segments, subgroups
    ├─► trip-meta.generated.ts   title, flights, daily schedule, lodging confirmations
    └─► locations.json           trip_parts synced from itinerary references
```

### What's generated vs. hand-maintained

| File | Source | Notes |
|------|--------|-------|
| `itinerary.generated.ts` | Generated | Ordered `TripDay[]` with activities, `travelAfter`, `subgroup` |
| `trip-meta.generated.ts` | Generated | Title, subtitle, flights, daily schedule table, lodging confirmations |
| `locations.json` | Synced | `trip_parts` regenerated; geo/URLs/reviews hand-maintained |
| `segments.ts` | Hand-maintained | Display config — colors, background images, prose per segment |
| `lodging.ts` | Hand-maintained | Hotel details — amenities, images, descriptions |
| `overview.ts` | Hand-maintained | Weather forecast data |
| `types.ts` | Hand-maintained | Shared TypeScript interfaces for all data files |

### How the generator works

1. Parses `full-trip.md` with **unified + remark-parse + remark-gfm** into an MDAST
2. Splits by H1/H2 headings to extract sections (Overview, Trip Itinerary, Day-by-day)
3. Detects `**time — name**` patterns as activity blocks; `*Travel (drive): ~duration — from → to*` as travel lines
4. Infers segment assignment (napa/yosemite/carmel) from the Trip Itinerary table's Base column
5. Fuzzy-matches location mentions (bold names, links) against `locations.json` using an alias system with normalization (curly quotes, parenthetical abbreviations, suffix stripping, tail-word matching)
6. Writes typed `.ts` files and syncs `locations.json` `trip_parts`

---

## Project Structure

```
/
├── scripts/
│   └── generate-data.ts             # Codegen: full-trip.md → typed data files
├── src/
│   ├── app/
│   │   ├── App.tsx                   # App root
│   │   ├── Root.tsx                  # Layout — nav + footer (reads tripMeta)
│   │   ├── routes.ts                 # React Router configuration
│   │   └── pages/
│   │       ├── OverviewPage.tsx      # Hero, schedule, flights, weather
│   │       ├── LodgingPage.tsx       # Hotel detail cards
│   │       └── ItineraryPage.tsx     # Day-by-day timeline with travel chips
│   ├── data/
│   │   ├── full-trip.md              # ✏️ Canonical content — edit this
│   │   ├── itinerary.generated.ts    # 🔄 Auto-generated
│   │   ├── trip-meta.generated.ts    # 🔄 Auto-generated
│   │   ├── locations.json            # 🔄 trip_parts synced; geo/URLs by hand
│   │   ├── types.ts                  # Shared interfaces
│   │   ├── segments.ts               # Display config (colors, images, prose)
│   │   ├── lodging.ts                # Hotel enrichment data
│   │   └── overview.ts               # Weather data
│   └── styles/
│       ├── index.css
│       ├── fonts.css
│       ├── theme.css
│       └── tailwind.css
├── HANDOFF.md
├── STYLEGUIDE.md
└── package.json
```

---

## Pages

### Overview (`/`)
Hero with trip title and subtitle (from `tripMeta`), daily schedule table with segment-colored dots, flight details, and weather forecast.

### Lodging (`/lodging`)
Detailed accommodation cards — The Estate Yountville, Rush Creek Lodge, Hyatt Carmel Highlands — with images, amenities, and booking details.

### Itinerary (`/itinerary`)
Full-screen sections grouped by segment (Napa & Sonoma → Yosemite → Carmel + Big Sur), each with:
- Background photography and segment description from `segments.ts`
- Days with formatted dates, titles, and summary paragraphs
- Timeline-style activity nodes with descriptions
- Travel chips (`🚗 ~1 hr — SFO → Muir Woods`) between activities
- Subgroup annotations (`Susan + Ted only`) where applicable
- Sticky sub-navigation with smooth scroll

---

## Design System

| Element | Value |
|---------|-------|
| **Sans-serif** | Helvetica Neue — navigation, titles, labels |
| **Serif** | Crimson Pro — body text, descriptions |
| **Napa** | `#b8956d` |
| **Yosemite** | `#5a8a6f` |
| **Carmel** | `#4a7c8e` |

See [STYLEGUIDE.md](./STYLEGUIDE.md) for the full design system.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.3.1 |
| **Routing** | React Router 7 |
| **Styling** | Tailwind CSS v4 |
| **Build** | Vite 6 |
| **Codegen** | unified + remark-parse + remark-gfm + mdast-util-to-string |
| **Script runner** | tsx |
| **Icons** | Lucide React |
| **Maps** | Mapbox GL JS (placeholder) |

---

## Deployment

The site is automatically deployed to **GitHub Pages** via GitHub Actions on every push to `main`.

**Live site:** https://danmunz.github.io/cali-trip/

### Quick Deploy

```bash
git push origin main  # Triggers automatic deployment
```

The CI workflow:
1. Installs dependencies
2. Generates data from `full-trip.md`
3. Runs TypeScript type checks
4. Builds the site
5. Deploys to GitHub Pages

### Setup

**First time?** See **[docs/SETUP.md](./docs/SETUP.md)** for:
- Quick 3-step setup (enable Pages, add Mapbox token, deploy)
- Troubleshooting common issues

**Detailed docs:** See **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** for:
- Complete GitHub Pages configuration guide
- Local development with environment variables
- Workflow customization options
- Manual deployment methods

---

## Roadmap

- [x] ~~Add Mapbox access token for interactive maps~~ (via GitHub Actions secrets)
- [x] ~~Deploy to GitHub Pages with automated CI/CD~~
- [ ] Render markdown descriptions (currently plain text)
- [ ] Generate lodging check-in/check-out dates from `tripMeta`
- [ ] Photo gallery per location
- [ ] "Add to Calendar" export
- [ ] Print stylesheet
- [ ] PDF export

---

**Built for Susan's 70th Birthday Adventure**

*California • April 3–11, 2026* 🌲🍇🏔️🌊
