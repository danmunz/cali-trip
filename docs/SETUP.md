# Quick Setup Guide for GitHub Pages Deployment

Follow these steps to enable automatic deployment to GitHub Pages.

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/danmunz/cali-trip
2. Click **Settings** (top navigation)
3. Click **Pages** (left sidebar under "Code and automation")
4. Under **Source**, select **GitHub Actions** from the dropdown
5. ✓ Done! No need to click "Save" — the setting is applied immediately

## Step 2: Add Mapbox Token (Required for Maps)

### Get Your Token
1. Sign up or log in at https://www.mapbox.com/
2. Go to your [Account page](https://account.mapbox.com/)
3. Copy your **Default public token** (or create a new one)

### Add to GitHub Secrets
1. Go to your repository: https://github.com/danmunz/cali-trip
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** (green button)
4. Enter:
   - **Name:** `MAPBOX_TOKEN`
   - **Secret:** paste your Mapbox access token
5. Click **Add secret**

## Step 3: Deploy

### Automatic Deployment
The site deploys automatically on every push to `main`:

```bash
git push origin main
```

### Manual Deployment
To deploy manually without pushing code:

1. Go to **Actions** tab in your repository
2. Click **Deploy to GitHub Pages** workflow (left sidebar)
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

## Step 4: Verify Deployment

After pushing or manually running the workflow:

1. Go to the **Actions** tab
2. Click on the most recent workflow run
3. Watch the build and deploy jobs complete (typically 2-3 minutes)
4. Once complete, visit your live site:
   
   **🌐 https://danmunz.github.io/cali-trip/**

## Troubleshooting

### "pages build and deployment" runs instead of my workflow
- Make sure you selected **GitHub Actions** as the Source in Pages settings (not "Deploy from a branch")

### Build fails with "tsc --noEmit" error
- Check the error message in the workflow logs
- Run `npx tsc --noEmit` locally to see TypeScript errors
- Fix the type errors and push again

### Maps not showing on deployed site
- Verify `MAPBOX_TOKEN` secret is set correctly
- Check browser console for Mapbox errors
- Ensure your Mapbox token is valid and has not expired

### 404 errors when navigating directly to routes
- Verify `base: '/cali-trip/'` is set in `vite.config.ts`
- Check that `public/404.html` exists
- Clear browser cache and try again

### Site shows old content after updating `full-trip.md`
- Check that the workflow ran successfully in Actions tab
- The workflow regenerates data fresh on every deploy
- Clear browser cache to see latest changes

## Next Steps

- Edit `src/data/full-trip.md` to update trip content
- Push changes to `main` — site updates automatically
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation

---

**Questions?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) documentation or GitHub Actions logs for detailed error messages.
