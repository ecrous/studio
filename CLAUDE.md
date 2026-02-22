# CLAUDE.md — Ecrous Studio

> This file is the complete architectural context for the Ecrous Studio project.
> Read it fully before making any code changes. Every section represents a deliberate decision.

---

## Plan Tracking

Before starting any multi-step work, create or update `docs/plans/{YYYY-MM-DD}-{slug}.md`.
Format:
- [ ] Step description
- [x] Completed step

After completing each step, update the checkbox. When resuming work (`claude --continue`), 
read the active plan file first to understand where we left off.

When a plan is fully complete, move it to `docs/plans/done/`.

---

## Project Identity

- **Project name:** Ecrous ("source" reversed)
- **Two repositories:**
  - **Ecrous Studio** — visual model editor (this repo). Slogan: *"Your system, visually"*
  - **Ecrous Kernel** — Rust derivation engine (separate repo). Slogan: *"Model once, derive everything"*
- **License:** AGPL-3.0 with output exception (generated artifacts belong to users, core engine protected from proprietary forks). Dual licensing with commercial option available later.
- **Philosophy:** Data models and their invariants are the single source of truth. All other representations — database schemas, REST/GraphQL APIs, TypeScript types, admin interfaces, migration plans — are mechanically derived from this one canonical form.

---

## The Core Insight

The project evolved through three phases of architectural thinking:

1. **Phase 1 (abandoned):** Rust CMS with code generation, field tokens, macro systems. Failed because of chicken-and-egg compilation dependencies, explosive generated code complexity, and nine synchronized declaration sites that undermined the goal of Django-level ergonomics.

2. **Phase 2 (explored):** No-code/low-code approach inspired by Strapi and Windmill.dev. Windmill's philosophy of "scripts as source of truth with UI as editor" was influential but still picked a specific representation (TypeScript) as canonical.

3. **Phase 3 (current):** The model and its invariants ARE the canonical form. No code representation is primary. A visual UI captures entities, fields, relationships, state machines, permissions, and invariants. A Rust engine reads these model descriptions at runtime and derives everything else. The YAML model file is the interchange format between Studio and Kernel.

**Key principle:** Correctness is enforced by construction across all layers, not by convention. If the model validates, the derived system is correct.

---

## Two Products, One Data Format

```
┌─────────────────────┐         model.yaml         ┌──────────────────┐
│                     │                             │                  │
│   Studio (Svelte)   │  ──── writes to disk ────▶  │  Kernel (Rust)   │
│                     │                             │                  │
│  Visual editor      │         hot reload          │  HTTP API server │
│  Canvas, panels     │  ◀──── watches file ─────   │  Postgres        │
│  Live preview       │                             │  Prepared SQL    │
│  Verification       │                             │                  │
└─────────────────────┘                             └──────────────────┘
```

- The **Studio** does NOT need the Kernel. It's a standalone editor. Output = YAML model file.
- The **Kernel** does NOT need the Studio. You can write model YAML by hand.
- They meet in the middle: **the model file format is the contract**.
- Do NOT make the Kernel the backend for the Studio. That creates a circular dependency.

### Integration Points (future)

1. **Dev mode:** Studio writes `model.yaml` to disk → Kernel watches and hot-reloads (~35ms) → Studio shows live API panel
2. **Migration preview:** Studio calls Kernel's `POST /meta/migrations/preview` or runs its own TypeScript differ
3. **Hosted/cloud mode (far future):** Studio as web app → management API → orchestrates Kernel instances

### Verification (the one place Rust helps the Studio)

- **Option A (preferred start):** Structural checks (BFS reachability, dead ends, field references) run in TypeScript in-browser
- **Option B (later):** Z3 WASM build (`z3-solver` npm package) for SMT solving in-browser
- **Option C (later):** Verification API — lightweight Rust service running Z3/TLA+ checks
- Don't block the Studio on having a Rust backend.

---

## Technology Stack

### Chosen (use these)

