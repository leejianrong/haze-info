import { parseRoute, type Route } from './route.ts'

export const router: { current: Route } = $state({ current: parseRoute(location.hash) })

window.addEventListener('hashchange', () => {
  router.current = parseRoute(location.hash)
  window.scrollTo(0, 0)
})
