# ADR-0004: Committed snapshots for most data, live browser fetch only for Singapore PSI, with fallback

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The project is frontend only, but hotspots and air quality change daily. NASA FIRMS requires a MAP_KEY, and a key in browser code would be public. The data.gov.sg PSI endpoint is keyless, but CORS behaviour has not been verified.

## Decision

- Company, concession, financial and government data are committed snapshots.
- Hotspots are fetched by a scheduled GitHub Action using a repo secret and committed as a JSON snapshot. This is a build-time job, not a runtime backend.
- Singapore PSI is fetched live in the browser. On failure, or after a timeout, the widget shows the last snapshot with a "last updated" label, never a blank state.
- Malaysia API readings are snapshot-only for now.

## Alternatives considered

| Option                             | Why not                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| Everything live in the browser     | FIRMS key would leak; CORS uncertain across sources       |
| Small proxy or serverless function | Breaks the frontend-only constraint; adds hosting and ops |
| Fully static, no live data         | Weakest for a changing situation                          |

## Consequences

Hotspot data lags by the Action's schedule (for example, every 3 hours), and the UI states that. Scheduled Actions on a repository can be paused after inactivity, so this needs checking. If the PSI CORS assumption (A2) fails, PSI becomes snapshot-only with no other change.