| Tool | Purpose | Why specifically |
|------|---------|-----------------|
| **SvelteKit** | Framework, routing, SSR-ready | Fine-grained reactivity without memoization; file-based routing maps to workspace views |
| **TailwindCSS** | Styling | Dark theme via CSS variables. NO raw `<style>` blocks — use utility classes in templates, `@apply` only in `app.css` for base/component layer |
| **shadcn-svelte** | Accessible component primitives | Built on Bits UI. Behavior without visual opinions. Install individually: `npx shadcn-svelte@latest add button dialog dropdown-menu` |
| **SvelteFlow** | Lifecycle canvas | `@xyflow/svelte`. Nodes = states, edges = transitions. Custom nodes are regular Svelte components |
| **CodeMirror 6** | YAML/SQL/TS preview panels | NOT Monaco (3MB, overkill). Modular, lightweight. Packages: `@codemirror/lang-yaml`, `@codemirror/lang-sql`, `@codemirror/lang-javascript` |
| **Effect.ts** | Model operations, validation, structured errors | Typed composable error handling, fiber-based concurrency, Schema validation mirroring Rust types, Layer pattern for DI |
| **svelte-dnd-action** | Drag-and-drop outside canvas | Field reordering, state lists, guard reordering. SvelteFlow handles canvas drag |
| **cmdk-sv** | Command palette (Cmd+K) | Search entities, jump to lifecycle, create field, run verification |
| **svelte-sonner** | Toast notifications | Verification findings, save confirmations, hot-reload notifications |
| **Lucide Svelte** | Icons | Same set as shadcn-svelte. Clean, consistent |
| **IBM Plex Mono** | Code/monospace font | Via `@fontsource/ibm-plex-mono`, self-hosted |
| **IBM Plex Sans** | UI labels/headers font | Via `@fontsource/ibm-plex-sans`, same family |
| **Biome** | Linting + formatting | Replaces ESLint + Prettier. Configure from day one |

### NOT chosen (do not add)

| Tool | Why not |
|------|---------|
| **Flowbite** | Pre-styled "consumer app" components. Fighting overrides. Doesn't have IDE-like components (resizable panels, property inspectors, command palettes, tree views) |
| **Monaco** | 3MB, overkill for preview panels |
| **Any charting library** | Query/analytics is a plugin concern. Don't pick now |
| **Any form library** | The forms ARE the product. Field editor, condition builder, permission matrix are all custom. Use Svelte `bind:value` + Effect.ts Schema |
| **Any rich text editor** | `rich_text` field type is a plugin concern |
| **Any data table library** | Admin preview tables are generated, not interactive grids. If needed later, TanStack Table has Svelte adapter |

---

## Theme System

### CSS Variables (defined in `app.css`)

```css
:root {
  --bg: #06060a;
  --bg-1: #0a0a10;
  --bg-2: #0e0e16;
  --border: #1a1a28;
  --text: #d0d0d8;
  --dim: #707088;
  --accent: #e8a025;
  --green: #6ec46e;
  --red: #e05050;
  --blue: #5a9ad6;
  --purple: #b080cc;
}
```

### Usage in Tailwind

Use throughout components: `bg-[var(--bg-1)]`, `text-[var(--accent)]`, `border-[var(--border)]`.

**Aesthetic:** Dark, monospace, industrial, amber accents. Tool UI, not consumer app.

### Typography

- **Code/data:** IBM Plex Mono
- **UI labels/headers:** IBM Plex Sans
- Load via `@fontsource` packages (self-hosted, no Google Fonts dependency)

### Styling Rules

- **Primary:** Tailwind utility classes in component templates
- **`@apply`:** Only in `app.css` for base/component layer styles (scrollbars, resets, shared patterns)
- **`<style>` blocks:** Avoid entirely. If you need component-scoped styles, use Tailwind's `@apply` in a minimal `<style>` block as last resort
- **Every component** inherits the palette through CSS variables

---

## Application Layout

The Studio is an IDE-like workspace:

```
┌──────────────────────────────────────────────────────────────┐
│  Top bar: app name, entity selector, save, deploy, cmd+K    │
├────────┬─────────────────────────────────┬───────────────────┤
│        │                                 │                   │
│ Left   │         Main Canvas             │   Right Panel     │
│ Panel  │                                 │                   │
│        │   (lifecycle editor,            │   (detail editor, │
│ Entity │    schema table,                │    properties,    │
│ tree,  │    condition builder,           │    derived        │
│ layer  │    permissions matrix)          │    preview)       │
│ nav    │                                 │                   │
│        │                                 │                   │
├────────┴─────────────────────────────────┴───────────────────┤
│  Bottom panel: verification findings, YAML preview, terminal │
└──────────────────────────────────────────────────────────────┘
```

