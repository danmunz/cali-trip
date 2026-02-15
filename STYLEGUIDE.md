# Design System & Styleguide

## Overview

This styleguide documents the design system for Susan's 70th Birthday Trip website—a sophisticated, editorial-style travel itinerary with an organic California aesthetic.

**Design Principles:**
- Editorial elegance (travel magazine feel)
- Natural, organic aesthetic
- Dramatic full-bleed photography
- Clean typography hierarchy
- Modern sans-serif + classic serif combination
- Responsive and accessible

---

## Typography

### Font Families

#### Primary: Helvetica Neue (Sans-serif)
**Usage:** Structural elements, navigation, headers, metadata  
**Fallback Stack:** `'Helvetica Neue', Helvetica, Arial, sans-serif`  
**Source:** System font

**Weights Used:**
- 300 (Light) - Large display headers
- 400 (Regular) - Default
- 500 (Medium) - Navigation, subheaders, labels

**Apply via inline style:**
```tsx
style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
```

#### Secondary: Crimson Pro (Serif)
**Usage:** Body text, descriptions, narrative content  
**Fallback Stack:** `'Crimson Pro', serif`  
**Source:** Google Fonts

**Weights Used:**
- 300 (Light) - Elegant large text
- 400 (Regular) - Body text (primary)
- 500 (Medium) - Emphasized body text
- 600 (Semi-bold) - Subheadings
- 700 (Bold) - Strong emphasis

**Import (already in `/src/styles/fonts.css`):**
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;500;600;700&display=swap');
```

**Apply via inline style:**
```tsx
style={{ fontFamily: "'Crimson Pro', serif" }}
```

---

### Type Scale

Based on Tailwind CSS utility classes:

| Element | Size | Tailwind Class | Line Height | Use Case |
|---------|------|----------------|-------------|----------|
| Display XXL | 96px | `text-8xl` | 1 | Hero section headers |
| Display XL | 72px | `text-7xl` | 1 | Section headers (desktop) |
| Display L | 60px | `text-6xl` | 1 | Section headers (mobile) |
| Heading 1 | 48px | `text-5xl` | 1.2 | Day titles |
| Heading 2 | 36px | `text-4xl` | 1.2 | Day titles (mobile) |
| Heading 3 | 30px | `text-3xl` | 1.3 | - |
| Heading 4 | 24px | `text-2xl` | 1.4 | Subtitles |
| Large | 20px | `text-xl` | 1.5 | Activity names, descriptions |
| Base | 18px | `text-lg` | 1.6 | Date labels, metadata |
| Body | 16px | `text-base` | 1.6 | Standard body text |
| Small | 14px | `text-sm` | 1.5 | Labels, captions |
| Tiny | 12px | `text-xs` | 1.4 | Timestamps, uppercase labels |

---

### Typography Patterns

#### 1. Itinerary Section Header
```tsx
<h2 
  className="text-6xl sm:text-7xl lg:text-8xl text-white mb-4 tracking-tight font-light"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  Arrival + Muir Woods
</h2>
<p 
  className="text-2xl text-white/90 mb-6 italic"
  style={{ fontFamily: "'Crimson Pro', serif" }}
>
  Redwoods
</p>
```

#### 2. Day Title
```tsx
<div 
  className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  Friday, April 3
</div>
<h3 
  className="text-4xl sm:text-5xl text-white mb-4 font-medium"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  Arrival + Redwoods + Yountville
</h3>
<p 
  className="text-lg text-white/90 leading-relaxed"
  style={{ fontFamily: "'Crimson Pro', serif" }}
>
  Arrive in Northern California and ease into the trip...
</p>
```

#### 3. Activity Item
```tsx
<div 
  className="text-xs text-white/70 uppercase tracking-wider mb-2 font-medium"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  10:45am–12:15pm
</div>
<h4 
  className="text-xl text-white mb-3 font-medium"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  Land at SFO + rental car + lunch to-go
</h4>
<p 
  className="text-base text-white/85 leading-relaxed"
  style={{ fontFamily: "'Crimson Pro', serif" }}
