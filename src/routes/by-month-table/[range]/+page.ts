import { error } from "@sveltejs/kit";
import { ranges, type Range } from "./shared";
import type { EntryGenerator } from "./$types";

export function load({ params }) {
	const { range } = params;
	if (!ranges.includes(range as Range)) {
		return error(404);
	}
}

export const entries: EntryGenerator = () => {
	return [{ range: "months" }, { range: "quarters" }, { range: "half-year" }, { range: "years" }];
};
