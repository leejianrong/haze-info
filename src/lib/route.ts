export type Route =
  { name: 'home' } | { name: 'method' } | { name: 'company'; slug: string } | { name: 'not-found' }

// Hash routing (ADR-0001): "#/company/<slug>".
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '')
  if (path === '') return { name: 'home' }
  if (path === 'method') return { name: 'method' }
  const m = /^company\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path)
  return m ? { name: 'company', slug: m[1] } : { name: 'not-found' }
}
