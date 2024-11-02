// place files you want to import through the `$lib` alias in this folder.

import by_month_csv from "../../by-month.csv?raw";
import groups from "$lib/country-groups.json";

/**
 * @param {string} csv_string
 * @returns {{series: {data: number[], name: string}[], header: string[]}}
 */
function parse_csv(csv_string) {
	const data = csv_string.split("\n").map((row) => row.split(";"));
	/** @type {{data: number[], name: string}[]} */
	const series = [];
	for (let i = 1; i < data.length; i++) {
		series.push({
			data: data[i].slice(1).map((cell) => +cell),
			name: data[i][0],
		});
	}
	const header = /** @type {string[]} */ (data.shift());
	return { series, header };
}

const by_month_data = parse_csv(by_month_csv);
// by_month_data.header format looks like: 1998M04 meaning year 1998 and month April
const by_monts_split_header = by_month_data.header.slice(1).map((month) => month.split("M"));

const by_month_dates = by_monts_split_header.map((v) => {
	const year = +v[0];
	const month = +v[1];
	const date = new Date(year, month, 0);
	return date;
});
const by_quarter_dates = by_month_dates.filter((date) => date.getMonth() % 3 === 0);
const by_half_year_dates = by_month_dates.filter((date) => date.getMonth() % 6 === 0);
const by_year_dates = by_month_dates.filter((date) => date.getMonth() === 0);

/**
 * @param {{data: number[], name: string}} series
 * @param {number} period
 * @returns {{data: number[], name: string}}
 */
function aggregate_period_data(series, period) {
	if (period < 1) {
		throw new Error("Period cannot be less than 1");
	}
	if (period > 12) {
		throw new Error("Period cannot be greater than 12");
	}
	// Aggregate data by period
	const data = [];
	const first_month = by_month_dates[0].getMonth();
	const offset = first_month % period;
	// Skip partial period at start if needed
	const start = offset === 0 ? 0 : period - offset;
	for (let i = start; i < series.data.length; i += period) {
		const remaining = series.data.length - i;
		const slice_end = i + Math.min(period, remaining);
		const sum = series.data.slice(i, slice_end).reduce((a, b) => a + b, 0);
		const rounded = Math.round(sum * 100) / 100;
		data.push(rounded);
	}
	return { name: series.name, data };
}

/**
 * @param {string[]} individual_countries_list
 */
export function filter_data(
	individual_countries_list = ["Danmark", "Sambandsríki Amerika (USA)", "Kina", "Russland"],
) {
	const maps = get_maps(individual_countries_list);

	const months_data = filter_data_internal(by_month_data.series, by_month_data.header, maps);
	const quarters_data = {
		series: months_data.series.map((series) => aggregate_period_data(series, 3)),
		all_series: aggregate_period_data(months_data.all_series, 3),
	};
	const half_year_data = {
		series: months_data.series.map((series) => aggregate_period_data(series, 6)),
		all_series: aggregate_period_data(months_data.all_series, 6),
	};
	const years_data = {
		series: months_data.series.map((series) => aggregate_period_data(series, 12)),
		all_series: aggregate_period_data(months_data.all_series, 12),
	};

	return {
		months_data: {
			...months_data,
			dates: by_month_dates,
		},
		quarters_data: {
			...quarters_data,
			dates: by_quarter_dates,
		},
		half_year_data: {
			...half_year_data,
			dates: by_half_year_dates,
		},
		years_data: {
			...years_data,
			dates: by_year_dates,
		},
	};
}

/**
 * @param {{data: number[], name: string}[]} series
 * @param {string[]} header
 * @param {ReturnType<get_maps>} maps
 * @returns {{series: {data: number[], name: string}[], all_series: {data: number[], name: string}, header: string[]}}
 */
function filter_data_internal(series, header, maps) {
	const {
		individual_countries_map,
		nordics_map,
		europe_map,
		asia_map,
		africa_map,
		americas_map,
	} = maps;
	const individual_countries = series.filter((row) => individual_countries_map.has(row.name));
	const nordics = series.filter(
		(row) => nordics_map.has(row.name) && !individual_countries_map.has(row.name),
	);
	const europe = series.filter(
		(row) => europe_map.has(row.name) && !individual_countries_map.has(row.name),
	);
	const asia = series.filter(
		(row) => asia_map.has(row.name) && !individual_countries_map.has(row.name),
	);
	const africa = series.filter(
		(row) => africa_map.has(row.name) && !individual_countries_map.has(row.name),
	);
	const americas = series.filter(
		(row) => americas_map.has(row.name) && !individual_countries_map.has(row.name),
	);

	const nordics_group = sum_group(nordics, "Norðurlond");
	const europe_group = sum_group(europe, "Evropa");
	const asia_group = sum_group(asia, "Asia");
	const africa_group = sum_group(africa, "Afrika");
	const americas_group = sum_group(americas, "Amerika");
	const all_series = sum_group(series, "Tilsamans");

	return {
		header: structuredClone(header),
		series: [
			...individual_countries,
			nordics_group,
			europe_group,
			asia_group,
			africa_group,
			americas_group,
		],
		all_series,
	};
}

/**
 * @param {string[]} individual_countries_list
 */
function get_maps(individual_countries_list) {
	const individual_countries_map = new Map(
		individual_countries_list.map((country) => [country, true]),
	);
	const nordics_map = new Map(Object.entries(groups.nordics));
	const europe_map = new Map(Object.entries(groups.europe));
	const asia_map = new Map(Object.entries(groups["asia-middle-east-oceania"]));
	const africa_map = new Map(Object.entries(groups.africa));
	const americas_map = new Map(Object.entries(groups.americas));

	// return all maps
	return {
		individual_countries_map,
		nordics_map,
		europe_map,
		asia_map,
		africa_map,
		americas_map,
	};
}

/**
 * @param {{data: number[], name: string}[]} group
 * @param {string} name
 * @returns {{data: number[], name: string}}
 */
function sum_group(group, name) {
	const data = group.reduce((acc, row) => {
		for (let i = 0; i < row.data.length; i++) {
			acc[i] += row.data[i];
		}
		return acc;
	}, new Array(group[0].data.length).fill(0));

	data.forEach((value, i) => {
		data[i] = Math.round(value * 100) / 100;
	});
	return {
		data,
		name,
	};
}
