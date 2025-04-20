import { error } from "@sveltejs/kit";
import { ranges, type Range } from "./shared";

export function load({ params }) {
	const { range } = params;
	if (!ranges.includes(range as Range)) {
		return error(404);
	}
}
