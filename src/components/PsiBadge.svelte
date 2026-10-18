<script lang="ts">
  import { onMount } from 'svelte'
  import {
    classifyPsi,
    headline,
    loadPsi,
    PSI_ATTRIBUTION,
    REGIONS,
    snapshot,
    type PsiResult,
  } from '../lib/psi.ts'

  let result = $state<PsiResult | null>(null)
  onMount(async () => {
    result = await loadPsi()
  })

  const shown = $derived(result ?? { origin: 'snapshot' as const, reading: snapshot })
  const top = $derived(headline(shown.reading))
  const band = $derived(classifyPsi(top.value))
  const when = $derived(
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Singapore',
    }).format(new Date(shown.reading.timestamp)),
  )
</script>

<section
  class="psi"
  aria-label="Singapore 24-hour PSI"
  data-origin={result ? shown.origin : 'loading'}
>
  <div class="head">
    <span class="num" data-band={band.id}>{top.value}</span>
    <div>
      <p class="band">{band.label}</p>
      <p class="meta">24-hour PSI, {top.region} Singapore (highest region)</p>
    </div>
  </div>
  <ul class="regions">
    {#each REGIONS as r (r)}
      <li data-band={classifyPsi(shown.reading.regions[r]).id}>
        <span>{r}</span><strong>{shown.reading.regions[r]}</strong>
      </li>
    {/each}
  </ul>
  <p class="meta status">
    {#if result === null}
      Loading the latest reading
    {:else if shown.origin === 'live'}
      Live from NEA, updated {when} SGT
    {:else}
      Could not reach NEA. Showing the last saved reading from {when} SGT
    {/if}
  </p>
  <p class="meta attribution">{PSI_ATTRIBUTION}</p>
</section>

<style>
  .psi {
    --good: #3f8f5b;
    --moderate: #3a7bb8;
    --unhealthy: #d9a21a;
    --very-unhealthy: #d9631a;
    --hazardous: #9b2230;
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 16px 18px;
    max-width: 520px;
    display: grid;
    gap: 10px;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .num {
    font-family: var(--f-display);
    font-stretch: 62%;
    font-weight: 900;
    font-size: 4.2rem;
    line-height: 0.85;
    font-variant-numeric: tabular-nums;
    border-bottom: 6px solid var(--ink);
  }
  .num[data-band='good'] {
    border-color: var(--good);
  }
  .num[data-band='moderate'] {
    border-color: var(--moderate);
  }
  .num[data-band='unhealthy'] {
    border-color: var(--unhealthy);
  }
  .num[data-band='very-unhealthy'] {
    border-color: var(--very-unhealthy);
  }
  .num[data-band='hazardous'] {
    border-color: var(--hazardous);
  }
  .band {
    font-family: var(--f-display);
    font-stretch: 75%;
    font-weight: 800;
    font-size: 1.5rem;
    margin: 0;
    line-height: 1.1;
  }
  .meta {
    font-family: var(--f-data);
    font-size: 0.7rem;
    color: var(--ink-2);
    margin: 0;
  }
  .attribution {
    font-size: 0.64rem;
  }
  .regions {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .regions li {
    font-family: var(--f-data);
    font-size: 0.68rem;
    display: grid;
    gap: 2px;
    border-top: 4px solid var(--rule);
    padding-top: 4px;
    text-transform: capitalize;
  }
  .regions strong {
    font-size: 1rem;
    font-weight: 500;
  }
  .regions li[data-band='good'] {
    border-color: var(--good);
  }
  .regions li[data-band='moderate'] {
    border-color: var(--moderate);
  }
  .regions li[data-band='unhealthy'] {
    border-color: var(--unhealthy);
  }
  .regions li[data-band='very-unhealthy'] {
    border-color: var(--very-unhealthy);
  }
  .regions li[data-band='hazardous'] {
    border-color: var(--hazardous);
  }
</style>
