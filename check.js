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

	// Flatten the country-groups.json data into a single array of country names
	const countryGroupsCountries = Object.values(countryGroupsData).flatMap((group) => {
		return Object.keys(group);
	});

	// Get the list of countries from countries.json
	const countriesList = Object.values(countriesData);

	// Find countries in countries.json that are not in country-groups.json
	const missingInCountryGroups = countriesList.filter(
		(country) => !countryGroupsCountries.includes(country),
	);

	// Find countries in country-groups.json that are not in countries.json
	const extraInCountryGroups = countryGroupsCountries.filter(
		(country) => !countriesList.includes(country),
	);

	const result = true;

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

	return result;
}