- All three side panels are resizable (drag dividers)
- Bottom panel collapses
- Use `svelte-splitpanes` or a custom drag handler (~50 lines)
- Standard IDE layout — users already know how to use it

---

## Directory Structure

```
studio/
├── CLAUDE.md                              ← This file
├── biome.json                             ← Biome config (linting + formatting)
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── static/
│   └── fonts/                             ← IBM Plex Mono + Sans (from @fontsource)
│
└── src/
    ├── app.css                            ← CSS variables, @apply base styles, font-face, scrollbar
    ├── app.html
    │
    ├── lib/
    │   ├── model/                         ← THE CORE — mirrors Rust kernel types
    │   │   ├── schema.ts                  ← All TS types: Model, EntityDef, FieldType, Condition, etc.
    │   │   ├── operations.ts              ← Operation ADTs + pure applier + inverse (for undo)
    │   │   ├── store.ts                   ← ModelStore: op-based, undo/redo, path subscriptions, dirty tracking
    │   │   ├── storage.ts                 ← Storage abstraction + localStorage impl + YAML serialize
    │   │   ├── history.ts                 ← Undo/redo stack (snapshot-based)
    │   │   ├── serialize.ts               ← Model ↔ YAML serialization
    │   │   ├── default-model.ts           ← E-commerce demo model
    │   │   └── index.ts                   ← Barrel export
    │   │
    │   ├── engine/                         ← In-browser derivation preview (TypeScript "compiler")
    │   │   ├── derive-types.ts            ← Model → TypeScript type strings
    │   │   ├── derive-ddl.ts              ← Model → Postgres DDL strings
    │   │   ├── derive-endpoints.ts        ← Model → REST endpoint descriptions
    │   │   ├── derive-admin.ts            ← Model → Admin UI component descriptions
    │   │   ├── verify-structural.ts       ← BFS reachability, dead ends, field reference checks
    │   │   └── index.ts
    │   │
    │   ├── theme/                          ← Centralized design tokens
    │   │   ├── tokens.ts                  ← Color/spacing/typography constants (mirrors CSS vars)
    │   │   ├── icons.ts                   ← Curated Lucide icon mappings for domain concepts
    │   │   └── index.ts
    │   │
    │   └── stores/
    │       └── context.ts                 ← Svelte context: useModelStore(), useNavigation()
    │
    ├── ui/
    │   ├── primitives/                     ← Reusable atomic components (built on shadcn-svelte/Bits UI)
    │   │   ├── Badge.svelte               ← Type badges, status indicators
    │   │   ├── StatusDot.svelte           ← Green/amber/red state indicators
    │   │   ├── TypeIcon.svelte            ← Field type icons
    │   │   ├── KeyValueRow.svelte         ← Label + value pairs for property panels
    │   │   ├── EditableLabel.svelte       ← Click-to-edit text
    │   │   ├── EmptyState.svelte          ← "No X yet" placeholder
    │   │   └── index.ts
    │   │
    │   ├── editors/                        ← Domain-specific editor components
    │   │   ├── FieldTypeEditor.svelte     ← Dropdown/dialog for changing field type + constraints
    │   │   ├── ConditionBuilder.svelte    ← Visual builder for guards/invariants/permissions
    │   │   ├── PermissionMatrix.svelte    ← Role × action grid
    │   │   ├── InvariantEditor.svelte     ← Invariant rule builder
    │   │   ├── RelationshipEditor.svelte  ← Relationship config panel
    │   │   ├── LifecycleNode.svelte       ← SvelteFlow custom node (state)
    │   │   ├── TransitionEdge.svelte      ← SvelteFlow custom edge (with guard labels)
    │   │   └── index.ts
    │   │
    │   └── layout/                         ← Shell components
    │       ├── ResizablePanel.svelte      ← Drag-to-resize panel primitive
    │       ├── TopBar.svelte              ← Entity tabs, undo/redo, save, keyboard shortcuts
    │       ├── Sidebar.svelte             ← Entity list + layer nav
    │       ├── BottomPanel.svelte         ← Collapsible YAML preview + verify + terminal tabs
    │       └── index.ts
    │
    └── routes/
        ├── +layout.svelte                 ← Root: CSS import, sonner toasts
        ├── +page.svelte                   ← Redirects → /local/demo/entities/Order
        │
        └── [org]/[project]/
            ├── +layout.ts                 ← SSR=false, extract org/project params
            ├── +layout.svelte             ← IDE shell: load model, provide context, 3-panel layout, auto-save
            ├── +page.svelte               ← Redirect to first entity
            │
            ├── entities/[name]/
            │   └── +page.svelte           ← Entity editor: field table, relationships, lifecycle cards
            │
            ├── lifecycle/[entity]/[lifecycle]/
            │   └── +page.svelte           ← Lifecycle canvas (SvelteFlow)
            │
            ├── system/
            │   └── +page.svelte           ← System config: toggles, roles, tenancy, events
            │
            └── derived/
                └── +page.svelte           ← Generated output preview: API endpoints, types, DDL
```

