<script lang="ts">
import { getModelContext, getNavigationContext } from "$lib/stores/context";
import { icons } from "$lib/theme";

const nav = getNavigationContext();
const model = getModelContext();

const entity = $derived(
	nav.currentEntity ? model.model.entities[nav.currentEntity] : null,
);

const FieldIcon = icons.field;
const LifecycleIcon = icons.lifecycle;
const RelationshipIcon = icons.relationship;
</script>

<main class="flex h-full flex-col overflow-auto bg-background p-6">
	{#if nav.currentEntity && entity}
		<div class="mb-6">
			<h1 class="text-xl font-semibold">{nav.currentEntity}</h1>
			<p class="text-sm text-muted-foreground">Entity definition</p>
		</div>

		<div class="space-y-6">
			<section>
				<h2 class="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<FieldIcon class="h-4 w-4" />
					Fields
				</h2>
				<div class="rounded-lg border border-border bg-card">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border text-left text-xs text-muted-foreground">
								<th class="px-4 py-2 font-medium">Name</th>
								<th class="px-4 py-2 font-medium">Type</th>
								<th class="px-4 py-2 font-medium">Required</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(entity.fields) as [name, field]}
								<tr class="border-b border-border last:border-0 hover:bg-muted/50">
									<td class="px-4 py-2 font-mono">{name}</td>
									<td class="px-4 py-2">
										<span class="rounded bg-secondary px-1.5 py-0.5 text-xs">
											{field.type}
										</span>
									</td>
									<td class="px-4 py-2 text-muted-foreground">
										{field.required ? "Yes" : "No"}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			{#if entity.lifecycles && Object.keys(entity.lifecycles).length > 0}
				<section>
					<h2 class="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<LifecycleIcon class="h-4 w-4" />
						Lifecycles
					</h2>
					<div class="flex flex-wrap gap-2">
						{#each Object.keys(entity.lifecycles) as name}
							<a
								href="/{nav.org}/{nav.project}/lifecycle/{nav.currentEntity}/{name}"
								class="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary"
							>
								{name}
							</a>
						{/each}
					</div>
				</section>
			{/if}

			{#if entity.relationships && Object.keys(entity.relationships).length > 0}
				<section>
					<h2 class="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<RelationshipIcon class="h-4 w-4" />
						Relationships
					</h2>
					<div class="space-y-2">
						{#each Object.entries(entity.relationships) as [name, rel]}
							<div class="flex items-center gap-2 text-sm">
								<span class="font-mono">{name}</span>
								<span class="text-muted-foreground">-></span>
								<span class="rounded bg-secondary px-1.5 py-0.5 text-xs">{rel.kind}</span>
								<span class="text-muted-foreground">-></span>
								<span class="font-mono">{rel.target}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center">
			<p class="text-muted-foreground">Select an entity from the sidebar</p>
		</div>
	{/if}
</main>
