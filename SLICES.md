# Haze Info: Slices

Vertical increments. Each ends in something you can demonstrate. Slice 1 confronts the riskiest unknown: whether the company evidence can be sourced and licensed to the standard ADR-0002 and ADR-0003 demand.

## V1: One fully-sourced company page, live on Pages

**Delivers:** R1, R2 (one company), R3, A4 check

**Build plan**

1. Verify licences for concession polygons and burned-area data (GFW/WRI, Nusantara Atlas). Record the finding in the repo. If neither permits reuse, decide now: hotspots-only map, or ask the data owner for permission.
2. Scaffold Vite + Svelte + TS, GitHub Pages workflow, `base` path, hash router (ADR-0001).
3. Define the schema for `Stat`, `Source`, `Company`, `ConcessionLink`, `allegationStatus`, `companyResponse`, with generated TS types (ADR-0002, ADR-0003).
4. Write `validate-data`: required fields, date format, URL check with retries, banned-phrase check keyed on status.
5. Research and enter one company end to end (pick a listed one that has published a response, for example First Resources): land held, burned hectares, revenue, net profit with fiscal year, environmental note, allegation, response.
6. Build `<Stat>` and the company page at `#/company/<slug>`.

**Demo:** Open the deployed Pages URL, go to the company page. Every number opens a source with an as-of date. Allegation wording reads "named in Greenpeace report" with the company's response beside it. Add an uncited number locally and CI fails.

**Rests on assumptions:** A4 (polygon licence). If wrong, R4 drops to hotspots only and company pages show burned hectares as text.

### Test plan

#### End-to-end

- Built site: the company page renders land, burned hectares, revenue, profit, allegation and response, and each stat shows a source link and as-of date
- Deployed Pages URL returns the company page on a hard refresh of the hash route
- A company with no financial filings renders "undisclosed" and a note, not an empty cell

#### Integration

- `validate-data` fails the build on a stat missing `source`, `asOf` or `method`
- `validate-data` rejects "caused the haze" in a `detected`-status company text and accepts it for `court-finding`
- `validate-data` retries a flaky URL and warns on paywalled hosts instead of failing

#### Unit

- Wording lookup returns the right phrase for each `allegationStatus`
- Date parser rejects non-ISO dates
- `<Stat>` renders unit, value and source for each stat kind

## V2: The map: where the fires are

**Delivers:** R4, R0 (Source chapter)

**Build plan**

1. MapLibre with keyless tiles, layer toggles, mobile layout.
2. `refresh-hotspots` Action: FIRMS fetch with repo secret, snapshot JSON, "as of" metadata (A3).
3. Burned-area and sector-breakdown stats from Nusantara Atlas with sources.
4. Concession polygon for the V1 company (if licence allows), simplified at build time.

**Demo:** Open the site, see Sumatra and Kalimantan hotspots, toggle burned area and the concession outline, tap a hotspot for date and source, see the snapshot stamp.

**Rests on assumptions:** A3 (FIRMS key as repo secret works in Actions), A4.

### Test plan

#### End-to-end

- Map loads at 360px width, hotspot layer visible, toggles hide and show layers
- Snapshot stamp shows a date no older than the scheduled interval plus slack
- With tile requests blocked, the page still shows stats and a clear map-unavailable message

#### Integration

- Hotspot refresh script writes valid snapshot JSON with `asOf` and passes `validate-data`
- Geometry simplification keeps the payload under the agreed size budget (set in this slice)

#### Unit

- Snapshot-to-GeoJSON transform handles empty and malformed rows
- Sector aggregate sums match the source table

## V3: Story-scroll shell and newcomer primer

**Delivers:** R9, R8 (partly), R0 (narrative)

**Build plan**

1. Chapter layout with pinned map, mobile stacked fallback, `prefers-reduced-motion` (ADR-0006).
2. Primer cards: what haze is, why peat burns for weeks, why SG/MY are downwind, with sourced stats and comparisons (S9).
3. Stat strip per chapter, methodology page `#/method` including the advocacy-project statement.

**Demo:** Hand the site to someone who knows nothing about the haze and ask them to explain it back after one scroll.

**Rests on assumptions:** A1 (audience), A7 (plain CSS).

### Test plan

#### End-to-end

- Scrolling from primer to Source chapter changes the map layer; reduced-motion mode disables the animation but keeps content
- `#/method` lists every data source and the PSI source-of-truth rule
- Lighthouse mobile performance >= 85 on the built site

#### Integration

- Comparison component renders the WHO-guideline multiple from stat records