---

## Model Store Architecture (Critical — Read Carefully)

### Operation-Based, Not Mutation-Based

Every model change goes through an operation. Never mutate the model directly.

```typescript
// ❌ WRONG — kills CRDT-ability, no undo, no history
model.update(m => {
  m.entities["Order"].fields["email"].required = true
  return m
})

// ✅ CORRECT — operation-based
store.apply({
  type: "set",
  path: ["entities", "Order", "fields", "email", "required"],
  value: true,
  timestamp: Date.now(),
  author: userId,
})
```

### Why This Matters

Operation-based design gives you:
- **Undo/redo** for free (replay forward, reverse backward)
- **CRDT integration later** (operations merge, not states)
- **Offline support** (queue operations, sync on reconnect)
- **Audit trail** (who changed what when)
- **Time travel debugging** (replay to any point)

### The ModelStore Interface

```typescript
interface ModelStore {
  // Read (reactive — components subscribe)
  subscribe(path: string[]): Readable<any>

  // Shorthand for path-based derived store
  at(path: string[]): Readable<any>

  // Write (always through operations)
  apply(op: Operation): void

  // History
  undo(): void
  redo(): void
  canUndo: Readable<boolean>
  canRedo: Readable<boolean>

  // Dirty tracking
  isDirty: Readable<boolean>
  markClean(): void

  // Serialization
  toYaml(): string
  fromYaml(yaml: string): void

  // Full model access
  get(): Model
}
```

### Operation Types

```typescript
type Operation =
  | { type: "set"; path: string[]; value: any }
  | { type: "delete"; path: string[]; key: string }
  | { type: "insert"; path: string[]; index: number; value: any }
  | { type: "move"; path: string[]; from: number; to: number }
```

### Undo/Redo

Pure inverse computation. Every operation has a computable inverse:
- `set` → `set` with old value
- `delete` → `set` with deleted value
- `insert` → `delete` at index
- `move` → `move` reversed

History is a stack of operations (not model snapshots for efficiency, but snapshots are acceptable for v1).

### Path-Based Subscriptions

`store.at(["entities", "Order", "fields", "email"])` returns a Svelte derived store that only re-emits when that specific path changes. This gives fine-grained reactivity without manual memoization.

---

## CRDT Readiness (Design Now, Build Later)

### The Yjs Migration Path

The model maps to Yjs CRDT types:

```
Model         → Y.Map
  entities    → Y.Map (of Y.Map per entity)
    fields    → Y.Map (of Y.Map per field)
    lifecycles → Y.Map
    ...
```

When you add Yjs, you replace the ModelStore internals. The interface stays the same. Every component that uses `store.at(...)` and `store.apply(...)` works identically.

### When to Add Yjs

When two or more users want to edit the same model simultaneously. Not v1 — it's a collaboration feature for teams. Yjs also gives awareness (other users' cursors) and offline-first for free.

### Cost of This Design

~2-3 days more than a naive writable store. You write an operation applier and path-based subscriber instead of direct mutations. But undo/redo comes free and CRDT migration becomes a weekend project instead of a rewrite.

---

## Storage Abstraction

```typescript
interface ModelStorage {
  load(orgId: string, projectId: string): Promise<Model>
  save(orgId: string, projectId: string, model: Model): Promise<void>
  watch(orgId: string, projectId: string): AsyncIterable<Model>
}

// Today:
class LocalBrowserStorage implements ModelStorage { /* localStorage or IndexedDB */ }

// Tomorrow:
class ApiStorage implements ModelStorage { /* fetch from hosted backend */ }

// With Yjs:
class YjsStorage implements ModelStorage { /* Y.Doc synced via WebSocket */ }
```

