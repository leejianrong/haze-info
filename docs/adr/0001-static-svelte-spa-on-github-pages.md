# ADR-0001: Build a static Vite + Svelte + TypeScript SPA hosted on GitHub Pages

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The brief is frontend only. The audience is mostly on mobile, the content is read-heavy, and the site has to be cheap to keep online after the haze ends. The stack preference is Svelte.

## Decision

Vite + Svelte + TypeScript, built to static files and deployed to GitHub Pages by a GitHub Actions workflow. Vite `base` is relative (`./`), so the same build works under the repository path on Pages. Routing is hash-based (`#/company/<slug>`) because Pages cannot rewrite unknown paths to `index.html`.

## Alternatives considered

| Option                        | Why not                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| React + Vite                  | Stack preference is Svelte                                               |
| SvelteKit with static adapter | More machinery than a single-page story needs; hash routing is enough    |
| Cloudflare Pages              | Fine, but GitHub Pages was chosen and keeps CI and hosting in one place  |
| Astro                         | Good for content, but the pinned-map scroll story is heavily interactive |

## Consequences

Zero hosting cost and no server to secure. No server-side redirects or headers, so no custom CSP header (use a meta tag). Hash URLs are less pretty and not indexed as separate pages by search engines, which matters if company pages should rank. Revisit with SvelteKit prerendering if SEO becomes a goal.
