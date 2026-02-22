<script lang="ts">
import {
	Command,
	PanelBottom,
	PanelLeft,
	Redo2,
	Save,
	Undo2,
} from "lucide-svelte";
import { getModelContext, getNavigationContext } from "$lib/stores/context";
import { Button } from "$ui/button";

const model = getModelContext();
const nav = getNavigationContext();
</script>

<header class="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
	<div class="flex items-center gap-4">
		<button
			onclick={nav.toggleSidebar}
			class="flex items-center gap-2 text-muted-foreground hover:text-foreground"
		>
			<PanelLeft class="h-4 w-4" />
		</button>
		<div class="flex items-center gap-2">
			<span class="font-mono text-sm font-semibold text-primary">ecrous</span>
			<span class="text-muted-foreground">/</span>
			<span class="text-sm text-muted-foreground">{nav.org}</span>
			<span class="text-muted-foreground">/</span>
			<span class="text-sm">{nav.project}</span>
		</div>
	</div>

	<div class="flex items-center gap-1">
		<Button variant="ghost" size="icon" onclick={model.undo} disabled={!model.canUndo}>
			<Undo2 class="h-4 w-4" />
		</Button>
		<Button variant="ghost" size="icon" onclick={model.redo} disabled={!model.canRedo}>
			<Redo2 class="h-4 w-4" />
		</Button>
		<div class="mx-2 h-4 w-px bg-border"></div>
		<Button variant="ghost" size="icon" onclick={model.save} disabled={!model.isDirty}>
			<Save class="h-4 w-4" />
		</Button>
		<div class="mx-2 h-4 w-px bg-border"></div>
		<Button variant="ghost" size="sm" class="gap-2 text-muted-foreground">
			<Command class="h-3 w-3" />
			<span class="text-xs">K</span>
		</Button>
		<button
			onclick={nav.toggleBottomPanel}
			class="ml-2 text-muted-foreground hover:text-foreground"
		>
			<PanelBottom class="h-4 w-4" />
		</button>
	</div>
</header>