>
  Pick up the rental car and grab lunch before heading to the redwoods.
</p>
```

#### 4. Navigation Button
```tsx
<button
  className="px-6 py-3 rounded-full text-base font-medium"
  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
>
  Napa Valley
</button>
```

---

## Color System

### Primary Palette

#### Backgrounds
```css
--background: #ffffff           /* Pure white */
--foreground: oklch(0.145 0 0)  /* Near-black */
```

#### Neutrals (Gray Scale)
```css
--gray-100: #f3f3f5    /* Lightest gray */
--gray-200: #e9ebef    /* Light gray (nav background) */
--gray-300: #cbced4    /* Medium-light gray (borders) */
--gray-400: #acacb4    /* Medium gray */
--gray-500: #8c8c94    /* Mid gray */
--gray-600: #717182    /* Muted text */
--gray-700: #4a4a5a    /* Dark gray (active nav) */
--gray-800: #2a2a3a    /* Very dark gray */
--gray-900: #030213    /* Almost black */
```

#### Natural Accent Colors
```css
--wood-brass: #b8956d   /* Napa/natural wood tones */
--forest-green: #5a8a6f /* Yosemite/mountain green */
--coastal-blue: #4a7c8e /* Carmel/Pacific coast blue */
```

#### Status Colors
```css
--destructive: #d4183d         /* Error/delete actions */
--primary: #030213             /* Dark primary (buttons) */
--secondary: oklch(0.95 0.0058 264.53)  /* Light secondary */
```

---

### Color Usage

#### Text on Photos (Itinerary Page)
```tsx
// White text with varying opacity
text-white           // 100% - Main headings
text-white/95        // 95% - Body paragraphs
text-white/90        // 90% - Subtitles
text-white/85        // 85% - Activity descriptions
text-white/70        // 70% - Dates, times, metadata
text-white/60        // 60% - Labels (WHEN, etc.)
text-white/40        // 40% - Continue arrow
```

#### Background Overlays
```tsx
// Dark gradient over photos
className="bg-gradient-to-b from-black/70 via-black/60 to-black/70"

// Glassmorphism effect (if needed)
className="bg-white/10 backdrop-blur-sm"
```

#### Navigation
```tsx
// Active state
className="bg-gray-700 text-white"

// Inactive state  
className="bg-transparent text-gray-900 hover:bg-gray-300"

// Nav background
className="bg-gray-200/95 backdrop-blur-sm"
```

---

## Spacing & Layout

### Container Widths
```tsx
// Standard content container
max-w-6xl          // 1152px (main container)

// Text content
max-w-2xl          // 672px (readable line length)

// Full width
w-full
```

### Padding & Margins

**Page Padding:**
```tsx
px-6 lg:px-12      // Horizontal: 24px mobile, 48px desktop
py-12             // Vertical: 48px
py-20             // Vertical (larger): 80px
```

**Section Spacing:**
```tsx
mb-4              // 16px
mb-6              // 24px
mb-8              // 32px
mb-12             // 48px
mb-16             // 64px
mb-20             // 80px
```

**Component Spacing:**
```tsx
space-y-4         // Vertical stack: 16px gap
space-y-8         // Vertical stack: 32px gap
space-y-16        // Vertical stack: 64px gap
gap-2             // Flexbox/Grid: 8px gap
gap-4             // Flexbox/Grid: 16px gap
```

### Grid & Flexbox

**Split Screen (Itinerary):**
```tsx
// Left side (content)
className="lg:w-1/2"

// Right side (map)
className="fixed top-32 right-0 w-1/2 h-screen hidden lg:block"
```

**Centered Content:**
```tsx
className="flex items-center justify-center"
```

**Responsive Flex:**
```tsx
className="flex flex-col lg:flex-row gap-6"
```

---

## Components

### Navigation Pills

**Structure:**
```tsx
<div className="flex items-center justify-center gap-2 flex-wrap">
  <button
    className="px-6 py-3 rounded-full text-base font-medium transition-all
               bg-gray-700 text-white shadow-lg" // Active
    // or
    className="px-6 py-3 rounded-full text-base font-medium transition-all
               bg-transparent text-gray-900 hover:bg-gray-300" // Inactive
    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
  >
    Section Name
  </button>
