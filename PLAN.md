# Haze Info: Plan

Status: agreed (forks F1-F7 closed) · Milestone: MVP · Written 2026-10-18

## Problem

The October 2026 haze has pushed Singapore's 24-hour PSI into the 180-190s, closed schools for about 2 million Malaysian students, and grounded flights. The coverage is scattered across wire stories, NGO reports and government statements. Nobody can see in one place where the fires are, which concession holders sit on the burn scars, what those companies earn, or how Jakarta has responded.

The facts are also contested. Hotspots inside a concession do not prove the concession holder lit the fire, and companies publicly deny it. A site that blurs this will be easy to dismiss and legally risky. A site that keeps it precise can be a credible reference.

## Purpose

Educate a reader who knows nothing about the situation, make clear how serious it is and what the companies and the Indonesian government are doing to the environment and to people's health, and move them to act so that pressure builds for change. The site is an openly declared advocacy project. Its persuasion rests on accuracy and sourcing, not on adjectives (ADR-0002, ADR-0003, ADR-0007), and it says so on the methodology page.

## Solution

A scrolling story with a pinned map. It opens with a short primer for newcomers (what haze is, why peat fires are so hard to put out, and why Singapore and Malaysia breathe Indonesian smoke). The reader then moves through five chapters: **Source** (where the fires are), **Companies** (who holds the land that is burning), **People** (what the air is doing to them), **Government** (what Jakarta promised versus what happened), and **Take action** (what a reader can do next). Seriousness is conveyed with numbers and comparisons, such as readings against WHO guideline levels, hectares against familiar areas, and days of school lost. Each company has its own page with land, burned hectares, revenue, profit, environmental footprint, the allegation and the company's response. Every number links to its source and shows the date it was current.

## Users and actors

- **Primary:** someone unfamiliar with the situation, mostly general public in Singapore and Malaysia, on mobile first. When depth and simplicity conflict, simplicity wins above the fold and depth lives one tap down.
- **Secondary:** journalists and researchers, who want citable numbers and sources.
- **Non-human:** a scheduled GitHub Action that refreshes hotspot snapshots; a CI check that rejects uncited numbers. When a number and its source disagree, the source wins and the number is corrected.

## Scope

**In this milestone**

- Newcomer primer (under one minute to read) opening the story
- "Take action" chapter (ADR-0008): pre-written emails and posts to named targets, links to established organisations, consumer and investor guidance, all via links and `mailto:` (no backend)
- Story-scroll site with five chapters and a pinned MapLibre map (hotspots, burned area, concession outlines for profiled companies)
- 8-10 company profiles (ADR-0005), each with an allegation status and company response
- National and regional stat strip: burned hectares (total and inside concessions, by sector), hotspot counts, PSI/API readings, school closures, flight disruption
- Health section built from cited WHO and ministry guidance and reported health figures
- Government chapter as a sourced promise-versus-outcome timeline
- Live Singapore PSI widget with snapshot fallback; hotspot layer refreshed by scheduled Action
- English only, with text structured for later translation
- Deployed to GitHub Pages

**Out**

- Backend, accounts, user submissions, comments (frontend only)
- Estimated or modelled company profit; private firms show "undisclosed"
- Claims that a named company "caused" the haze without a court or ministry finding
- Bahasa Indonesia and Malay translations (content needs legal-wording verification)
- 2015 and 2019 haze deep-dives, social share cards, embeds (deferred)
- Personalised health advice. We link to NEA, MOH, WHO and Malaysia DOE.

## Requirements

