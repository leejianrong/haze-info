# Launch checklist

Tick each item before promoting the site. Items marked (you) need a person.

## Content

- [ ] (you) Legal read of named-company and named-individual content (HAZE-32). Profiles in draft PRs stay unmerged until this is done.
- [ ] `npm run validate-data:urls` passes with fresh URL checks (the weekly Links workflow runs it; on a machine with broken IPv6 set `NODE_OPTIONS=--network-family-autoselection-attempt-timeout=2000`).
- [ ] Every figure marked "to verify" in the design preview has been replaced by a sourced figure or removed.
- [ ] Company responses were re-searched in the last 7 days (profiles say "none found as of" a date).
- [ ] The government timeline was re-checked for new statements and corrections.
- [ ] Officials' offices were re-checked (a cabinet reshuffle was reported on 1 October 2026).

## Data and access

- [ ] (you) NASA FIRMS MAP_KEY added as a GitHub repo secret and the hotspot refresh Action (HAZE-8) has run once.
- [ ] (you) Written permission from Nusantara Atlas / TheTreeMap if concession outlines are to be shown (HAZE-10, HAZE-19).
- [ ] (you) Contact details on the action cards were opened and checked by a person on the day of launch.

## Quality gates

- [ ] CI is green on `main`: lint, type-check, unit, build and budgets, data, e2e, secret scan.
- [ ] Lighthouse median (CI job) is at least 85 for performance and 95 for accessibility.
- [ ] axe reports no serious or critical issues on every route, in light and dark.
- [ ] Keyboard-only run through the chapters, the primer, the timeline and a company page.

## Release

- [ ] Repo variable `DEPLOY_ENABLED` is `true` and the latest Deploy run succeeded.
- [ ] The live site shows the commit you expect, and a hard refresh on `#/company/...` works.
- [ ] The methodology page (`#/method`) credits every data source in use.
- [ ] A corrections route exists (GitHub issues) and someone is watching it.