</div>
```

**Behavior:**
- Sticky positioning: `sticky top-16 z-40`
- Smooth scroll on click
- Auto-highlight active section on scroll

---

### Timeline (Activities)

**Structure:**
```tsx
<div className="pl-6 border-l-2 border-white/30 space-y-8">
  <div className="relative">
    {/* Timeline dot */}
    <div 
      className="absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
    />
    
    {/* Activity content */}
    <div className="text-xs uppercase">TIME</div>
    <h4 className="text-xl">Activity Name</h4>
    <p className="text-base">Description...</p>
  </div>
</div>
```

**Visual:**
- Vertical line (2px, white/30)
- Circular dots (16px, white with 2px border)
- Positioned 29px left of line to center on border

---

### Hero Section

**Example (Overview Page):**
```tsx
<div className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
     style={{ backgroundImage: `url(...)` }}>
  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
  
  <div className="relative z-10 text-center px-6">
    <h1 className="text-6xl lg:text-8xl text-white font-light tracking-tight mb-4">
      Susan's 70th Birthday
    </h1>
    <p className="text-2xl text-white/90 italic">
      A California Adventure
    </p>
  </div>
</div>
```

---

### Card Component (Lodging)

**Using Material-UI:**
```tsx
import { Card, CardContent } from '@mui/material';

<Card sx={{ 
  backgroundColor: '#f8f8f5',
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
}}>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind v4 default breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* XXL devices (large desktops) */
```

### Responsive Patterns

**Typography:**
```tsx
// Responsive heading
className="text-4xl sm:text-5xl lg:text-6xl"

// Responsive padding
className="px-4 md:px-6 lg:px-12"
```

**Layout:**
```tsx
// Stack on mobile, side-by-side on desktop
className="flex flex-col lg:flex-row"

// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="block lg:hidden"
```

**Split Screen:**
```tsx
// Content: full width mobile, 50% desktop
className="w-full lg:w-1/2"
```

---

## Images

### Background Images

**Full-bleed sections:**
```tsx
<div 
  className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${imageUrl})` }}
>
  {/* Dark overlay for text contrast */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
</div>
```

**Recommended specs:**
- Resolution: 1920px+ width
- Format: JPEG (photos), WebP (optimized)
- Aspect ratio: 16:9 or wider
- File size: < 500KB (compressed)

### Image Sources

Current images from Unsplash:
- Muir Woods redwoods
- Napa Valley vineyards (aerial)
- Yosemite granite (Half Dome/Valley)
- Big Sur coastal cliffs (Highway 1)

**To replace:** Update URLs in `bgImages` object in `ItineraryPage.tsx`

---

## Iconography

**Library:** Lucide React  
**Import:**
```tsx
import { ChevronDown, MapPin, ExternalLink } from 'lucide-react';
```

**Usage:**
```tsx
<ChevronDown className="w-6 h-6 text-white" />
<MapPin className="w-5 h-5 text-gray-600" />
```

**Common icons:**
- `ChevronDown` - Continue indicator
- `MapPin` - Location markers
- `ExternalLink` - External links
- `Calendar` - Date/time
- `Clock` - Time

**Size scale:**
```tsx
w-4 h-4   // 16px - Small
w-5 h-5   // 20px - Default
w-6 h-6   // 24px - Large
w-8 h-8   // 32px - XL
w-10 h-10 // 40px - XXL
```

---

## Animation & Transitions

### Subtle Transitions
```tsx
// Default transition
className="transition-all duration-300"

// Hover states
className="hover:bg-gray-300 hover:shadow-lg transition-all"

// Transform
className="hover:scale-105 transition-transform"
```

### Scroll Animations

