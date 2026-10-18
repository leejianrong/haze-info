// Keyless basemap (HAZE-1: OpenFreeMap allows use without a key; do not use the OSM tile servers).
export const BASEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

export const MAP_VIEW = { center: [106.5, 0.5] as [number, number], zoom: 4.3 }

export const BASEMAP_ATTRIBUTION = 'Basemap: OpenFreeMap, data from OpenStreetMap contributors.'

// Where the pinned map looks as the reader moves through the chapters.
export const CHAPTER_FOCUS = {
  source: { center: [106.5, -0.5] as [number, number], zoom: 4.4 },
  companies: { center: [111.5, -1.5] as [number, number], zoom: 5.2 },
  people: { center: [103.8, 2.4] as [number, number], zoom: 6.2 },
  government: { center: [106.5, -0.5] as [number, number], zoom: 4.4 },
  act: { center: [106.5, 0.5] as [number, number], zoom: 4.1 },
}
