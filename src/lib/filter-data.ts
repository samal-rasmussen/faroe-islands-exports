// place files you want to import through the `$lib` alias in this folder.

import by_month_csv from "$lib/by-month.csv?raw";
import groups from "$lib/country-groups.json5";

export type Serie = {
	data: number[];
	name: string;
};

function parse_csv(csv_string: string): {
	series: { data: number[]; name: string }[];
	header: string[];
} {
	const data = csv_string.split("\n").map((row) => row.split(";"));
	const series: { data: number[]; name: string }[] = [];
	for (let i = 1; i < data.length; i++) {
		series.push({
			data: data[i].slice(1).map((cell) => +cell),
			name: data[i][0],
		});
	}
	const raw_header = data.shift() as string[];
	const header = raw_header.slice(1);
	return { series, header };
}

const by_month_data = parse_csv(by_month_csv);
// by_month_data.header format looks like: 1998M04 meaning year 1998 and month April
const by_monts_split_header = by_month_data.header.map((month) => month.split("M"));
const by_month_dates = by_monts_split_header.map((v) => {
	const year = +v[0];
	const month = +v[1];
	const date = new Date(year, month, 0);
	return date;
});
const first_month = by_month_dates[0].getMonth();
const first_year = by_month_dates[0].getFullYear();
const by_quarter_dates = by_month_dates.filter((date) => date.getMonth() % 3 === 0);
const by_half_year_dates = by_month_dates.filter((date) => date.getMonth() % 6 === 0);
const by_year_dates = by_month_dates.filter((date) => date.getMonth() === 0);

function aggregate_period_data(
	series: { data: number[]; name: string },
	period: number,
): {
	data: number[];
	name: string;
	header: string[];
} {
	if (period !== 3 && period !== 6 && period !== 12) {
		throw new Error("Period must be 3, 6, or 12");
	}
	// Aggregate data by period
	const data: number[] = [];
	const header: string[] = [];
	const offset = first_month % period;
	// Skip partial period at start if needed
	const start = offset === 0 ? 0 : period - offset;
	for (let i = start; i < series.data.length; i += period) {
		const remaining = series.data.length - i;
		const slice_end = i + Math.min(period, remaining);
		const sum = series.data.slice(i, slice_end).reduce((a, b) => a + b, 0);
		const rounded = Math.round(sum * 100) / 100;
		data.push(rounded);
		if (period === 3) {
			const year = first_year + Math.floor(i / 12);
			const quarter = Math.floor((i % 12) / 3) + 1;
			header.push(`${year} Q${quarter}`);
		} else if (period === 6) {
			const year = first_year + Math.floor(i / 12);
			const half = Math.floor((i % 12) / 6) + 1;
			header.push(`${year} H${half}`);
		} else if (period === 12) {
			const year = first_year + Math.floor(i / 12);
			header.push(`${year}`);
		}
	}
	return { name: series.name, data, header };
}

/**
 * Creates a sliding window of the specified number of months
 */
function create_rolling_window_data(
	series: { data: number[]; name: string },
	months_window: number,
): {
	data: number[];
	name: string;
	header: string[];
} {
	if (months_window !== 3 && months_window !== 6 && months_window !== 12) {
		throw new Error("Window size must be 3, 6, or 12");
	}

	const data: number[] = [];
	const header: string[] = [];

	// Start from the end of the data and work backwards
	for (let i = series.data.length - months_window; i >= 0; i--) {
		const window_data = series.data.slice(i, i + months_window);
		const sum = window_data.reduce((a, b) => a + b, 0);
		const rounded = Math.round(sum * 100) / 100;
		// Insert at the beginning since we're working backwards
		data.unshift(rounded);

		// Create appropriate header
		const end_idx = i + months_window - 1;
		const start_date = by_month_dates[i];
		const end_date = by_month_dates[end_idx];
		const start_month = start_date.getMonth() + 1;
		const end_month = end_date.getMonth() + 1;
		const start_year = start_date.getFullYear();
		const end_year = end_date.getFullYear();

		const period_label = `${start_month}/${start_year}-${end_month}/${end_year}`;

		header.unshift(period_label);
	}

	return { name: series.name, data, header };
}

