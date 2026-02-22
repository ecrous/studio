import { getContext, setContext } from "svelte";
import type { Model } from "$lib/model";

const MODEL_KEY = Symbol("model");
const NAV_KEY = Symbol("navigation");

export interface ModelContext {
	model: Model;
	isDirty: boolean;
	save: () => void;
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
}

export interface NavigationContext {
	org: string;
	project: string;
	currentEntity: string | null;
	sidebarOpen: boolean;
	bottomPanelOpen: boolean;
	toggleSidebar: () => void;
	toggleBottomPanel: () => void;
	selectEntity: (name: string) => void;
}

export function setModelContext(ctx: ModelContext) {
	setContext(MODEL_KEY, ctx);
}

export function getModelContext(): ModelContext {
	return getContext(MODEL_KEY);
}

export function setNavigationContext(ctx: NavigationContext) {
	setContext(NAV_KEY, ctx);
}

export function getNavigationContext(): NavigationContext {
	return getContext(NAV_KEY);
}
