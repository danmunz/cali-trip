# Susan's 70th Birthday Trip — Developer Handoff

## Project Overview

This is a single-page travel itinerary website celebrating Susan's 70th birthday trip to California (April 3-11, 2026). The site features a three-page navigation structure showcasing a 9-day journey through Napa/Sonoma, Yosemite, and Monterey/Carmel with an elegant, editorial travel magazine aesthetic.

**Design Philosophy:** Organic, artisanal California adventure with natural wood tones, coastal blues, topographic map feel, dramatic photography, and sophisticated typography mixing modern sans-serif with classic serif fonts.

---

## Tech Stack

- **Framework:** React 18.3.1 with TypeScript
- **Routing:** React Router 7 (Data mode pattern)
- **Styling:** Tailwind CSS v4
- **Build Tool:** Vite 6
- **Package Manager:** pnpm (recommended) or npm
- **Key Libraries:**
  - `lucide-react` - Icons
  - `mapbox-gl` - Interactive maps (optional, placeholder included)
  - `motion` - Animations (installed but not heavily used yet)

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone or download the project

# Install dependencies
pnpm install
# or
npm install

# Start development server
pnpm dev
# or
npm run dev

# Build for production
pnpm build
# or
npm run build
```

### Development Server
The site will run at `http://localhost:5173` by default.

---

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main app component (routing entry)
│   │   ├── Root.tsx             # Root layout with navigation
│   │   ├── routes.ts            # React Router configuration
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx    # Trip overview and flights
│   │   │   ├── LodgingPage.tsx     # Accommodation details
│   │   │   └── ItineraryPage.tsx   # Day-by-day itinerary (main feature)
│   │   └── components/
│   │       ├── LocationDetails.tsx  # Location info component
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx  # Image component
│   │       └── ui/                  # Radix UI components (pre-built)
│   └── styles/
│       ├── index.css            # Main CSS entry
│       ├── fonts.css            # Font imports
│       ├── theme.css            # CSS variables and base styles
│       ├── tailwind.css         # Tailwind directives
│       └── mapbox.css           # Mapbox GL styles
├── package.json
├── vite.config.ts
├── STYLEGUIDE.md                # Design system documentation
└── HANDOFF.md                   # This file
```

---

## Key Pages

### 1. Overview Page (`/`)
- Hero section with trip title and dates
- Trip summary with key highlights
- Flight information display
- Clean, elegant layout with topographic map background

### 2. Lodging Page (`/lodging`)
- Detailed accommodation information for each location
- Hotel cards with amenities, addresses, contact info
- Material-UI components for cards and icons
- Structured, scannable layout

### 3. Itinerary Page (`/itinerary`) ⭐ **Main Feature**
- **Sticky sub-navigation** - Jump to different trip sections
- **Full-bleed background photography** - Different image per section (redwoods, vineyards, Yosemite, Big Sur coast)
- **Split-screen layout** - Content on left (50%), map placeholder on right (50%, fixed)
- **Dramatic typography** - Giant 6xl-8xl sans-serif section headers over photos
- **Timeline design** - Vertical timeline with dots for activities
- **Editorial aesthetic** - White text on dark photo overlays, glass-morphism feel

---

## Design System Overview

See `STYLEGUIDE.md` for complete details.

### Typography

**Two-font system for editorial elegance:**

- **Helvetica Neue** (sans-serif) - Modern structure
  - Navigation elements
  - Large section headers/titles
  - Day/activity names
  - Dates, times, metadata labels
  - Weights: 300 (Light), 400 (Regular), 500 (Medium)

- **Crimson Pro** (serif) - Narrative warmth
  - Body text and descriptions
  - Subtitles (italic)
  - All paragraph content
  - Weights: 300-700 (imported via Google Fonts)

### Color Palette

**Primary Colors:**
- Background: `#ffffff` (white)
- Foreground: `oklch(0.145 0 0)` (near-black)
- Natural tones: `#b8956d` (wood/brass), `#5a8a6f` (forest), `#4a7c8e` (coastal blue)

**Grays:** 
- Gray-100 to Gray-900 scale
- Used for navigation, borders, overlays

**Photo Overlays:**
- Black gradient overlays: `from-black/70 via-black/60 to-black/70`
- White text: `text-white` with varying opacity (90%, 85%, 70%)

### Layout

**Responsive Breakpoints:**
- Mobile: < 768px (full-width, stacked)
- Tablet: 768px - 1024px
- Desktop: 1024px+ (split-screen on itinerary page)

**Max Width:**
- Content: `max-w-6xl` (1152px)
- Text blocks: `max-w-2xl` (672px)

**Spacing:**
- Consistent padding: `px-6 lg:px-12`
- Section spacing: `py-12` to `py-20`

---

## Critical Implementation Notes

### 1. Fonts
Fonts are loaded via Google Fonts in `/src/styles/fonts.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&display=swap');
```

Helvetica Neue is system font:
```css
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif
```

**Apply fonts inline:**
```tsx
style={{ fontFamily: "'Crimson Pro', serif" }}
style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
```

### 2. Images

