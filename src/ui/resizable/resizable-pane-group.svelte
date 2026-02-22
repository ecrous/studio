<script lang="ts">
import {
	PaneGroup,
	type PaneGroupProps,
	type PaneGroup as PaneGroupType,
} from "paneforge";
import { cn } from "$lib/utils.js";

let {
	ref = $bindable(null),
	this: paneGroup = $bindable(),
	class: className,
	...restProps
}: PaneGroupProps & {
	this?: PaneGroupType;
} = $props();
</script>

<PaneGroup
	bind:this={paneGroup}
	data-slot="resizable-pane-group"
	class={cn("flex h-full w-full data-[direction=vertical]:flex-col", className)}
	{...restProps}
/>
