<script lang="ts">
import type { Model } from "$lib/model";
import { setModelContext, setNavigationContext } from "$lib/stores/context";
import { BottomPanel, RightPanel, Sidebar, TopBar } from "$ui/layout";
import * as Resizable from "$ui/resizable";

let { data, children } = $props();

let sidebarOpen = $state(true);
let bottomPanelOpen = $state(true);
let currentEntity = $state<string | null>("Order");

const demoModel: Model = {
	version: 1,
	system: {
		name: "demo",
		database: "postgres",
		auth: true,
		roles: ["admin", "manager", "user"],
		tenancy: { enabled: false },
	},
	entities: {
		Order: {
			fields: {
				email: { type: "email", required: true },
				total: { type: "currency", min: 0 },
				notes: { type: "text" },
			},
			lifecycles: {
				payment: {
					initial: "pending",
					states: ["pending", "authorized", "captured", "refunded"],
					transitions: [
						{ from: "pending", to: "authorized" },
						{ from: "authorized", to: "captured" },
						{ from: "captured", to: "refunded" },
					],
				},
				fulfillment: {
					initial: "unfulfilled",
					states: ["unfulfilled", "processing", "shipped", "delivered"],
					transitions: [
						{ from: "unfulfilled", to: "processing" },
						{ from: "processing", to: "shipped" },
						{ from: "shipped", to: "delivered" },
					],
				},
			},
			relationships: {
				customer: { kind: "belongs_to", target: "Customer" },
			},
			permissions: {
				create: ["admin", "manager"],
				read: ["admin", "manager", "user"],
				update: ["admin"],
				delete: ["admin"],
			},
		},
		Customer: {
			fields: {
				name: { type: "text", required: true },
				email: { type: "email", required: true },
				phone: { type: "text" },
			},
			relationships: {
				orders: { kind: "has_many", target: "Order" },
			},
		},
		Product: {
			fields: {
				name: { type: "text", required: true },
				price: { type: "currency", min: 0, required: true },
				sku: { type: "text", required: true },
				active: { type: "boolean" },
			},
		},
	},
};

setModelContext({
	model: demoModel,
	isDirty: false,
	save: () => console.log("save"),
	undo: () => console.log("undo"),
	redo: () => console.log("redo"),
	canUndo: false,
	canRedo: false,
});

setNavigationContext({
	get org() {
		return data.org;
	},
	get project() {
		return data.project;
	},
	get currentEntity() {
		return currentEntity;
	},
	get sidebarOpen() {
		return sidebarOpen;
	},
	get bottomPanelOpen() {
		return bottomPanelOpen;
	},
	toggleSidebar: () => (sidebarOpen = !sidebarOpen),
	toggleBottomPanel: () => (bottomPanelOpen = !bottomPanelOpen),
	selectEntity: (name: string) => (currentEntity = name),
});

function handleKeydown(e: KeyboardEvent) {
	if (e.metaKey || e.ctrlKey) {
		if (e.key === "b") {
			e.preventDefault();
			sidebarOpen = !sidebarOpen;
		} else if (e.key === "j") {
			e.preventDefault();
			bottomPanelOpen = !bottomPanelOpen;
		}
	}
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex h-screen flex-col overflow-hidden bg-background">
	<TopBar />

	<Resizable.PaneGroup direction="vertical" class="flex-1">
		<Resizable.Pane defaultSize={75} minSize={30}>
			<Resizable.PaneGroup direction="horizontal">
				{#if sidebarOpen}
					<Resizable.Pane defaultSize={15} minSize={10} maxSize={25}>
						<Sidebar />
					</Resizable.Pane>
					<Resizable.Handle withHandle />
				{/if}

				<Resizable.Pane defaultSize={sidebarOpen ? 60 : 75} minSize={30}>
					{@render children()}
				</Resizable.Pane>

				<Resizable.Handle withHandle />

				<Resizable.Pane defaultSize={25} minSize={15} maxSize={40}>
					<RightPanel />
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>

		{#if bottomPanelOpen}
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={25} minSize={15} maxSize={50}>
				<BottomPanel />
			</Resizable.Pane>
		{/if}
	</Resizable.PaneGroup>
</div>