**Background Images:**
All section backgrounds use Unsplash images imported at the top of `ItineraryPage.tsx`:
```tsx
const bgImages = {
  napa: 'https://images.unsplash.com/...',
  yosemite: 'https://images.unsplash.com/...',
  // etc.
};
```

**To replace images:**
- Update URLs in the `bgImages` object
- Or replace with local images from `/public` folder
- Images should be high-resolution (1920px+ wide recommended)
- Aspect ratio: Landscape (16:9 or wider)

### 3. Routing

The site uses React Router's Data mode. Navigation is handled in `Root.tsx`:

```tsx
<nav>
  <Link to="/">Overview</Link>
  <Link to="/lodging">Lodging</Link>
  <Link to="/itinerary">Itinerary</Link>
</nav>
```

Routes defined in `routes.ts`:
```tsx
createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: OverviewPage },
      { path: "lodging", Component: LodgingPage },
      { path: "itinerary", Component: ItineraryPage },
    ],
  },
])
```

### 4. Mapbox Integration (Optional)

The itinerary page includes a placeholder for Mapbox GL JS maps. To enable:

1. Get a Mapbox access token: https://www.mapbox.com/
2. Replace the token in `ItineraryPage.tsx`:
   ```tsx
   mapboxgl.accessToken = 'YOUR_ACTUAL_TOKEN_HERE';
   ```
3. Uncomment the map initialization code in the `useEffect` hook

**Without Mapbox:**
The placeholder will display a neutral beige background with instructions.

### 5. Sticky Navigation

The itinerary sub-navigation uses:
```tsx
className="sticky top-16 z-40"
```

This keeps it below the main nav (which is `top-0`) and above content.

### 6. Scroll Behavior

Smooth scroll is implemented for navigation pills:
```tsx
window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
```

Active section detection uses `IntersectionObserver` pattern (scroll listener in `ItineraryPage.tsx`).

---

## Content Updates

### Modifying Itinerary Data

All itinerary content is in `ItineraryPage.tsx` in the `itineraryData` array:

```tsx
const itineraryData = [
  {
    id: 'napa',
    title: 'Arrival + Muir Woods',
    subtitle: 'Redwoods',
    dates: 'April 3-4',
    bgImage: bgImages.napa,
    description: '...',
    days: [
      {
        date: 'Friday, April 3',
        title: '...',
        description: '...',
        activities: [
          { time: '10:45am', name: '...', description: '...' }
        ]
      }
    ]
  }
]
```

### Modifying Lodging

Lodging data is in `LodgingPage.tsx` as hardcoded JSX. Search for "The Estate Yountville", "Rush Creek Lodge", etc. to update.

### Modifying Overview/Flights

Overview content is in `OverviewPage.tsx`. Update the hero text, trip description, and flight details directly in the component.

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- **Note:** Uses modern CSS features (oklch colors, CSS variables)
- Tailwind v4 requires modern browser support

---

## Performance Considerations

1. **Images:** Use optimized images (WebP format recommended)
2. **Lazy Loading:** Background images load immediately; consider lazy loading for below-fold content
3. **Bundle Size:** Current setup includes many Radix UI components (only used in Lodging page). Consider code-splitting if bundle size is a concern.

---

## Deployment

### Build Command
```bash
pnpm build
# or
npm run build
```

### Output
Build output will be in `/dist` folder.

### Hosting Recommendations
- **Vercel** - Zero config, automatic deployments
- **Netlify** - Simple drag-and-drop or git integration  
- **Cloudflare Pages** - Fast global CDN
- **AWS S3 + CloudFront** - For custom infrastructure

**Required:** Configure routing to serve `index.html` for all routes (SPA routing).

---

## Maintenance & Future Enhancements

### Easy Wins
1. Add Mapbox token for live interactive maps
2. Add more animations on scroll (Motion/Framer Motion already installed)
3. Optimize images with next-gen formats (WebP/AVIF)
4. Add print stylesheet for PDF export

### Medium Complexity
1. Add photo gallery/lightbox for each location
2. Add weather forecast integration
3. Add "Add to Calendar" functionality
4. Create mobile bottom nav for easier thumb navigation

### Advanced
1. Make content CMS-driven (Sanity, Contentful, etc.)
2. Add real-time collaborative notes/comments
3. Generate personalized PDF itinerary
4. Integrate with booking APIs for direct reservations

---

## Support & Questions

**For technical issues:**
- Check browser console for errors
- Ensure all dependencies are installed (`pnpm install`)
- Clear cache and rebuild (`pnpm clean && pnpm build`)

**For design questions:**
- Refer to `STYLEGUIDE.md`
- Check Tailwind docs: https://tailwindcss.com/
- Check Radix UI docs: https://www.radix-ui.com/

---

## License & Credits

**Photos:** Unsplash (see image URLs in code)
**Icons:** Lucide React (https://lucide.dev/)
**UI Components:** Radix UI (https://www.radix-ui.com/)
**Fonts:** Google Fonts (Crimson Pro), System fonts (Helvetica Neue)

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Project Status:** Production Ready ✅
