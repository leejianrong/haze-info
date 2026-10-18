<script lang="ts">
  import { onMount } from 'svelte'
  import {
    EMPTY_SNAPSHOT,
    loadHotspots,
    snapshotNote,
    type HotspotSnapshot,
  } from '../lib/hotspots.ts'
  import { BASEMAP_ATTRIBUTION, BASEMAP_STYLE, MAP_VIEW } from '../lib/map-style.ts'

  type Focus = { center: [number, number]; zoom: number }
  let { focus = MAP_VIEW }: { focus?: Focus } = $props()
  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  let container: HTMLDivElement
  let mapRef = $state<import('maplibre-gl').Map | undefined>()
  // Idle until the reader scrolls, taps or presses a key, so the heavy map code stays off the first load.
  let status = $state<'idle' | 'loading' | 'ready' | 'unavailable'>('idle')
  let showHotspots = $state(true)
  let apply: ((visible: boolean) => void) | undefined
  let startNow: (() => void) | undefined

  let hotspots = $state<HotspotSnapshot>(EMPTY_SNAPSHOT)
  const note = $derived(snapshotNote(hotspots))

  const ACTIVATE = ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown'] as const

  onMount(() => {
    let map: import('maplibre-gl').Map | undefined
    let cancelled = false
    let started = false
    const stop = () => ACTIVATE.forEach((t) => window.removeEventListener(t, start))
    function start() {
      if (started) return
      started = true
      stop()
      status = 'loading'
      void load()
    }
    ACTIVATE.forEach((t) => window.addEventListener(t, start, { passive: true }))
    startNow = start
    async function load() {
      try {
        const [maplibregl, snapshot] = await Promise.all([
          import('maplibre-gl'),
          loadHotspots(),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ])
        hotspots = snapshot
        if (cancelled) return
        map = new maplibregl.Map({
          container,
          style: BASEMAP_STYLE,
          center: MAP_VIEW.center,
          zoom: MAP_VIEW.zoom,
          attributionControl: false,
        })
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
        map.on('error', () => {
          if (status === 'loading') status = 'unavailable'
        })
        map.on('load', () => {
          map!.addSource('hotspots', {
            type: 'geojson',
            data: snapshot,
          } as import('maplibre-gl').GeoJSONSourceSpecification)
          map!.addLayer({
            id: 'hotspots',
            type: 'circle',
            source: 'hotspots',
            paint: { 'circle-radius': 4, 'circle-color': '#d9480f', 'circle-opacity': 0.85 },
          })
          apply = (visible) =>
            map!.setLayoutProperty('hotspots', 'visibility', visible ? 'visible' : 'none')
          apply(showHotspots)
          mapRef = map
          status = 'ready'
        })
      } catch {
        status = 'unavailable'
      }
    }
    return () => {
      cancelled = true
      stop()
      map?.remove()
    }
  })

  $effect(() => {
    apply?.(showHotspots)
  })

  $effect(() => {
    if (!mapRef) return
    const target = { center: focus.center, zoom: focus.zoom }
    if (reduceMotion) mapRef.jumpTo(target)
    else mapRef.flyTo({ ...target, duration: 1400, essential: false })
  })
</script>

<section
  class="map"
  aria-label="Map of fire hotspots"
  data-status={status}
  data-hotspots-visible={showHotspots}
  data-motion={reduceMotion ? 'none' : 'smooth'}
  data-focus={focus.center.join(',')}
  data-hotspot-count={hotspots.features.length}
>
  <div class="canvas" bind:this={container}>
    {#if status === 'idle'}
      <div class="facade">
        <svg
          viewBox="0 0 640 380"
          role="img"
          aria-label="Schematic of Sumatra, Kalimantan, Malaysia and Singapore"
        >
          <path d="M40 140 L170 195 L250 290 L205 335 L95 270 Z" class="land" />
          <path d="M390 170 L520 150 L570 235 L520 335 L420 345 L370 260 Z" class="land" />
          <path d="M230 80 L290 70 L315 115 L265 150 Z" class="land faint" />
          <g class="label">
            <text x="55" y="168">SUMATRA</text>
            <text x="400" y="190">KALIMANTAN</text>
            <text x="236" y="62">MALAYSIA</text>
            <text x="322" y="100">SINGAPORE</text>
          </g>
        </svg>
        <button class="load" onclick={() => startNow?.()}>Load the interactive map</button>
      </div>
    {:else if status === 'unavailable'}
      <p class="unavailable">The map could not load. The figures on this page are unaffected.</p>
    {/if}
  </div>
  <div class="legend">
    <label><input type="checkbox" bind:checked={showHotspots} /> Hotspots</label>
    <span>{note}</span>
  </div>
  <p class="credit">{BASEMAP_ATTRIBUTION}</p>
</section>

<style>
  .map {
    border: 1px solid var(--ink);
    background: var(--paper);
  }
  .canvas {
    position: relative;
    height: var(--map-h, min(60vh, 460px));
    min-height: 200px;
  }
  .facade {
    position: absolute;
    inset: 0;
    background: var(--paper);
    display: grid;
    place-items: center;
  }
  .facade svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .land {
    fill: color-mix(in srgb, var(--ink) 15%, var(--paper));
  }
  .land.faint {
    fill: color-mix(in srgb, var(--ink) 9%, var(--paper));
  }
  .label {
    font-family: var(--f-data);
    font-size: 12px;
    fill: var(--ink-2);
  }
  .load {
    position: relative;
    font-family: var(--f-data);
    font-size: 0.78rem;
    background: var(--ink);
    color: var(--ground);
    border: 0;
    padding: 10px 14px;
    cursor: pointer;
  }
  .unavailable {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    padding: 16px;
    text-align: center;
    color: var(--ink-2);
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    padding: 10px 14px;
    border-top: 1px solid var(--ink);
    font-family: var(--f-data);
    font-size: 0.72rem;
  }
  .legend label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }
  .credit {
    margin: 0;
    padding: 0 14px 10px;
    font-family: var(--f-data);
    font-size: 0.64rem;
    color: var(--ink-2);
  }
</style>
