<script lang="ts">
  import type { Stat } from '../data/schema.ts'
  import { formatDate, formatValue } from '../lib/format.ts'

  let { stat, label }: { stat: Stat; label?: string } = $props()
  let open = $state(false)
  const panelId = $props.id()
</script>

<div class="stat">
  {#if label}<span class="label">{label}</span>{/if}
  <span class="value">{formatValue(stat.value, stat.unit)}</span>
  <button class="rx" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
    source
  </button>
  <dl class="receipt" id={panelId} hidden={!open}>
    <dt>Source</dt>
    <dd>
      <a href={stat.source.url} rel="noopener">{stat.source.title}</a>, {stat.source.publisher}
    </dd>
    <dt>As of</dt>
    <dd>{formatDate(stat.asOf)}</dd>
    <dt>Method</dt>
    <dd>{stat.method}</dd>
    {#if stat.note}<dt>Note</dt>
      <dd>{stat.note}</dd>{/if}
  </dl>
</div>

<style>
  .stat {
    display: grid;
    gap: 4px;
    justify-items: start;
  }
  .label {
    font-family: var(--f-data);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .value {
    font-family: var(--f-display);
    font-stretch: 65%;
    font-weight: 800;
    font-size: 2.6rem;
    line-height: 0.95;
    font-variant-numeric: tabular-nums;
  }
  .rx {
    font-family: var(--f-data);
    font-size: 0.66rem;
    border: 1px solid var(--ink-2);
    background: transparent;
    color: var(--ink-2);
    padding: 3px 6px;
    border-radius: 2px;
    cursor: pointer;
  }
  .rx:hover,
  .rx[aria-expanded='true'] {
    background: var(--ink);
    color: var(--ground);
    border-color: var(--ink);
  }
  .receipt {
    font-family: var(--f-data);
    font-size: 0.72rem;
    line-height: 1.5;
    background: var(--ink);
    color: var(--ground);
    padding: 10px 14px;
    margin: 4px 0 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 14px;
    max-width: 62ch;
  }
  .receipt[hidden] {
    display: none;
  }
  .receipt dt {
    opacity: 0.6;
  }
  .receipt dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .receipt a {
    color: inherit;
  }
</style>
