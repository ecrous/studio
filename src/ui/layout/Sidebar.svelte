<script lang="ts">
import { Settings } from "lucide-svelte";
import { getModelContext, getNavigationContext } from "$lib/stores/context";
import { icons } from "$lib/theme";

const model = getModelContext();
const nav = getNavigationContext();

const EntityIcon = icons.entity;
</script>

<aside class="flex h-full flex-col border-r border-border bg-sidebar">
	<div class="flex items-center justify-between border-b border-border px-3 py-2">
		<span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
			Entities
		</span>
	</div>

	<nav class="flex-1 overflow-y-auto p-2">
		{#each Object.keys(model.model.entities) as entityName}
			<button
				onclick={() => nav.selectEntity(entityName)}
				class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
					{nav.currentEntity === entityName
					? 'bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
			>
				<EntityIcon class="h-4 w-4" />
				{entityName}
			</button>
		{/each}
	</nav>

	<div class="border-t border-border p-2">
		<a
			href="/{nav.org}/{nav.project}/system"
			class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
		>
			<Settings class="h-4 w-4" />
			System
		</a>
	</div>
</aside>
