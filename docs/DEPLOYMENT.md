# Deployment Guide

This guide covers deploying the cali-trip site to production via GitHub Pages using GitHub Actions.

---

## Overview

The site is deployed automatically to GitHub Pages whenever code is pushed to the `main` branch. The deployment workflow:

1. Installs dependencies using pnpm
2. Runs code generation from `full-trip.md` (creates fresh data files)
3. Validates TypeScript compilation
4. Builds the static site with Vite
5. Deploys to GitHub Pages

**Live site:** https://danmunz.github.io/cali-trip/

---

## Initial Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

That's it! GitHub Pages will now be deployed by the workflow automatically.

### 2. Set Up Mapbox Token (Required for Maps)

The site uses Mapbox GL JS for interactive maps. To enable maps in production:

1. **Get a Mapbox access token:**
   - Sign up at https://www.mapbox.com/
   - Go to your account settings
   - Create a new public access token (or use your default token)

2. **Add token as a GitHub Actions secret:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `MAPBOX_TOKEN`
   - Value: paste your Mapbox access token
   - Click **Add secret**

The workflow will automatically pass this token to Vite during the build as `VITE_MAPBOX_TOKEN`.

---

## GitHub Actions Workflow

The deployment workflow is defined in `.github/workflows/deploy.yml`.

### Workflow Triggers

- **Automatic:** Every push to `main` branch
- **Manual:** Via the "Actions" tab → "Deploy to GitHub Pages" → "Run workflow"

### Workflow Steps

```yaml
1. Checkout code
2. Setup pnpm + Node.js (v20)
3. Install dependencies (pnpm install --frozen-lockfile)
4. Run code generation (pnpm generate)
   ↳ Parses src/data/full-trip.md
   ↳ Creates itinerary.generated.ts & trip-meta.generated.ts
   ↳ Syncs locations.json trip_parts
5. Verify generated files exist
6. Run TypeScript type checking (tsc --noEmit)
7. Build site (pnpm build)
   ↳ Runs prebuild hook (pnpm generate) again automatically
   ↳ Uses VITE_MAPBOX_TOKEN from secrets
8. Upload build artifact (./dist)
9. Deploy to GitHub Pages
```

### Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `VITE_MAPBOX_TOKEN` | `secrets.MAPBOX_TOKEN` | Mapbox access token for interactive maps |

---