The orgId/projectId scope is baked in from day one. Adding hosted tenancy later is just a new ModelStorage implementation.

---

## Tenancy

### Studio Tenancy (editor — who can edit which models)

- URL structure: `/[org]/[project]/entities/[name]`
- Today: `org = "local"`, `project = "demo"`
- SvelteKit `[org]/[project]` layout loads project, checks permissions, provides model store to all child routes
- Do NOT build auth, org management, billing, invitations now. Just ensure the URL structure and storage interface use org/project scope.

### Kernel Tenancy (runtime — separate concern)

- Who can access which data in the generated application
- Handled by Kernel, not Studio
- Different auth system (JWT, API keys for end users)

---

## Effect.ts Model Mirror

Define model types in Effect.ts Schema that structurally mirror the Rust kernel types. Same YAML validates on both sides.

```typescript
import { Schema } from "effect"

const FieldType = Schema.Union(
  Schema.Struct({ kind: Schema.Literal("text"), max_length: Schema.optional(Schema.Number) }),
  Schema.Struct({ kind: Schema.Literal("email") }),
  Schema.Struct({ kind: Schema.Literal("currency"), min: Schema.optional(Schema.Number) }),
  Schema.Struct({ kind: Schema.Literal("select"), options: Schema.Array(Schema.String) }),
  Schema.Struct({ kind: Schema.Literal("lifecycle"), lifecycle: Schema.String }),
)

const Condition = Schema.Struct({
  field: Schema.String,
  op: Schema.Literal("eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "is_set", "is_null"),
  value: Schema.optional(Schema.Unknown),
})

const EntityDef = Schema.Struct({
  fields: Schema.Record({ key: Schema.String, value: FieldDef }),
  relationships: Schema.optional(Schema.Record({ key: Schema.String, value: RelationshipDef })),
  lifecycles: Schema.optional(Schema.Record({ key: Schema.String, value: LifecycleDef })),
  permissions: Schema.optional(PermissionsDef),
  invariants: Schema.optional(Schema.Array(InvariantDef)),
})
```

If it validates in Effect, it will compile in Rust. Instant feedback without backend round-trip.

---

## Model File Format

### Version from Day One

```yaml
version: 1
system:
  name: "my-app"
  database: postgres
  auth: true
  roles: [admin, manager, user]
  tenancy:
    enabled: false
entities:
  Order:
    fields:
      email:
        type: email
        required: true
      total:
        type: currency
        min: 0
    lifecycles:
      payment:
        initial: pending
        states: [pending, authorized, captured, refunded]
        transitions:
          - from: pending
            to: authorized
            guard:
              field: total
              op: gt
              value: 0
    relationships:
      customer:
        kind: belongs_to
        target: Customer
    permissions:
      create: [admin, manager]
      read: [admin, manager, user]
      update: [admin]
      delete: [admin]
    invariants:
      - name: valid_total
        condition:
          field: total
          op: gte
          value: 0
```

When the format changes, write migrations from version N to N+1. Without a version number, you can't distinguish old from new.

---

## Default Demo Model

E-commerce model that exercises every feature:

- **Org** — simple entity (fields only)
- **Tag** — simple entity (fields only)
- **Customer** — entity with relationships
- **Order** — complex entity with dual lifecycles (payment + fulfillment), permissions, invariants, relationships
- **OrderItem** — entity with belongs_to relationships

This model should load by default when the Studio opens. It demonstrates fields, relationships, lifecycles, guards, permissions, and invariants all working together.

---

## In-Browser Engine (`lib/engine/`)

Pure functions that read the Model and generate preview strings. No execution — just string generation for the preview panels.

- **`derive-types.ts`** — Model → TypeScript interface strings
- **`derive-ddl.ts`** — Model → Postgres CREATE TABLE / ALTER TABLE strings
- **`derive-endpoints.ts`** — Model → REST endpoint descriptions (method, path, request/response shape)
- **`derive-admin.ts`** — Model → Admin UI component descriptions (which fields to show, which are editable)
- **`verify-structural.ts`** — BFS reachability, dead-end states, dangling field references, unreachable states, contradicting invariants

These are the TypeScript equivalent of what the Rust kernel does at runtime, but simplified for preview purposes. They update live as the user edits the model.

---

## Build Order (Phases)

### Phase 1: Studio Standalone (current phase)

