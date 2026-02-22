<script lang="ts">
import { CheckCircle, FileCode, Terminal } from "lucide-svelte";

let activeTab = $state<"yaml" | "verify" | "terminal">("yaml");

const tabs = [
	{ id: "yaml" as const, label: "YAML", icon: FileCode },
	{ id: "verify" as const, label: "Verify", icon: CheckCircle },
	{ id: "terminal" as const, label: "Terminal", icon: Terminal },
];
</script>

<div class="flex h-full flex-col border-t border-border bg-card">
	<div class="flex items-center gap-1 border-b border-border px-2">
		{#each tabs as tab}
			<button
				onclick={() => (activeTab = tab.id)}
				class="flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-colors
					{activeTab === tab.id
					? 'border-primary text-foreground'
					: 'border-transparent text-muted-foreground hover:text-foreground'}"
			>
				<tab.icon class="h-3.5 w-3.5" />
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="flex-1 overflow-auto p-3 font-mono text-sm">
		{#if activeTab === "yaml"}
			<pre class="text-muted-foreground">version: 1
system:
  name: demo
  ...</pre>
		{:else if activeTab === "verify"}
			<p class="text-muted-foreground">No issues found</p>
		{:else}
			<p class="text-muted-foreground">$ _</p>
		{/if}
	</div>
</div>