| ID  | Requirement                                                                                                                                                                   | Status       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| R0  | A reader can see where the haze comes from, who holds the burning land, and what it does to people, with every claim traceable                                                | Core goal    |
| R1  | Every statistic shows source link, as-of date and method; the build fails on any uncited number                                                                               | Must-have    |
| R2  | Company profiles show land held, burned hectares, revenue, net profit (or "undisclosed"), environmental impact, allegation status and the company's response                  | Must-have    |
| R3  | Attribution wording follows ADR-0002 everywhere, enforced by a data-schema check                                                                                              | Must-have    |
| R4  | Map shows hotspots and burned area, with company concessions where the boundary data is licensed for use                                                                      | Must-have    |
| R5  | People-impact chapter: reported numbers affected, health effects, school and flight disruption                                                                                | Must-have    |
| R6  | Government chapter with dated, sourced promise-versus-outcome entries                                                                                                         | Must-have    |
| R7  | Live PSI widget that degrades to the last snapshot, visibly labelled                                                                                                          | Nice-to-have |
| R9  | A first-time reader can state what the haze is, who is implicated and what to do next after one read-through                                                                  | Must-have    |
| R10 | Take-action chapter with at least three concrete actions, each with a named target and a pre-filled message, and each linking to a verifiable primary organisation or contact | Must-have    |
| R8  | Usable on a 360px phone, keyboard navigable, charts have text alternatives, Lighthouse mobile performance >= 85                                                               | Must-have    |

## Shape

| Part | Mechanism                                                                                                                                                                                                                                                                 | ADR      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| S1   | Static SPA: Vite + Svelte + TypeScript, built to `dist/`, deployed by GitHub Actions to Pages, relative `base`, hash routing                                                                                                                                              | ADR-0001 |
| S2   | Evidence-first data: typed JSON files in repo; every stat is `{value, unit, source, asOf, method}`; a validate script fails the build on a missing field or a dead source URL                                                                                             | ADR-0003 |
| S3   | Attribution model: each company-concession link carries `evidence` (hotspot/burn-scar, ministry action, NGO report) and `allegationStatus` (`detected`, `ngo-alleged`, `ministry-sanctioned`, `court-finding`) plus `companyResponse`; UI wording derives from the status | ADR-0002 |
| S4   | Data freshness: committed snapshots plus a scheduled Action that refreshes hotspots; browser fetches Singapore PSI live and falls back to snapshot                                                                                                                        | ADR-0004 |
| S5   | Financials: listed-parent filings only, fiscal year labelled, otherwise `undisclosed`                                                                                                                                                                                     | ADR-0005 |
| S6   | Narrative layout: scroll chapters driving a pinned map, company routes `#/company/<slug>`                                                                                                                                                                                 | ADR-0006 |
| S7   | Government timeline: entries are `{date, commitment, outcome, sources[]}`, no free-form editorial text                                                                                                                                                                    | ADR-0007 |
| S8   | Take-action: data-driven action cards (`target`, `ask`, `template`, `channel`), templates that cite site stats by id so numbers stay in sync, outbound links checked by the validator                                                                                     | ADR-0008 |
| S9   | Primer and comparison helpers: stat records can carry `comparison` (e.g. multiple of WHO guideline), rendered by one component                                                                                                                                            | ADR-0003 |

## Affordances

**UI**

| Affordance                                                         | Place               | Wires to                    |
| ------------------------------------------------------------------ | ------------------- | --------------------------- |
| Stat strip with source popovers                                    | Top of each chapter | S2 stat records             |
| Pinned map with layer toggles (hotspots, burned area, concessions) | All chapters        | S4 snapshots, S2 geometries |
| Company cards ranked by burned hectares inside concession          | Companies chapter   | S3 links                    |
| Company page (land, burned, financials, response, sources)         | `#/company/<slug>`  | S2, S3, S5                  |
| Live PSI badge with "as of" stamp and fallback label               | Header              | S4                          |
| Government timeline                                                | Government chapter  | S7                          |
| Primer cards (what, why, how far)                                  | Story opening       | S2, S9                      |
| Action cards with "copy message" and "open email"                  | Take-action chapter | S8                          |
| "How we know" methodology page                                     | `#/method`          | S2, S3                      |

**Non-UI**

