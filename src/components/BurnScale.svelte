<script lang="ts">
  import burnedData from '../data/burned-area.json'
  import { BurnedAreaSchema } from '../data/schema.ts'
  import { formatValue } from '../lib/format.ts'
  import { share, tiles, haToKm2 } from '../lib/scale.ts'
  import StatView from './Stat.svelte'

  const data = BurnedAreaSchema.parse(burnedData)
  const reference = data.referenceAreas[0]
  const SECTOR_NAME: Record<string, string> = {
    palm: 'Oil palm',
    mining: 'Mining',
    pulpwood: 'Pulpwood',
    logging: 'Logging',
    other: 'Other',
  }

  let measure = $state<'total' | 'inConcessions'>('total')
  let sector = $state(0)

  const stat = $derived(measure === 'total' ? data.total : data.inConcessions)
  const ha = $derived(Number(stat.value))
  const t = $derived(tiles(ha, Number(reference.area.value)))
  const concessionHa = Number(data.inConcessions.value)
  const itemised = data.bySector.reduce((sum, s) => sum + Number(s.stat.value), 0)
  const remainder = concessionHa - itemised
  const bars = [
    ...data.bySector.map((s) => ({
      label: SECTOR_NAME[s.sector],
      ha: Number(s.stat.value),
      stat: s.stat,
    })),
    { label: 'Not itemised in the source', ha: remainder, stat: null },
  ]
  const picked = $derived(bars[sector])
  const tileCount = $derived(t ? t.full + (t.part > 0.02 ? 1 : 0) : 0)
</script>

<div class="scale" data-measure={measure}>
  <div class="tools" role="group" aria-label="What to measure">
    <button aria-pressed={measure === 'total'} onclick={() => (measure = 'total')}>
      Burned, Jan to Jul 2026
    </button>
    <button aria-pressed={measure === 'inConcessions'} onclick={() => (measure = 'inConcessions')}>
      Inside concessions
    </button>
  </div>

  {#if t}
    <div class="row">
      <p class="big" aria-live="polite">
        <span class="mult">{t.multiple.toFixed(1)}</span>&times;
        <small>{reference.name}</small>
      </p>
      <p class="note">
        {formatValue(ha, 'ha')} is {formatValue(Math.round(haToKm2(ha)), 'km²')}, against
        {formatValue(Number(reference.area.value), 'km²')} for {reference.name}.
      </p>
    </div>
    <div
      class="waffle"
      role="img"
      aria-label={`${t.multiple.toFixed(1)} times the area of ${reference.name}`}
    >
      {#each Array.from({ length: tileCount }, (_unused, i) => i) as i (i)}
        <div class="tile"><i style:width="{i < t.full ? 100 : Math.round(t.part * 100)}%"></i></div>
      {/each}
    </div>
  {/if}

  <div class="stats">
    <StatView
      {stat}
      label={measure === 'total' ? 'Burned across Indonesia' : 'Inside industrial concessions'}
    />
    <StatView stat={reference.area} label={`Area of ${reference.name}`} />
  </div>

  <h3>Where the concession burn was</h3>
  <ul class="bars">
    {#each bars as b, i (b.label)}
      {@const pct = share(b.ha, concessionHa)}
      <li>
        <button
          class="bar"
          class:hatch={b.stat === null}
          aria-pressed={sector === i}
          disabled={b.stat === null}
          onclick={() => (sector = i)}
        >
          <span class="name">{b.label}</span>
          <span class="track"><span class="fill" style:width="{(pct ?? 0) * 100}%"></span></span>
          <span class="val">{formatValue(b.ha, 'ha')}</span>
        </button>
      </li>
    {/each}
  </ul>
  {#if picked.stat}
    <StatView stat={picked.stat} label={`${picked.label} concessions`} />
  {/if}
  <p class="foot">
    Bars show each sector's share of the {formatValue(concessionHa, 'ha')} inside concessions. The remainder
    is calculated here, not reported.
  </p>
</div>

<style>
  .scale {
    background: var(--paper);
    border: 1px solid var(--ink);
    padding: clamp(16px, 3vw, 28px);
    display: grid;
    gap: 18px;
  }
  .tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tools button {
    font-family: var(--f-data);
    font-size: 0.74rem;
    background: transparent;
    border: 1px solid var(--ink);
    padding: 7px 12px;
    cursor: pointer;
    color: var(--ink);
  }
  .tools button[aria-pressed='true'] {
    background: var(--ink);
    color: var(--ground);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 28px;
    align-items: end;
    justify-content: space-between;
  }
  .big {
    margin: 0;
    font-family: var(--f-display);
    font-stretch: 62%;
    font-weight: 900;
    font-size: clamp(3.6rem, 10vw, 5.6rem);
    line-height: 0.85;
    font-variant-numeric: tabular-nums;
  }
  .big small {
    font-family: var(--f-data);
    font-stretch: 100%;
    font-weight: 400;
    font-size: 0.8rem;
    text-transform: uppercase;
    margin-left: 8px;
    color: var(--ink-2);
  }
  .note {
    margin: 0;
    font-family: var(--f-data);
    font-size: 0.74rem;
    color: var(--ink-2);
    max-width: 40ch;
  }
  .waffle {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 6px;
  }
  .tile {
    aspect-ratio: 1;
    position: relative;
    border: 1.5px solid var(--ink);
    background: var(--ground);
    overflow: hidden;
  }
  .tile i {
    position: absolute;
    inset: 0 auto 0 0;
    background: repeating-linear-gradient(
      135deg,
      var(--ember) 0 5px,
      color-mix(in srgb, var(--ember) 70%, var(--ink)) 5px 10px
    );
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
  }
  h3 {
    font-family: var(--f-display);
    font-stretch: 78%;
    font-weight: 800;
    font-size: 1.5rem;
    margin: 6px 0 0;
  }
  .bars {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }
  .bar {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 9rem) 1fr 5.4rem;
    gap: 10px;
    align-items: center;
    text-align: left;
    background: transparent;
    border: 0;
    border-left: 3px solid transparent;
    padding: 6px 8px;
    cursor: pointer;
    color: var(--ink);
    font-size: 0.9rem;
  }
  .bar:disabled {
    cursor: default;
  }
  .bar[aria-pressed='true'] {
    border-left-color: var(--ember);
    background: color-mix(in srgb, var(--ember) 10%, transparent);
  }
  .track {
    height: 18px;
    background: color-mix(in srgb, var(--rule) 55%, transparent);
    position: relative;
  }
  .fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--ink);
  }
  .hatch .fill {
    background: repeating-linear-gradient(135deg, var(--ink-2) 0 4px, transparent 4px 8px);
  }
  .val {
    font-family: var(--f-data);
    font-size: 0.78rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .foot {
    margin: 0;
    font-family: var(--f-data);
    font-size: 0.7rem;
    color: var(--ink-2);
  }
</style>
