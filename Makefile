.DEFAULT_GOAL := help

.PHONY: help install dev build preview check lint test gate hooks

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-10s %s\n", $$1, $$2}'

install: ## Install dependencies from the lockfile
	npm ci

dev: ## Start the dev server (Vite picks the next free port and prints it)
	npm run dev

build: ## Production build into dist/
	npm run build

preview: ## Serve the production build locally
	npm run preview

check: ## Type-check Svelte and TypeScript
	npm run check

lint: ## ESLint and Prettier in check mode
	npm run lint

test: ## Fast unit tests (no browser, no network)
	npm test

gate: lint check test ## The pre-push gate: lint, type-check, unit tests

hooks: ## Install the pre-push hook
	ln -sf ../../scripts/git-hooks/pre-push .git/hooks/pre-push
