import { writeFileSync } from "fs";

// https://statbank.hagstova.fo/pxweb/fo/H2/H2__UH__UH01/uh_sitc_t.px/
const by_month = "https://statbank.hagstova.fo/sq/b2289d76-b001-424d-bae6-0ff473aa0097";

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

// fetch csv data from the API and write to files
const fetch_csv = async (url, filename) => {
	const response = await fetch(url);
	const data = await response.text();
	const parsed = parse_csv(data);
	const stringified = parsed.map((row) => row.join(";")).join("\n");
	writeFileSync(filename, stringified);

	// write first column to a file
	const countries = parsed.map((row) => row[0]).slice(1);
	const sorted_countries = countries.sort();
	const countries_map = sorted_countries.reduce((acc, country) => {
		acc[country] = country;
		return acc;
	}, {});
	writeFileSync("countries2.json", JSON.stringify(countries_map, null, 4));
};

fetch_csv(by_month, "by-month.csv");
