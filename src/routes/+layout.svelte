<script lang="ts">
import "../app.css";
import { Toaster } from "$ui/sonner";

let { children } = $props();
</script>

<svelte:head>
	<title>Ecrous Studio</title>
	<meta name="description" content="Your system, visually" />
</svelte:head>

{@render children()}
<Toaster />
