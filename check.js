import fs from "fs";

// Read and parse countries.json
const countriesData = JSON.parse(fs.readFileSync("./src/lib/countries.json", "utf8"));

// Read and parse country-groups.json
const countryGroupsData = JSON.parse(fs.readFileSync("./src/lib/country-groups.json", "utf8"));

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

console.log("Countries in countries.json but not in country-groups.json:", missingInCountryGroups);
console.log("Countries in country-groups.json but not in countries.json:", extraInCountryGroups);
