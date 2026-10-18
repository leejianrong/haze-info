<script lang="ts">
  import { findCompany } from './data/companies.ts'
  import { router } from './lib/router.svelte.ts'
  import CompanyPage from './pages/CompanyPage.svelte'
  import MethodPage from './pages/MethodPage.svelte'
  import Story from './pages/Story.svelte'

  const route = $derived(router.current)
  const title = $derived(
    route.name === 'company'
      ? `${findCompany(route.slug)?.name ?? 'Company'} | Haze Info`
      : route.name === 'method'
        ? 'How we know | Haze Info'
        : route.name === 'not-found'
          ? 'Page not found | Haze Info'
          : 'Haze Info',
  )
  $effect(() => {
    document.title = title
  })
  const company = $derived(route.name === 'company' ? findCompany(route.slug) : undefined)
</script>

<a
  class="skip"
  href="#main"
  onclick={(e) => {
    e.preventDefault()
    document.getElementById('main')?.focus()
  }}>Skip to content</a
>
<main id="main" tabindex="-1">
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

<style>
  .skip {
    position: absolute;
    left: 8px;
    top: -48px;
    z-index: 20;
    background: var(--ink);
    color: var(--ground);
    padding: 10px 14px;
    font-family: var(--f-data);
    font-size: 0.8rem;
  }
  .skip:focus {
    top: 8px;
  }
  main:focus {
    outline: none;
  }
</style>