#### Unit

- Comparison calculator handles zero and missing guideline values

## V4: People chapter and live PSI

**Delivers:** R5, R7

**Build plan**

1. Impact stats: school closures, flights, PSI peaks, reported health figures, each cited with the reporting body. Where sources conflict (181 vs 192), show NEA's value and note the discrepancy.
2. Health guidance block linking to NEA, MOH, WHO and DOE, with no personal advice.
3. Live PSI widget with timeout and snapshot fallback (ADR-0004, A2).

**Demo:** PSI badge shows a live reading. Block the network request in dev tools: it flips to the last snapshot with a "last updated" label. The People chapter shows each stat's source.

**Rests on assumptions:** A2 (CORS), A5 (reported figures only).

### Test plan

#### End-to-end

- Live PSI badge renders a number and timestamp
- With the PSI request failing, the badge shows snapshot value and a fallback label, not blank
- Each People-chapter stat opens a source naming the publisher

#### Integration

- PSI client falls back after the timeout and on non-200 responses (stubbed fetch)

#### Unit

- PSI band classifier matches NEA's published bands

## V5: Companies chapter: the rest of the profiles

**Delivers:** R2 (all 8-10), R3, A6

**Build plan**

1. Research and enter the remaining companies (parent filings only, ADR-0005), including at least one with `undisclosed` financials and at least one `ministry-sanctioned`.
2. Companies chapter: cards ranked by burned hectares inside concession, link to pages.
3. Per-company concession outline where licensed.

**Demo:** Companies chapter lists all profiles, ranked. Open any card and see sourced land, burn, financials, allegation and response.

**Rests on assumptions:** A6, A4.

### Test plan

#### End-to-end

- Companies chapter shows every profiled company and the ranking order matches burned hectares
- Every company page passes the same checks as V1's
- "Undisclosed" appears for companies without filings, with the transparency note

#### Integration

- `validate-data` over the full company set passes in CI

#### Unit

- Ranking function breaks ties deterministically and ignores companies without burn data

## V6: Government chapter

**Delivers:** R6

**Build plan**

1. Collect entries (cloud-seeding permit dispute, grounded aerial firefighting, suspensions and penalties, frozen versus intact permits, ASEAN positions), each with sources and as-of dates (ADR-0007).
2. Timeline component and counts, with official statements shown alongside criticism.

**Demo:** Scroll the timeline: each entry pairs a commitment with its outcome and cites sources. No entry contains unsourced claims.

### Test plan

#### End-to-end

- Timeline renders entries in date order, each with at least one source link
- Entries with an official response show it beside the criticism

#### Integration

- Validator rejects a timeline entry with no `sources`

#### Unit

- Timeline sort and grouping by month

## V7: Take action chapter

**Delivers:** R10, A8

**Build plan**

1. Action cards (ADR-0008): ask company IR/sustainability contacts, Singapore and Malaysia representatives, Indonesian ministries' public channels, established NGO campaigns, and consumer and investor steps.
2. Templates pull site stats by id and use status-derived wording.
3. "Copy message" and "open email" on every card. A person verifies each address and link.

**Demo:** Pick an action card, press "copy message", see a message with current, sourced numbers and no accusation beyond the company's `allegationStatus`.

**Rests on assumptions:** A8 (contacts), A9 (no petition).

### Test plan

#### End-to-end

- At least three action cards render, each with a target, ask, copy button and working outbound link
- Copied text contains the stat value and a source URL
- Message for a `detected`-status company never contains "caused" or "responsible for"

#### Integration

- Template renderer fails when a referenced stat id does not exist
- Validator checks every outbound action link

#### Unit

- Template interpolation escapes special characters in `mailto:` bodies

## V8: Hardening and launch

**Delivers:** R8, launch readiness

**Build plan**

1. Accessibility pass: keyboard path, chart text alternatives, colour-blind-safe palettes, contrast.
2. Performance pass: image, map payload, code split.
3. CI gates: lint, type-check, validate-data, Playwright, Lighthouse budget (see `/dev-playbook`).
4. Legal read of named-company content (your call) and final source and link re-check.

**Demo:** Green CI on `main`, deployed site passes the checks below, and a final read-through confirms the acceptance criteria of every earlier slice.

### Test plan

#### End-to-end

- Keyboard-only run through all chapters and a company page works
- axe scan reports no serious or critical violations on each route
- Lighthouse mobile performance >= 85 and accessibility >= 95

#### Integration

- CI fails when any gate fails and blocks deploy

#### Unit

- n/a (covered by earlier slices)
