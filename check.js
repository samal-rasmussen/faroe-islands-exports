import fs from "fs";
import JSON5 from "json5";

/**
 * Check if the countries in countries.json are present in country-groups.json
 * and vice versa.
 */
export function are_countries_in_country_groups() {
	// Read and parse countries.json
	const countriesData = JSON.parse(fs.readFileSync("./src/lib/countries.json", "utf8"));

	// Read and parse country-groups.json
	const countryGroupsFile = fs.readFileSync("./src/lib/country-groups.json5", "utf8");
	const countryGroupsData = JSON5.parse(countryGroupsFile);

	// Check for the same country appearing in multiple groups.
	// This should never happen, as each country should belong to exactly one group.
	const countryToGroups = new Map();
	for (const [groupName, groupCountries] of Object.entries(countryGroupsData)) {
		if (!groupCountries || typeof groupCountries !== "object") continue;

		for (const countryName of Object.keys(groupCountries)) {
			const groups = countryToGroups.get(countryName) ?? [];
			groups.push(groupName);
			countryToGroups.set(countryName, groups);
		}
	}

	const countriesInMultipleGroups = [...countryToGroups.entries()]
		.filter(([, groups]) => groups.length > 1)
		.map(([country, groups]) => ({ country, groups: groups.sort() }))
		.sort((a, b) => a.country.localeCompare(b.country));

	// Flatten the country-groups.json data into a single array of country names
	const countryGroupsCountries = Object.values(countryGroupsData).flatMap((group) => {
		return Object.keys(group);
	});

	// Get the list of countries from countries.json
	const countriesList = Object.values(countriesData);

	// Find countries in countries.json that are not in country-groups.json
	let missingInCountryGroups = countriesList.filter(
		(country) => !countryGroupsCountries.includes(country),
	);
	missingInCountryGroups = missingInCountryGroups.filter(
		(country) => country !== "Ikki nærri útgreinað lond og øki",
	);

	// Find countries in country-groups.json that are not in countries.json
	const extraInCountryGroups = countryGroupsCountries.filter(
		(country) => !countriesList.includes(country),
	);

	let result = true;

	if (missingInCountryGroups.length > 0) {
		console.log(
			"Countries in countries.json but not in country-groups.json:",
			missingInCountryGroups,
		);
		result = false;
	}

	if (extraInCountryGroups.length > 0) {
		console.log(
			"Countries in country-groups.json but not in countries.json:",
			extraInCountryGroups,
		);
		result = false;
	}

	if (countriesInMultipleGroups.length > 0) {
		console.log("Countries present in multiple country groups:");
		for (const { country, groups } of countriesInMultipleGroups) {
			console.log(`- ${country}: ${groups.join(", ")}`);
		}
		result = false;
	}

	return result;
}