/**
 * Creates an aggregated view of the data for the last N months
 * @param {{data: number[], name: string}} series
 * @param {number} period
 * @returns {{data: number[], name: string, header: string[]}}
 */
function create_last_n_months_data(
	series: { data: number[]; name: string },
	period: number,
): {
	data: number[];
	name: string;
	header: string[];
} {
	if (period !== 3 && period !== 6 && period !== 12) {
		throw new Error("Period must be 3, 6, or 12");
	}

	const data: number[] = [];
	const header: string[] = [];

	// Process data in chunks starting from the end of the data
	for (let i = series.data.length; i >= period; i -= period) {
		const start_idx = i - period;
		const end_idx = i - 1;
		const chunk_data = series.data.slice(start_idx, i);
		const sum = chunk_data.reduce((a, b) => a + b, 0);
		const rounded = Math.round(sum * 100) / 100;

		// Insert at the beginning since we're working backwards
		data.unshift(rounded);

		// Create appropriate header
		const start_date = by_month_dates[start_idx];
		const end_date = by_month_dates[end_idx];
		const start_month = start_date.getMonth() + 1;
		const end_month = end_date.getMonth() + 1;
		const start_year = start_date.getFullYear();
		const end_year = end_date.getFullYear();

		const period_label = `${start_month}/${start_year}-${end_month}/${end_year}`;
		header.unshift(period_label);
	}

	return { name: series.name, data, header };
}

function filter_data_internal(
	series: Serie[],
	header: string[],
	maps: ReturnType<typeof get_maps>,
): {
	header: string[];
	series: Serie[];
	individual_series: Serie[];
	all_series: Serie;
} {
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
		individual_series: [
			...individual_countries,
			...nordics,
			...europe,
			...asia,
			...africa,
			...americas,
		],
		all_series,
	};
}

