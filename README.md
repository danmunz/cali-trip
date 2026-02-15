# README

## Susan's 70th Birthday Trip to California

A sophisticated, editorial-style single-page travel itinerary website celebrating a milestone birthday journey through California's most iconic destinations.

![Project Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 🎯 Project Overview

This is a fully responsive web application that transforms a markdown-based vacation itinerary into a beautiful, browseable experience. The site features:

- **Three main sections:** Overview, Lodging, and Itinerary
- **Editorial design aesthetic:** Travel magazine-inspired layout with dramatic full-bleed photography
- **Sophisticated typography:** Helvetica Neue (sans-serif) + Crimson Pro (serif)
- **Interactive navigation:** Smooth scrolling, sticky navigation, active section highlighting
- **Responsive design:** Optimized for desktop, tablet, and mobile
- **Map integration ready:** Placeholder for Mapbox GL interactive maps

### Design Highlights

✨ **Dramatic full-bleed photography** with dark overlays  
✨ **Split-screen layout** (content left, map right on desktop)  
✨ **Timeline-style itinerary** with activity dots and vertical lines  
✨ **Glass-morphism navigation** pills with smooth transitions  
✨ **Organic California aesthetic** - natural tones, coastal blues, forest greens

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The site will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Main app component
│   │   ├── Root.tsx                 # Root layout with navigation
│   │   ├── routes.ts                # React Router configuration
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx     # Trip overview & flights
│   │   │   ├── LodgingPage.tsx      # Accommodation details
│   │   │   └── ItineraryPage.tsx    # Day-by-day itinerary ⭐
│   │   └── components/
│   │       ├── LocationDetails.tsx
│   │       └── ui/                  # Pre-built UI components
│   └── styles/
│       ├── index.css                # Main CSS entry
│       ├── fonts.css                # Font imports
│       ├── theme.css                # Design tokens
│       └── tailwind.css             # Tailwind directives
├── HANDOFF.md                       # Detailed developer documentation
├── STYLEGUIDE.md                    # Complete design system
├── package.json
└── vite.config.ts
```

---

## 📖 Documentation

### For Developers
👉 **[HANDOFF.md](./HANDOFF.md)** - Complete technical documentation, setup instructions, and implementation notes

### For Designers
👉 **[STYLEGUIDE.md](./STYLEGUIDE.md)** - Full design system including typography, colors, spacing, components, and patterns

---

## 🎨 Design System at a Glance

### Typography
- **Helvetica Neue** - Modern sans-serif for structure (navigation, titles, labels)
- **Crimson Pro** - Classic serif for narrative content (body text, descriptions)

### Color Palette
- **Backgrounds:** White (#ffffff), Near-black (oklch 0.145)
- **Natural Accents:** Wood/Brass (#b8956d), Forest Green (#5a8a6f), Coastal Blue (#4a7c8e)
- **Grays:** Full scale from 100-900 for UI elements

### Key Features
- Tailwind CSS v4 utility-first styling
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- CSS variables for design tokens
- Radix UI component library included

---

## 🗺️ Pages

### 1. Overview (`/`)
Trip summary, key highlights, and flight information with hero section and topographic background.

### 2. Lodging (`/lodging`)
Detailed accommodation cards for each location (Yountville, Rush Creek Lodge, Hyatt Carmel Highlands).

### 3. Itinerary (`/itinerary`) ⭐ **Star Feature**
- **Four sections:** Arrival/Muir Woods, Napa Valley, Yosemite, Monterey/Carmel
- **Sticky sub-navigation** with smooth scroll
- **Full-bleed photography** for each section (redwoods, vineyards, granite cliffs, Pacific coast)
- **Timeline layout** for daily activities
- **Split-screen** on desktop (content left, map placeholder right)

---

## 🛠️ Tech Stack Details

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.3.1 |
| **Routing** | React Router 7 (Data mode) |
| **Styling** | Tailwind CSS v4 |
| **Build** | Vite 6 |
| **UI Components** | Radix UI, Material-UI (limited) |
| **Icons** | Lucide React |
| **Maps** | Mapbox GL JS (optional) |
| **Animation** | Motion (installed, ready to use) |

---

## 📦 Key Dependencies

```json
{
  "react": "18.3.1",
  "react-router": "7.13.0",
  "tailwindcss": "4.1.12",
  "lucide-react": "0.487.0",
  "mapbox-gl": "3.18.1",
  "motion": "12.23.24",
  "@mui/material": "7.3.5"
}
```

---

## 🚢 Deployment

### Build Command
```bash
pnpm build
```

Output directory: `/dist`

### Recommended Platforms
- **Vercel** - Zero configuration
- **Netlify** - Simple git integration
- **Cloudflare Pages** - Fast global CDN
- **AWS S3 + CloudFront** - Custom infrastructure

⚠️ **Important:** Configure your hosting to serve `index.html` for all routes (required for client-side routing).

---

## 🎯 Roadmap & Enhancement Ideas

### Quick Wins
- [ ] Add Mapbox access token for interactive maps
- [ ] Optimize images with WebP/AVIF format
- [ ] Add scroll-triggered animations
- [ ] Create print stylesheet

### Medium Complexity
- [ ] Photo gallery/lightbox for locations
- [ ] Weather forecast integration
- [ ] "Add to Calendar" functionality
- [ ] Mobile bottom navigation

### Advanced
- [ ] CMS integration (Sanity, Contentful)
- [ ] Collaborative notes/comments
- [ ] PDF export/generation
- [ ] Booking API integration

---

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt for your own travel itineraries!

---

## 📝 License

Private project. All rights reserved.

---

## 🙏 Credits

**Design & Development:** Figma Make  
**Photos:** Unsplash  
**Icons:** Lucide  
**UI Components:** Radix UI  
**Fonts:** Google Fonts (Crimson Pro), System fonts (Helvetica Neue)

---

## 📞 Support

For questions or issues:
1. Check `HANDOFF.md` for technical details
2. Check `STYLEGUIDE.md` for design guidance
3. Review inline code comments
4. Check browser console for errors

---

**Built with ❤️ for Susan's 70th Birthday Adventure**

*California Dreaming • April 3-11, 2026* 🌲🍇🏔️🌊
