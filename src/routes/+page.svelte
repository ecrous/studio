<script lang="ts">
import { onMount } from "svelte";
import { goto } from "$app/navigation";

onMount(() => {
	goto("/local/demo");
});
</script>

<div class="flex h-screen items-center justify-center bg-background">
	<p class="text-muted-foreground">Loading...</p>
</div>
