// place files you want to import through the `$lib` alias in this folder.

import by_month_csv from "../../by-month.csv?raw";
import by_quarter_csv from "../../by-quarter.csv?raw";
import groups from "$lib/country-groups.json";

/**
 * @param {string} csv_string
 * @returns {{data: string[][], header: string[]}}
 */
function parse_csv(csv_string) {
  const data = csv_string.split("\n").map((row) => row.split(";"));
  data.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (i > 0 && j > 0) {
        row[j] = /** @type {any} */ (+cell);
      }
    });
  });

  const header = /** @type {string[]} */ (data.shift());
  return { header, data };
}

const by_month_data = parse_csv(by_month_csv);
const by_monts_split_header = by_month_data.header
  .slice(1)
  .map((month) => month.split(" "));
const months = /** @type { const} */ ({
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  Mai: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Okt: 10,
  Nov: 11,
  Des: 12,
});
const by_month_dates = by_monts_split_header.map((v) => {
  const year = +v[0];
  const month = /** @type {keyof months} */ (v[1]);
  const date = new Date(year, months[month], 0);
  return date;
});

const by_quarter_data = parse_csv(by_quarter_csv);
const by_quater_dates_split_header = by_quarter_data.header
  .slice(1)
  .map((quarter) => {
    var index = quarter.indexOf(" ");
    return [quarter.slice(0, index), quarter.slice(index + 1)];
  });
const quarters_to_months = /** @type { const} */ ({
  "1. ársfj.": 3,
  "2. ársfj.": 6,
  "3. ársfj.": 9,
  "4. ársfj.": 12,
});
const by_quarter_dates = by_quater_dates_split_header.map((v) => {
  const year = +v[0];
  const quarter = /** @type {keyof quarters_to_months} */ (v[1]);
  const date = new Date(year, quarters_to_months[quarter], 0);
  return date;
});

/**
 * @param {string[]} individual_countries_list
 */
export function filter_data(
  individual_countries_list = [
    "Danmark",
    "Sambandsríki Amerika (USA)",
    "Kina",
    "Russland",
  ]
) {
  const maps = get_maps(individual_countries_list);

  const filtered_months_data = filter_data_internal(
    by_month_data.data,
    by_month_data.header,
    maps
  );

  const filtered_quaters_data = filter_data_internal(
    by_quarter_data.data,
    by_quarter_data.header,
    maps
  );

  return {
    months_data: {
      ...filtered_months_data,
      dates: by_month_dates,
    },
    quarters_data: {
      ...filtered_quaters_data,
      dates: by_quarter_dates,
    },
  };
}

/**
 * @param {string[][]} data
 * @param {string[]} header
 * @param {ReturnType<get_maps>} maps
 * @returns
 */
function filter_data_internal(data, header, maps) {
  const {
    individual_countries_map,
    nordics_map,
    europe_map,
    asia_map,
    africa_map,
    americas_map,
  } = maps;
  const individual_countries = data.filter((row) =>
    individual_countries_map.has(row[0])
  );
  const nordics = data.filter(
    (row) => nordics_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const europe = data.filter(
    (row) => europe_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const asia = data.filter(
    (row) => asia_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const africa = data.filter(
    (row) => africa_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const americas = data.filter(
    (row) => americas_map.has(row[0]) && !individual_countries_map.has(row[0])
  );

  const nordics_summed = sum_group(nordics, "Norðurlond");
  const europe_summed = sum_group(europe, "Evropa");
  const asia_summed = sum_group(asia, "Asia");
  const africa_summed = sum_group(africa, "Afrika");
  const americas_summed = sum_group(americas, "Amerika");
  const all_summed = sum_group(data, "Tilsamans");

  return {
    header: structuredClone(header),
    all_summed,
    individual_countries,
    nordics,
    europe,
    asia,
    africa,
    americas,
    nordics_summed,
    europe_summed,
    asia_summed,
    africa_summed,
    americas_summed,
  };
}

/**
 * @param {string[]} individual_countries_list
 */
function get_maps(individual_countries_list) {
  const individual_countries_map = new Map(
    individual_countries_list.map((country) => [country, true])
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
 * @param {string[][]} group
 * @param {string} name
 */
function sum_group(group, name) {
  const reduced = group.reduce((acc, row) => {
    for (let i = 1; i < row.length; i++) {
      acc[i] += row[i];
    }
    return acc;
  }, new Array(group[0].length).fill(0));

  reduced.forEach((value, i) => {
    reduced[i] = Math.round(value * 100) / 100;
  });
  reduced[0] = name;
  return reduced;
}
