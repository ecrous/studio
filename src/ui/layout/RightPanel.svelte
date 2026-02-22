<script lang="ts">
import { Info } from "lucide-svelte";
import { getNavigationContext } from "$lib/stores/context";

const nav = getNavigationContext();
</script>

<aside class="flex h-full flex-col border-l border-border bg-card">
	<div class="flex items-center justify-between border-b border-border px-3 py-2">
		<span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
			Properties
		</span>
	</div>

	<div class="flex flex-1 flex-col items-center justify-center p-4 text-center">
		<Info class="mb-2 h-8 w-8 text-muted-foreground/50" />
		<p class="text-sm text-muted-foreground">
			{#if nav.currentEntity}
				Select a field to view properties
			{:else}
				Select an entity to begin
			{/if}
		</p>
	</div>
</aside>