SvelteKit + Effect.ts, no Rust needed.

1. **Layer 1 — Foundation:** SvelteKit + Tailwind + Biome + fonts + CSS variables + IDE shell layout (three resizable panels + top bar + sidebar + bottom panel). All styled with Tailwind, zero raw CSS.
2. **Layer 2 — Model core:** `lib/model/` with schema types, operations, applier, store, storage, history, serialization. Default demo model loading.
3. **Layer 3 — Editors:** Entity field table → lifecycle canvas (SvelteFlow) → condition builder → permission matrix → invariant editor. One at a time.
4. **Layer 4 — Engine:** In-browser derivation preview. CodeMirror panels for YAML/SQL/TypeScript output. Structural verification.

### Phase 2: Kernel Standalone (future)

Rust, no Studio needed. Read YAML, compile, serve API. Test with hand-written YAML files.

### Phase 3: Connect Them (future)

Run both locally. Studio writes `model.yaml`. Kernel watches and hot-reloads. Studio shows "Live API" panel hitting running Kernel.

### Phase 4: Verification Integration (future)

Z3 WASM for in-browser SMT solving, or a verification service the Studio calls.

---

## Keyboard Shortcuts

Wire these from day one:

| Shortcut | Action |
|----------|--------|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+S` | Save model |
| `Cmd+K` | Command palette |
| `Cmd+B` | Toggle sidebar |
| `Cmd+J` | Toggle bottom panel |

---

## Auto-Save

The project layout watches model changes and saves to storage after 1 second of inactivity (debounced). Dirty state tracked in model store.

---

## Code Style Rules

- **Tailwind first.** No `<style>` blocks. Use utility classes in templates.
- **Biome** for all linting and formatting. No ESLint, no Prettier.
- **Effect.ts** for all model operations and validation. No raw try/catch for model logic.
- **Svelte stores** for reactive state. `writable`, `derived`, `readable` from `svelte/store`.
- **No barrel re-exports of components.** Import Svelte components directly from their file. Barrel exports (`index.ts`) only for TypeScript modules (`lib/model/`, `lib/engine/`, `lib/theme/`).
- **File naming:** PascalCase for Svelte components (`FieldTypeEditor.svelte`), kebab-case for TypeScript modules (`derive-types.ts`), kebab-case for routes (SvelteKit convention).

---

## What NOT to Build Yet

- Auth, org management, billing, user invitations
- Hosted/cloud infrastructure
- Real-time collaboration (Yjs) — design for it, don't build it
- Charting/analytics
- Rich text editor
- Data table library
- The Rust kernel (it's a separate repo and separate phase)

---

## Inspirations and Comparisons

- **Stately.ai** — visual state machine editor with XState code sync. Ecrous goes further: state machines are one part of a complete data model, not the whole product.
- **Strapi** — content type builder with visual UI. Ecrous generates more (APIs, migrations, SDKs, not just CRUD).
- **Windmill.dev** — "code is source of truth, UI is editor" philosophy. Ecrous applies this to data models instead of scripts.
- **Django** — target ergonomics level. Define once, get admin + ORM + migrations + auth. Ecrous aims for the same DX but via visual editing + formal verification.

---

## Formal Verification Roadmap (Future)

Three verification backends planned:

1. **Z3 (SMT solver)** — constraint solving. "Can these invariants ever contradict?" "Is this guard satisfiable?"
2. **TLA+ (behavioral verification)** — "Can this lifecycle reach a deadlock?" "Is this state machine fair?"
3. **Alloy (structural analysis)** — "Are these relationships consistent?" "Can this permission model lead to privilege escalation?"

These would provide real-time feedback in the visual editor. Start with TypeScript structural checks, add Z3 WASM later.

---

## Previous Scaffold Issues (Don't Repeat)

The first scaffold attempt had these problems:

1. **Raw CSS instead of Tailwind** — every component had `<style>` blocks with custom CSS. Should be Tailwind utility classes throughout.
2. **No Biome** — no linting or formatting configured.
3. **Empty directories** — `lib/engine/`, `lib/theme/`, `ui/editors/`, `ui/primitives/`, `static/fonts/` were created but never populated.
4. **Conversation compaction** — the original intentions for empty directories were lost mid-conversation. This CLAUDE.md now documents what each directory should contain.

When scaffolding, ensure every created directory has actual content, even if it's minimal starter implementations.
