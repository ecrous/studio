export const ssr = false;
export const prerender = false;

export function load({ params }) {
	return {
		org: params.org,
		project: params.project,
	};
}
