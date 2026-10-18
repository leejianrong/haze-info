<script lang="ts">
  import { onMount } from 'svelte'
  import hotspots from '../data/hotspots.json'
  import { BASEMAP_ATTRIBUTION, BASEMAP_STYLE, MAP_VIEW } from '../lib/map-style.ts'

  type Focus = { center: [number, number]; zoom: number }
  let { focus = MAP_VIEW }: { focus?: Focus } = $props()
  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  let container: HTMLDivElement
  let mapRef = $state<import('maplibre-gl').Map | undefined>()
  let status = $state<'loading' | 'ready' | 'unavailable'>('loading')
  let showHotspots = $state(true)
  let apply: ((visible: boolean) => void) | undefined

  const snapshotNote = hotspots.asOf
    ? `Hotspots as of ${hotspots.asOf}`
    : 'No hotspot snapshot has been published yet'

  onMount(() => {
    let map: import('maplibre-gl').Map | undefined
    let cancelled = false
    ;(async () => {
      try {
        // Keep the first paint free: start loading the map only once the browser is idle.
        await new Promise<void>((resolve) =>
          'requestIdleCallback' in window
            ? window.requestIdleCallback(() => resolve(), { timeout: 1500 })
            : setTimeout(resolve, 300),
        )
        if (cancelled) return
        const [maplibregl] = await Promise.all([
          import('maplibre-gl'),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ])
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
            data: hotspots,
          } as import('maplibre-gl').GeoJSONSourceSpecification)
          map!.addLayer({
            id: 'hotspots',
            type: 'circle',
            source: 'hotspots',
            paint: { 'circle-radius': 4, 'circle-color': '#d9480f', 'circle-opacity': 0.85 },
          })
          apply = (visible) =>
            map!.setLayoutProperty('hotspots', 'visibility', visible ? 'visible' : 'none')
          mapRef = map
          status = 'ready'
        })
      } catch {
        status = 'unavailable'
      }
    })()
    return () => {
      cancelled = true
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
>
  <div class="canvas" bind:this={container}>
    {#if status === 'unavailable'}
      <p class="unavailable">The map could not load. The figures on this page are unaffected.</p>
    {/if}
  </div>
  <div class="legend">
    <label><input type="checkbox" bind:checked={showHotspots} /> Hotspots</label>
    <span>{snapshotNote}</span>
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
