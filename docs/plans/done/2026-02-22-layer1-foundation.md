# Layer 1 Foundation

## Phase 1: Project Init
- [x] Create SvelteKit project (skeleton, typescript)
- [x] Install core deps (bits-ui, paneforge, lucide-svelte, svelte-sonner, effect, yaml)
- [x] Install fonts (@fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans)
- [x] Install Biome
- [x] Init shadcn-svelte
- [x] Add shadcn components (button, dialog, dropdown-menu, popover, command, resizable, sonner)
- [x] Init Biome config

## Phase 2: Config Files
- [x] biome.json - linting + formatting
- [x] vite.config.ts - Tailwind plugin
- [x] svelte.config.js - add $ui alias
- [x] src/app.css - CSS vars, font imports, scrollbar, Ecrous dark theme
- [x] src/app.html - add dark class

## Phase 3: Library Modules
- [x] src/lib/theme/tokens.ts - color/spacing constants
- [x] src/lib/theme/icons.ts - Lucide icon mappings
- [x] src/lib/theme/index.ts - barrel
- [x] src/lib/model/schema.ts - Model, EntityDef types (minimal)
- [x] src/lib/model/index.ts - barrel
- [x] src/lib/stores/context.ts - Svelte 5 context (runes)

## Phase 4: Layout Components
- [x] src/ui/layout/TopBar.svelte
- [x] src/ui/layout/Sidebar.svelte
- [x] src/ui/layout/RightPanel.svelte
- [x] src/ui/layout/BottomPanel.svelte
- [x] src/ui/layout/MainCanvas.svelte

## Phase 5: Routes
- [x] src/routes/+layout.svelte - import css, Toaster
- [x] src/routes/+page.svelte - redirect to /local/demo
- [x] src/routes/[org]/[project]/+layout.ts - ssr=false
- [x] src/routes/[org]/[project]/+layout.svelte - IDE shell w/ resizable panels
- [x] src/routes/[org]/[project]/+page.svelte - MainCanvas

## Verification
- [x] npm dev runs
- [x] /local/demo loads IDE layout
- [x] Panels resize via drag (paneforge)
- [x] Cmd+B / Cmd+J toggle panels
- [x] Dark theme + amber accents
- [x] npm lint passes
- [x] IBM Plex fonts configured

---

## Decisions
- Svelte 5 runes ($state, $derived) - not legacy stores
- npm instead of pnpm (available on system)
- Tailwind 4 + @tailwindcss/vite plugin
- Biome 2.x with tailwindDirectives enabled
