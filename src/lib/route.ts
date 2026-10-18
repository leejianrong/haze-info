export type Route = { name: 'home' } | { name: 'company'; slug: string } | { name: 'not-found' }

// Hash routing (ADR-0001): "#/company/<slug>".
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '')
  if (path === '') return { name: 'home' }
  const m = /^company\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path)
  return m ? { name: 'company', slug: m[1] } : { name: 'not-found' }
}
