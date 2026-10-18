<script lang="ts">
  import { companies } from '../data/companies.ts'
  import { STATUS_PHRASE } from '../data/wording.ts'
  import { formatValue } from '../lib/format.ts'
  import { rankCompanies, strongestStatus } from '../lib/rank.ts'

  const ranked = rankCompanies(companies)
  const max = ranked[0]?.ha ?? 1
</script>

{#if ranked.length === 0}
  <p class="muted">No profiles yet.</p>
{:else}
  <p class="caption">
    Hectares burned inside each company's concessions, January to July 2026, most first. Fire inside
    a concession does not show who started it.
  </p>
  <ol class="ranking">
    {#each ranked as r (r.company.slug)}
      <li>
        <a href={`#/company/${r.company.slug}`}>
          <span class="name">{r.company.name}</span>
          <span class="track"><span class="fill" style:width="{(r.ha / max) * 100}%"></span></span>
          <span class="ha">{formatValue(r.ha, 'ha')}</span>
          <span class="status">{STATUS_PHRASE[strongestStatus(r.company)]}</span>
        </a>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .caption {
    font-family: var(--f-data);
    font-size: 0.74rem;
    color: var(--ink-2);
  }
  .muted {
    color: var(--ink-2);
  }
  .ranking {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  a {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5.6rem;
    grid-template-areas:
      'name ha'
      'track track'
      'status status';
    gap: 4px 10px;
    padding: 12px 14px;
    border: 1px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
  }
  a:hover {
    background: color-mix(in srgb, var(--ember) 10%, var(--paper));
  }
  .name {
    grid-area: name;
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 700;
    font-size: 1.15rem;
    line-height: 1.1;
  }
  .ha {
    grid-area: ha;
    font-family: var(--f-data);
    font-size: 0.8rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .track {
    grid-area: track;
    height: 10px;
    background: color-mix(in srgb, var(--rule) 55%, transparent);
    position: relative;
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--ink);
  }
  .status {
    grid-area: status;
    font-family: var(--f-data);
    font-size: 0.7rem;
    color: var(--ink-2);
  }
</style>
