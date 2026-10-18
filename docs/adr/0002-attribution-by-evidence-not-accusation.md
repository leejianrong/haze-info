# ADR-0002: Attribute fires to concessions by evidence status, never as unqualified causation

- Status: Accepted
- Date: 2026-10-18
- Deciders: Jian

## Context

The site's headline subject is the companies behind the haze. The evidence is uneven. Satellite hotspots and burn scars show fire inside a concession. Greenpeace has linked 20+ concessions to smoke sources. Indonesian ministries have opened enforcement against 21 companies and sanctioned 26 (see `src/data/government.json`). Companies such as First Resources reply that fires began outside their boundaries and that hotspots alone do not establish responsibility. Naming a company as the cause without a finding is a defamation risk and weakens credibility.

## Decision

Every company-concession link carries an `allegationStatus`:

1. `detected`: burn scar or hotspot inside the concession (satellite data)
2. `ngo-alleged`: named in an NGO report
3. `ministry-sanctioned`: suspended, penalised or frozen by an Indonesian ministry
4. `court-finding`: a court has found liability

User-facing wording is derived from the status ("burn scar detected inside concession", "named in Greenpeace report", and so on). Where a company has published a response, it is shown beside the allegation with a link. Phrases like "caused" or "responsible for" are allowed only for statuses 3 and 4, and a validator checks this.

## Alternatives considered

| Option                             | Why not                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| "X caused the haze" headlines      | Unsupported for most cases; defamation exposure; easy for critics to dismiss |
| Hotspot map only, no company names | Drops the main focus of the project                                          |

## Consequences

The site is slower to condemn and much harder to rebut. Wording is less punchy. Each company needs research into its status and response, which costs time. The status can move up as findings arrive, so the data must be maintained. A pre-launch legal read is advisable.
