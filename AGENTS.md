# Coding Agent Guidelines

Guidelines for AI coding agents working in this repository.

## Unicode and Special Characters in JSX

**Never use Unicode escape sequences (`\uXXXX`) directly in JSX text content.**

JSX text content (text between JSX tags, outside of `{}` expressions) is treated as a raw string — JavaScript escape sequences are **not** processed. This means `\u2022` renders literally as `\u2022` on screen instead of the bullet character `•`.

### Rules

- **In JSX text content** (between tags): Use the actual Unicode character or an HTML entity.
  ```tsx
  // ✅ Correct — actual character
  <span>•</span>
  <span>°</span>
  <span>&amp;</span>

  // ❌ Wrong — renders literally as \u2022 on screen
  <span>\u2022</span>
  <span>\u00b0</span>
  ```

- **In JSX expressions** (inside `{}`): Unicode escape sequences work fine because they are evaluated as JavaScript.
  ```tsx
  // ✅ Correct — processed as JavaScript string
  {tripMeta.subtitle.replace(' | ', ' \u2022 ')}
  {"\u2022"}
  ```

- **Avoid HTML entities in JSX text** when you can use the actual character instead. JSX does support HTML entities (`&amp;` → `&`, `&lt;` → `<`), but using the real character (or `{'&'}` in a JSX expression) is clearer:
  ```tsx
  // ✅ Preferred
  Nine days through California's landscapes & vineyards

  // ✅ Also fine (JSX processes HTML entities)
  Nine days through California's landscapes &amp; vineyards

  // ❌ Avoid — confusing intent
  {'&amp;'}
  ```

### Common Characters

| Character | Use in JSX text | Use in JS string |
|-----------|----------------|-----------------|
| Bullet `•` | `•` | `"\u2022"` |
| Degree `°` | `°` | `"\u00b0"` |
| Em dash `—` | `—` | `"\u2014"` |
| Ampersand `&` | `&` or `&amp;` | `"&"` |
| Arrow `→` | `→` or `&rarr;` | `"\u2192"` |

## Generated Files

Files under `src/data/` with the `.generated.ts` suffix are build artifacts created by `pnpm generate`. Do **not** commit them to git (they are in `.gitignore`). The source of truth is `src/data/full-trip.md`.

## React Router

React Router is configured with `basename: "/cali-trip"` to match the Vite base path for GitHub Pages deployment. Do not change this without also updating `vite.config.ts`.

## Build & Dev Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm generate   # Regenerate data files from full-trip.md
pnpm validate   # Validate data files
```