function get_maps(individual_countries_list: string[]) {
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

function sum_group(
	group: { data: number[]; name: string }[],
	name: string,
): {
	data: number[];
	name: string;
} {
	if (group.length === 0) {
		return {
			data: [],
			name,
		};
	}
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

interface Data {
	header: string[];
	series: Serie[];
	individual_series: Serie[];
	all_series: Serie;
}

interface DataWithDates extends Data {
	dates: Date[];
}

export async function filter_data(individual_countries_list: string[] = []): Promise<{
	months_data: DataWithDates;
	quarters_data: DataWithDates;
	half_year_data: DataWithDates;
	years_data: DataWithDates;
	rolling_3_months_data: DataWithDates;
	rolling_6_months_data: DataWithDates;
	rolling_12_months_data: DataWithDates;
	last_3_months_data: DataWithDates;
	last_6_months_data: DataWithDates;
	last_12_months_data: DataWithDates;
}> {
	return new Promise((resolve) => {
		const maps = get_maps(individual_countries_list);

		const months_data: Data = filter_data_internal(
			by_month_data.series,
			by_month_data.header,
			maps,
		);
		const quarters_data: Data = {
			header: aggregate_period_data(months_data.all_series, 3).header,
			series: months_data.series.map((series) => aggregate_period_data(series, 3)),
			individual_series: months_data.individual_series.map((series) =>
				aggregate_period_data(series, 3),
			),
			all_series: aggregate_period_data(months_data.all_series, 3),
		};
		const half_year_data: Data = {
			header: aggregate_period_data(months_data.all_series, 6).header,
			series: months_data.series.map((series) => aggregate_period_data(series, 6)),
			individual_series: months_data.individual_series.map((series) =>
				aggregate_period_data(series, 6),
			),
			all_series: aggregate_period_data(months_data.all_series, 6),
		};
		const years_data: Data = {
			header: aggregate_period_data(months_data.all_series, 12).header,
			series: months_data.series.map((series) => aggregate_period_data(series, 12)),
			individual_series: months_data.individual_series.map((series) =>
				aggregate_period_data(series, 12),
			),
			all_series: aggregate_period_data(months_data.all_series, 12),
		};

		// Create sliding window data for rolling averages
		const rolling_3_months_data: Data = {
			header: create_rolling_window_data(months_data.all_series, 3).header,
			series: months_data.series.map((series) => create_rolling_window_data(series, 3)),
			individual_series: months_data.individual_series.map((series) =>
				create_rolling_window_data(series, 3),
			),
			all_series: create_rolling_window_data(months_data.all_series, 3),
		};

		const rolling_6_months_data: Data = {
			header: create_rolling_window_data(months_data.all_series, 6).header,
			series: months_data.series.map((series) => create_rolling_window_data(series, 6)),
			individual_series: months_data.individual_series.map((series) =>
				create_rolling_window_data(series, 6),
			),
			all_series: create_rolling_window_data(months_data.all_series, 6),
		};

		const rolling_12_months_data: Data = {
			header: create_rolling_window_data(months_data.all_series, 12).header,
			series: months_data.series.map((series) => create_rolling_window_data(series, 12)),
			individual_series: months_data.individual_series.map((series) =>
				create_rolling_window_data(series, 12),
			),
			all_series: create_rolling_window_data(months_data.all_series, 12),
		};

		// Create data for last N months as fixed periods
		const last_3_months_data: Data = {
			header: create_last_n_months_data(months_data.all_series, 3).header,
			series: months_data.series.map((series) => create_last_n_months_data(series, 3)),
			individual_series: months_data.individual_series.map((series) =>
				create_last_n_months_data(series, 3),
			),
			all_series: create_last_n_months_data(months_data.all_series, 3),
		};

		const last_6_months_data: Data = {
			header: create_last_n_months_data(months_data.all_series, 6).header,
			series: months_data.series.map((series) => create_last_n_months_data(series, 6)),
			individual_series: months_data.individual_series.map((series) =>
				create_last_n_months_data(series, 6),
			),
			all_series: create_last_n_months_data(months_data.all_series, 6),
		};

		const last_12_months_data: Data = {
			header: create_last_n_months_data(months_data.all_series, 12).header,
			series: months_data.series.map((series) => create_last_n_months_data(series, 12)),
			individual_series: months_data.individual_series.map((series) =>
				create_last_n_months_data(series, 12),
			),
			all_series: create_last_n_months_data(months_data.all_series, 12),
		};

		// Create dates for rolling windows
		const rolling_3_months_dates = by_month_dates.slice(2).map((date, i) => {
			const new_date = new Date(date);
			return new_date;
		});

		const rolling_6_months_dates = by_month_dates.slice(5).map((date, i) => {
			const new_date = new Date(date);
			return new_date;
		});

		const rolling_12_months_dates = by_month_dates.slice(11).map((date, i) => {
			const new_date = new Date(date);
			return new_date;
		});

		// Create dates for last N months
		const create_last_n_months_dates = (period: number): Date[] => {
			const dates: Date[] = [];
			for (let i = by_month_dates.length; i >= period; i -= period) {
				const date = new Date(by_month_dates[i - 1]);
				dates.unshift(date);
			}
			return dates;
		};

		const last_3_months_dates = create_last_n_months_dates(3);
		const last_6_months_dates = create_last_n_months_dates(6);
		const last_12_months_dates = create_last_n_months_dates(12);

		resolve({
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
			rolling_3_months_data: {
				...rolling_3_months_data,
				dates: rolling_3_months_dates,
			},
			rolling_6_months_data: {
				...rolling_6_months_data,
				dates: rolling_6_months_dates,
			},
			rolling_12_months_data: {
				...rolling_12_months_data,
				dates: rolling_12_months_dates,
			},
			last_3_months_data: {
				...last_3_months_data,
				dates: last_3_months_dates,
			},
			last_6_months_data: {
				...last_6_months_data,
				dates: last_6_months_dates,
			},
			last_12_months_data: {
				...last_12_months_data,
				dates: last_12_months_dates,
			},
		});
	});
}
