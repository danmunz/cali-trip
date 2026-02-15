# Developer Quickstart Checklist

Use this checklist to get the project running and make your first changes.

## ✅ Initial Setup

- [ ] **Clone/download the project** to your local machine
- [ ] **Install Node.js 18+** if not already installed
- [ ] **Install pnpm** (recommended): `npm install -g pnpm`
- [ ] **Navigate to project directory** in terminal
- [ ] **Run `pnpm install`** to install all dependencies
- [ ] **Run `pnpm dev`** to start development server
- [ ] **Open browser** to `http://localhost:5173`
- [ ] **Verify** all three pages load: Overview, Lodging, Itinerary

---

## 📚 Read Documentation

- [ ] **Skim [README.md](./README.md)** for project overview
- [ ] **Read [HANDOFF.md](./HANDOFF.md)** for technical details
- [ ] **Review [STYLEGUIDE.md](./STYLEGUIDE.md)** for design system

---

## 🎨 Understand the Design

- [ ] **Navigate through all three pages** in the browser
- [ ] **Resize browser** to see responsive behavior
- [ ] **Test mobile view** (DevTools responsive mode)
- [ ] **Inspect typography** - notice Helvetica Neue vs Crimson Pro usage
- [ ] **Check out the itinerary page** - the main feature

---

## 📂 Explore the Code

- [ ] **Open `/src/app/App.tsx`** - main entry point
- [ ] **Open `/src/app/Root.tsx`** - navigation layout
- [ ] **Open `/src/app/routes.ts`** - routing configuration
- [ ] **Open `/src/app/pages/ItineraryPage.tsx`** - star feature
- [ ] **Review `/src/styles/theme.css`** - design tokens
- [ ] **Check `/src/styles/fonts.css`** - font imports

---

## 🧪 Make a Test Change

Try making a simple change to verify your setup:

### Option 1: Change Hero Text
- [ ] Open `/src/app/pages/OverviewPage.tsx`
- [ ] Find the `<h1>` tag (around line 20)
- [ ] Change "Susan's 70th Birthday" to "My Test Change"
- [ ] Save and see hot-reload in browser
- [ ] Change it back

### Option 2: Change Navigation Color
- [ ] Open `/src/app/Root.tsx`
- [ ] Find the navigation buttons (around line 40)
- [ ] Change `bg-gray-700` to `bg-blue-700` in active state
- [ ] Save and click between pages to see the change
- [ ] Change it back

---

## 🎯 Common Tasks

### Update Trip Dates
- [ ] Open `/src/app/pages/ItineraryPage.tsx`
- [ ] Find `itineraryData` array (around line 30)
- [ ] Update `dates` fields in each section object

### Replace Background Images
- [ ] Open `/src/app/pages/ItineraryPage.tsx`
- [ ] Find `bgImages` object (around line 10)
- [ ] Replace Unsplash URLs with your own image URLs
- [ ] Recommended: 1920px+ width, landscape orientation

### Add a New Day to Itinerary
- [ ] Open `/src/app/pages/ItineraryPage.tsx`
- [ ] Find a section in `itineraryData` (e.g., 'napa')
- [ ] Copy an existing day object from `days` array
- [ ] Paste it and modify dates/activities
- [ ] Save and view in browser

### Change Font Sizes
- [ ] Open the component you want to modify
- [ ] Find Tailwind classes like `text-6xl`, `text-2xl`, etc.
- [ ] Change to different size: `text-4xl`, `text-5xl`, `text-7xl`, etc.
- [ ] Refer to STYLEGUIDE.md for size scale

### Update Colors
- [ ] Open `/src/styles/theme.css`
- [ ] Find the `:root` section
- [ ] Modify CSS variables (e.g., `--background`, `--primary`)
- [ ] Changes will apply globally via Tailwind

---

## 🔧 Troubleshooting

### Development server won't start
- [ ] Check Node.js version: `node -v` (should be 18+)
- [ ] Delete `node_modules` folder
- [ ] Delete `pnpm-lock.yaml` or `package-lock.json`
- [ ] Run `pnpm install` again
- [ ] Try `pnpm dev` again

### Hot reload not working
- [ ] Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- [ ] Restart dev server (Ctrl+C, then `pnpm dev`)
- [ ] Check browser console for errors

### Images not loading
- [ ] Check browser console for 404 errors
- [ ] Verify image URLs are accessible
- [ ] Check CORS if using external images
- [ ] Try using Unsplash URLs from the code

### Fonts look wrong
- [ ] Verify Google Fonts import in `/src/styles/fonts.css`
- [ ] Check for inline `style={{ fontFamily: '...' }}` attributes
- [ ] Clear browser cache
- [ ] Check Network tab to see if font loaded

### Build fails
- [ ] Check for TypeScript errors: `pnpm tsc --noEmit`
- [ ] Check for linting issues in code
- [ ] Verify all imports are correct
- [ ] Check console output for specific error

---

## 🚀 Ready to Build?

- [ ] Run `pnpm build` to create production build
- [ ] Check `/dist` folder for output
- [ ] Test production build: `pnpm preview`
- [ ] Deploy to your hosting platform

---

## 📖 Next Steps

### Learn More
- [ ] React documentation: https://react.dev/
- [ ] Tailwind CSS docs: https://tailwindcss.com/
- [ ] React Router docs: https://reactrouter.com/
- [ ] Lucide icons: https://lucide.dev/

### Enhance the Project
- [ ] Add animations with Motion (`import { motion } from 'motion/react'`)
- [ ] Add Mapbox token for interactive maps
- [ ] Optimize images with image optimization tools
- [ ] Add more content to existing pages
- [ ] Create new pages or sections

### Advanced
- [ ] Set up ESLint/Prettier for code formatting
- [ ] Add unit tests with Vitest
- [ ] Set up CI/CD pipeline
- [ ] Add analytics tracking
- [ ] Create CMS integration

---

## 🎉 Success!

Once you've completed the checklist above, you're ready to:
- ✅ Customize content for your own use case
- ✅ Deploy to production
- ✅ Share with stakeholders
- ✅ Extend with new features

---

**Questions?** Check the documentation files or leave comments in the code!

*Happy coding! 🚀*
