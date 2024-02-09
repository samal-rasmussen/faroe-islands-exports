// place files you want to import through the `$lib` alias in this folder.

import by_month_csv from "../../by-month.csv?raw";
import groups from "$lib/country-groups.json";

const by_month_data = by_month_csv.split("\n").map((row) => row.split(";"));
// parse cells to numbers
by_month_data.forEach((row, i) => {
  row.forEach((cell, j) => {
    if (i > 0 && j > 0) {
      row[j] = /** @type {any} */ (+cell);
    }
  });
});

const header = /** @type {string[]} */ (by_month_data.shift());

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

export function filter_months_data(
  individual_countries_list = [
    "Danmark",
    "Sambandsríki Amerika (USA)",
    "Kina",
    "Russland",
  ]
) {
  const individual_countries_map = new Map(
    individual_countries_list.map((country) => [country, true])
  );
  const nordics_map = new Map(Object.entries(groups.nordics));
  const europe_map = new Map(Object.entries(groups.europe));
  const asia_map = new Map(Object.entries(groups["asia-middle-east-oceania"]));
  const africa_map = new Map(Object.entries(groups.africa));
  const americas_map = new Map(Object.entries(groups.americas));

  const individual_countries = by_month_data.filter((row) =>
    individual_countries_map.has(row[0])
  );
  const nordics = by_month_data.filter(
    (row) => nordics_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const europe = by_month_data.filter(
    (row) => europe_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const asia = by_month_data.filter(
    (row) => asia_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const africa = by_month_data.filter(
    (row) => africa_map.has(row[0]) && !individual_countries_map.has(row[0])
  );
  const americas = by_month_data.filter(
    (row) => americas_map.has(row[0]) && !individual_countries_map.has(row[0])
  );

  const nordics_summed = sum_group(nordics, "Norðurlond");
  const europe_summed = sum_group(europe, "Evropa");
  const asia_summed = sum_group(asia, "Asia");
  const africa_summed = sum_group(africa, "Afrika");
  const americas_summed = sum_group(americas, "Amerika");

  const split_header = header.slice(1).map((month) => month.split(" "));
  const dates = split_header.map((v) => {
    const year = +v[0];
    const month = /** @type {keyof months} */ (v[1]);
    const date = new Date(year, months[month], 0);
    return date;
  });

  return {
    dates,
    header: structuredClone(header),
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
 * @param {string[][]} group
 * @param {string} name
 */
function sum_group(group, name) {
  const reduced = group.reduce((acc, row) => {
    for (let i = 1; i < row.length; i++) {
      acc[i] += row[i];
    }
    return acc;
  }, new Array(header.length).fill(0));

  reduced.forEach((value, i) => {
    reduced[i] = Math.round(value * 100) / 100;
  });
  reduced[0] = name;
  return reduced;
}
