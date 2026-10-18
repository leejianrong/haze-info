<script lang="ts">
  import { findCompany } from './data/companies.ts'
  import { router } from './lib/router.svelte.ts'
  import CompanyPage from './pages/CompanyPage.svelte'
  import MethodPage from './pages/MethodPage.svelte'
  import Story from './pages/Story.svelte'

  const route = $derived(router.current)
  const company = $derived(route.name === 'company' ? findCompany(route.slug) : undefined)
</script>

<main>
  {#if route.name === 'company' && company}
    <CompanyPage {company} />
  {:else if route.name === 'method'}
    <MethodPage />
  {:else if route.name === 'home'}
    <Story />
  {:else}
    <h1>Page not found</h1>
    <p><a href="#/">Back to the start</a></p>
  {/if}
</main>
