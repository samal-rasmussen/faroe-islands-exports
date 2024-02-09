// place files you want to import through the `$lib` alias in this folder.

import by_month_csv from "../../by-month.csv?raw";

const by_month_data_obj = by_month_csv.split("\n").map((row) => row.split(";"));
// parse cells to numbers
by_month_data_obj.slice(1).forEach((row, i) => {
  row.forEach((cell, j) => {
    if (i > 0 && j > 0) {
      row[j] = /** @type {any} */ (+cell);
    }
  });
});

export function get_by_month_data() {
  return structuredClone(by_month_data_obj);
}