**Continue arrow bounce:**
```tsx
<div className="animate-bounce">
  <ChevronDown className="w-10 h-10 text-white/40" />
</div>
```

**Smooth scroll (JS):**
```tsx
window.scrollTo({ top: position, behavior: 'smooth' });
```

### Future Enhancement Ideas
- Fade-in on scroll (Intersection Observer)
- Parallax backgrounds (slight shift on scroll)
- Stagger animations for activity list
- Photo zoom on hover

---

## Accessibility

### Best Practices Implemented

1. **Semantic HTML:**
   - `<nav>`, `<section>`, `<header>`, `<footer>`
   - Proper heading hierarchy (h1 → h2 → h3 → h4)

2. **Color Contrast:**
   - White text on dark overlays (WCAG AAA)
   - Dark text on light backgrounds (WCAG AA)

3. **Interactive Elements:**
   - Buttons have hover/focus states
   - Links are distinguishable
   - Focus rings visible (Tailwind default)

4. **Responsive:**
   - Mobile-friendly touch targets (44px+ buttons)
   - Readable font sizes on all devices

### Improvements to Consider

- Add `aria-label` to icon-only buttons
- Add `alt` text to all images
- Ensure keyboard navigation works (tab order)
- Add skip-to-content link
- Test with screen readers

---

## Motion & Animation Guidelines

**Installed:** Motion (Framer Motion successor)

**Import:**
```tsx
import { motion } from 'motion/react';
```

**Example usage (not yet implemented):**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**Animation principles:**
- Subtle and purposeful
- 300-600ms duration (feels natural)
- Ease-in-out timing
- Don't distract from content

---

## Browser Support

**Target browsers:**
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

**Modern CSS features used:**
- CSS Variables (`:root`)
- oklch() color space
- backdrop-blur
- CSS Grid & Flexbox
- Custom properties

**Note:** No IE11 support required.

---

## Print Styles (Not yet implemented)

**Recommendations for future:**
```css
@media print {
  /* Hide navigation */
  nav { display: none; }
  
  /* Remove backgrounds to save ink */
  .bg-cover { background: none !important; }
  
  /* Adjust colors */
  .text-white { color: black !important; }
  
  /* Page breaks */
  section { page-break-after: always; }
}
```

---

## Design Tokens (CSS Variables)

Located in `/src/styles/theme.css`:

```css
:root {
  /* Typography */
  --font-size: 16px;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  
  /* Colors */
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --secondary: oklch(0.95 0.0058 264.53);
  --muted: #ececf0;
  --border: rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius: 0.625rem; /* 10px */
}
```

**Usage:**
```tsx
style={{ 
  backgroundColor: 'var(--background)',
  borderRadius: 'var(--radius)' 
}}
```

---

## File Organization

```
/src/styles/
├── index.css       # Main entry (imports all others)
├── fonts.css       # Google Fonts import
├── theme.css       # CSS variables, design tokens
├── tailwind.css    # @tailwind directives
└── mapbox.css      # Mapbox GL styles
```

**Load order (in `index.css`):**
1. Fonts
2. Tailwind base
3. Theme/variables
4. Tailwind components
5. Custom styles
6. Tailwind utilities
7. Mapbox styles

---

## Component Library

**Pre-installed UI components (Radix UI):**
Located in `/src/app/components/ui/`

- Accordion
- Alert Dialog
- Avatar
- Badge
- Button
- Card
- Checkbox
- Dialog
- Dropdown Menu
- Input
- Label
- Popover
- Select
- Separator
- Sheet
- Tabs
- Tooltip
- ... and more

**Usage:**
```tsx
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
```

**Documentation:** https://www.radix-ui.com/

---

## Additional Resources

**Tailwind CSS v4:**  
https://tailwindcss.com/

**React Router v7:**  
https://reactrouter.com/

**Lucide Icons:**  
https://lucide.dev/

**Mapbox GL JS:**  
https://docs.mapbox.com/mapbox-gl-js/

**Google Fonts:**  
https://fonts.google.com/

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Maintained by:** Frontend Development Team