| Affordance         | Kind                                 | Wires to                                |
| ------------------ | ------------------------------------ | --------------------------------------- |
| `validate-data`    | Node script, runs in CI and pre-push | S2, S3: fields, URLs, wording status    |
| `refresh-hotspots` | Scheduled GitHub Action              | Writes snapshot JSON and opens a commit |
| `psi-client`       | Browser module                       | data.gov.sg PSI, snapshot fallback      |

## Implementation decisions

- Data lives under `src/data/` as JSON with TypeScript types generated from one schema, so the validator and the UI cannot disagree.
- Concession geometry is simplified at build time to keep the payload small. Only profiled companies get polygons.
- Wording for allegations comes from a lookup keyed on `allegationStatus`. Authors never hand-write "X burned" in copy; the validator rejects banned phrases in company text ("caused", "responsible for") unless status is `court-finding` or `ministry-sanctioned`.
- Health content links out to official guidance. Reported figures are quoted with the reporting body named.
- Map tiles from a free, keyless source (OpenFreeMap or a self-hosted Protomaps PMTiles file), so no key ships in the bundle.
- Privacy: no cookies, no third-party trackers.

## Testing approach

Highest seams: the data validator (pure functions over JSON), the built site under Playwright (a real browser against `vite preview`), and the PSI client with a stubbed fetch. Good tests assert what a reader sees and what the data contract guarantees, never component internals. Per-slice plans are in `SLICES.md`.

## Assumed defaults

| ID  | Assumed                                                                                                                                                                                                                                                      | Cost if wrong                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| A1  | Public audience is SG/MY general readers, mobile first                                                                                                                                                                                                       | Medium: layout and tone rework                                                                                        |
| A2  | data.gov.sg PSI endpoint allows browser CORS and needs no key                                                                                                                                                                                                | Low: fall back to snapshot-only PSI, refreshed by Action                                                              |
| A3  | NASA FIRMS hotspots are fetched by the Action (needs a MAP_KEY stored as a repo secret), never by the browser                                                                                                                                                | Low                                                                                                                   |
| A4  | Concession polygons are available under a licence permitting reuse (GFW/WRI or Nusantara Atlas). HAZE-1 found this does not hold today: GFW holds Indonesian concessions view only, and Nusantara Atlas needs written permission (see docs/data-licences.md) | High for R4: without them the map shows hotspots only and company pages show burned hectares as text. Verified in V1. |
| A5  | Counts of "people affected" use reported figures only; we do not model population exposure                                                                                                                                                                   | Low                                                                                                                   |
| A6  | 8-10 companies can be profiled from public filings and reports within the milestone                                                                                                                                                                          | Medium: fewer profiles, same shape                                                                                    |
| A7  | Plain CSS with CSS variables, no UI kit                                                                                                                                                                                                                      | Low                                                                                                                   |
| A8  | Action targets are the profiled companies' investor-relations or sustainability contacts, Singapore and Malaysia MPs/ministries, Indonesian ministries' public channels, and established NGOs. Exact contacts are verified when written, never guessed       | Medium: wrong contacts undermine the campaign; the validator checks URLs, a person checks addresses                   |
| A9  | No petition or signature collection of our own (that needs a backend and personal data)                                                                                                                                                                      | Low                                                                                                                   |

## Open risks

- **Data licensing (A4)** is the largest risk. HAZE-1 found no reusable Indonesian concession polygons, so V2 plans for a hotspots-only map unless Nusantara Atlas or WRI grants permission. Details and contacts are in `docs/data-licences.md`.
- **Legal exposure:** named-company content needs review. Mitigated by ADR-0002, but a lawyer's read before launch is cheap insurance. This is your call, not a build step.
- **Source drift:** PSI peaks already differ between outlets (181 vs 192). The methodology page must say which source wins (NEA).
- **Staleness:** the haze will ebb by November. The site must still read well as a reference afterwards, so "as of" stamps are mandatory.
