import { error } from "@sveltejs/kit";

export function load({ params }) {
	const { range } = params;
	if (range !== "months" && range !== "quarters" && range !== "half-year" && range !== "years") {
		return error(404);
	}
}
