import { error } from "@sveltejs/kit";

export function load({ params }) {
	const { range } = params;
	if (range !== "months" && range !== "quarters") {
		return error(404);
	}
}