## Configuration Details

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  base: '/cali-trip/',  // GitHub Pages base path
  // ... other config
})
```

The `base` path must match your repository name for GitHub Pages.

### SPA Routing (`public/404.html`)

GitHub Pages serves a 404 page for any route that doesn't have a physical file. For single-page apps using client-side routing, we need to redirect 404s back to `index.html`.

The `public/404.html` file:
1. Stores the original URL in `sessionStorage`
2. Redirects to `/cali-trip/`
3. `index.html` restores the original URL using `sessionStorage`
4. React Router handles the route client-side

This allows direct links to routes like `/cali-trip/itinerary` to work correctly.

### Generated Files (.gitignore)

Generated data files are **build artifacts** and should not be committed to the repository:

```
src/data/*.generated.ts
```

The CI workflow generates these files fresh from `full-trip.md` on every build, ensuring the deployed site is always up-to-date with the markdown source.

---

## Local Development with Mapbox

To test maps locally:

1. Create a `.env.local` file in the project root:
   ```bash
   VITE_MAPBOX_TOKEN=your_token_here
   ```

2. Run the dev server:
   ```bash
   pnpm dev
   ```

The `.env.local` file is git-ignored and will not be committed.

**Without a token:** The map component shows a placeholder message: "Map disabled — VITE_MAPBOX_TOKEN not set"

---

## Testing the Build Locally

To verify the build works correctly before pushing:

```bash
# Generate data files
pnpm generate

# Type check
npx tsc --noEmit

# Build (with optional Mapbox token)
VITE_MAPBOX_TOKEN=your_token pnpm build

# Preview the production build
pnpm preview
```

Visit http://localhost:4173/cali-trip/ to test the production build locally.

---

## Deployment Checklist

Before deploying major changes:

- [ ] Edit `src/data/full-trip.md` with itinerary updates
- [ ] Run `pnpm generate` locally to verify parsing
- [ ] Test changes with `pnpm dev`
- [ ] Run `pnpm build` to verify build succeeds
- [ ] Check TypeScript errors with `npx tsc --noEmit`
- [ ] Commit and push to `main`
- [ ] Monitor the Actions workflow at https://github.com/danmunz/cali-trip/actions
- [ ] Verify deployment at https://danmunz.github.io/cali-trip/

---

## Monitoring Deployments

### View Workflow Runs

1. Go to the **Actions** tab in your repository
2. Click on the "Deploy to GitHub Pages" workflow
3. View the status, logs, and any errors

### Common Issues

**Build fails with TypeScript errors:**
- Run `npx tsc --noEmit` locally to see errors
- Fix type issues in the code
- Push the fix

**Generated files missing:**
- Check that `pnpm generate` runs successfully
- Verify `scripts/generate-data.ts` can parse `full-trip.md`
- Check workflow logs for parsing errors

**Maps not working in production:**
- Verify `MAPBOX_TOKEN` secret is set in repository settings
- Check browser console for Mapbox errors
- Confirm token is valid and has proper permissions

**404 errors on routes:**
- Verify `base: '/cali-trip/'` in `vite.config.ts`
- Check that `public/404.html` exists
- Ensure GitHub Pages source is set to "GitHub Actions"

**Styles or assets not loading:**
- Check that `base` path in `vite.config.ts` matches repository name
- Verify asset paths use relative imports
- Check browser console for 404s on assets

---

## Updating Content

The deployment workflow ensures content is always fresh:

1. Edit `src/data/full-trip.md` with itinerary changes
2. Commit and push to `main`
3. Workflow automatically:
   - Generates fresh data files
   - Builds the site
   - Deploys to GitHub Pages
4. Site updates within 1-2 minutes

No need to run `pnpm generate` or commit generated files — the CI workflow handles everything.

---

## Manual Deployment (if needed)

If you need to deploy manually:

```bash
# Build the site
pnpm build

# The dist/ folder contains the static site
# Deploy dist/ to any static hosting service
```

For GitHub Pages specifically:
- The workflow handles deployment automatically
- Manual deployment is not recommended (use the workflow instead)

---

## Architecture Notes

### Why Generate Data on CI?

Generated files are created fresh on every CI run to:
- Keep the git repository clean (no build artifacts)
- Ensure deployed content always matches `full-trip.md`
- Prevent stale data from manual generations
- Make content updates as simple as editing markdown

### Why Use GitHub Actions?

- **Automation:** Deploy on every push to main
- **Secrets management:** Mapbox token stored securely
- **Validation:** Type checks and generation run before deploy
- **Reliability:** Consistent build environment
- **Free:** GitHub Actions is free for public repositories

---

## Security Considerations

### Mapbox Token

- Token is stored as a GitHub Actions secret (encrypted)
- Never committed to the repository
- Passed to Vite build as environment variable
- Embedded in client-side bundle (public token)

**Note:** Mapbox public tokens are designed to be embedded in client-side code. For additional security, restrict the token's permissions to your domain in the Mapbox dashboard.

### Generated Files

- Not committed to git (potential source of stale data)
- Generated fresh on every build
- TypeScript types ensure data integrity

---

## Rollback Process

If a deployment introduces issues:

1. **Quick fix:** Push a fix commit to `main` (triggers auto-redeploy)
2. **Revert:** Use `git revert` to undo problematic commits, push to `main`
3. **Manual trigger:** Re-run a previous successful workflow from the Actions tab

---

## Performance Optimization

The build is optimized for production:

- Vite code splitting for faster loads
- Asset optimization (images, CSS, JS)
- Tree shaking to remove unused code
- Minification of all assets

Build time: ~1-2 minutes  
Deploy time: ~30 seconds  
Total: ~2-3 minutes from push to live

---

## Support & Troubleshooting

**Build failing?**
- Check the Actions tab for workflow logs
- Run the same commands locally to reproduce
- Verify all dependencies are in package.json

**Need help?**
- See workflow logs for detailed error messages
- Check this document for common issues
- Review Vite/React Router documentation for configuration issues

---

**Deployed with ❤️ to GitHub Pages**
