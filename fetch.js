import { writeFileSync } from "fs";
import { are_countries_in_country_groups } from "./check.js";
import path from "path";
/**
 * @param {string} data
 * @returns {(number | string)[][]}
 */
const parse_csv = (data) => {
	// split the data into rows and then split the rows into columns
	let parsed = data.split("\n").map((row) =>
		// the data is separated by semicolons
		row.split(";").map((col) => col.replaceAll('"', "").trim()),
	);

	// Remove the first two columns
	const column_sliced = parsed.map((row) => row.slice(3));

	// Clear the first column of the first row
	column_sliced[0][0] = "";

	// Remove rows: Antarctica, Tilsamsns
	const dropped_second_row = column_sliced.filter(
		(row) => !["Antarktis", "Tilsamans"].includes(row[0]),
	);

	// Drop rows after the first column is "Bunkring til skip og flogfør"
	const end_rows_sliced = dropped_second_row.slice(
		0,
		dropped_second_row.findIndex((row) => row[0] === "Bunkring til skip og flogfør"),
	);

	// Replace "-" with 0
	const replaced = end_rows_sliced.map((row) => row.map((col) => (col === "-" ? 0 : col)));

	return replaced;
};

/**
 * @param {(number|string)[][]} data
 * @returns {(number|string)[][]}
 */
const pivot_data = (data) => {
	const headers = data[0];
	const rows = data.slice(1);

	// Initialize pivoted array with months as first column
	const pivoted = [["Month", ...rows.map((row) => row[0])]];

	// For each column (excluding the first which contains country names)
	for (let col = 1; col < headers.length; col++) {
		const month = headers[col];
		const values = rows.map((row) => row[col]);
		pivoted.push([month, ...values]);
	}

	return pivoted;
};

// fetch csv data from the API and write to files
const fetch_csv = async (url) => {
	const filename = path.join(process.cwd(), "src/lib/by-month.csv");

	const response = await fetch(url);
	if (!response.ok) {
		console.error(`Failed to fetch CSV from ${url}: ${response.status} ${response.statusText}`);
		process.exit(1);
	}
	const data = await response.text();
	const parsed = parse_csv(data);

	// Write original format
	const stringified = parsed.map((row) => row.join(";")).join("\n");
	writeFileSync(filename, stringified);

	// Write pivoted format
	const pivoted = pivot_data(parsed);
	const pivoted_stringified = pivoted.map((row) => row.join(";")).join("\n");
	writeFileSync(filename.replace(".csv", "-pivoted.csv"), pivoted_stringified);

	// write countries to a json file for mapping
	const countries = parsed.map((row) => row[0]).slice(1);
	const sorted_countries = countries.sort();
	const countries_map = sorted_countries.reduce((acc, country) => {
		acc[country] = country;
		return acc;
	}, {});
	writeFileSync(
		path.join(process.cwd(), "src/lib/countries.json"),
		JSON.stringify(countries_map, null, 4),
	);
};

/*
UH01026 Inn- og útflutningur skiftur á SITC-vørubólkar og land (1988M01-2025M02)
https://statbank.hagstova.fo/pxweb/fo/H2/H2__UH__UH01/uh_sitc_t.px/

Rák: Útflutningur
Mát: Virði
SITC: Tilsamans
Land: Vel alt
Mánaður: Vel alt

To new url for fetching CSV:
Select "Goym fyrispurning" on the left and select "Semikolonmarkað uttan yvirskrift"
*/
const by_month = "https://statbank.hagstova.fo:443/sq/36a691d8-4f32-4e0f-aa1e-a382067fca34";

fetch_csv(by_month);
const valid = are_countries_in_country_groups();
if (!valid) {
	console.error("Countries are not valid");
	process.exit(1);
}
