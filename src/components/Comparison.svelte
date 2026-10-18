<script lang="ts">
  import { formatMultiple, multipleOf } from '../lib/compare.ts'
  import { formatValue } from '../lib/format.ts'
  import type { Stat } from '../data/schema.ts'
  import StatView from './Stat.svelte'

  // A reading set against a guideline, for example PM2.5 against WHO's 24-hour value.
  let {
    value,
    unit,
    guideline,
    subject,
  }: { value: number; unit: string; guideline: Stat; subject: string } = $props()

  const multiple = $derived(
    typeof guideline.value === 'number' ? multipleOf(value, guideline.value) : null,
  )
  const widthPct = $derived(multiple === null ? 0 : (Math.min(multiple, 20) / 20) * 100)
  const markPct = $derived(100 / 20)
</script>

{#if multiple !== null}
  <figure class="cmp">
    <p class="line">
      <strong>{formatMultiple(multiple)}</strong> the WHO guideline for {subject}
    </p>
    <div class="track" aria-hidden="true">
      <span class="fill" style:width="{widthPct}%"></span>
      <span class="mark" style:left="{markPct}%"></span>
    </div>
    <StatView stat={guideline} label="WHO guideline" />
    <figcaption>
      {formatValue(value, unit)} measured. WHO guideline {formatValue(
        guideline.value,
        guideline.unit,
      )}.
    </figcaption>
  </figure>
{/if}

<style>
  .cmp {
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .line {
    margin: 0;
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 1.1;
  }
  .line strong {
    color: var(--ember-text);
    font-weight: 900;
  }
  .track {
    position: relative;
    height: 14px;
    background: color-mix(in srgb, var(--rule) 55%, transparent);
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--ember);
  }
  .mark {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 2px;
    background: var(--ink);
  }
  figcaption {
    font-family: var(--f-data);
    font-size: 0.72rem;
    color: var(--ink-2);
  }
</style>
