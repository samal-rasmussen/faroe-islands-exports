import { writeFileSync } from "fs";

const by_month =
  "https://statbank.hagstova.fo:443/sq/316e46d3-dd15-4cf7-bce2-c417253dc8ed";

const by_quarter =
  "https://statbank.hagstova.fo:443/sq/0f4568f2-b415-44c3-a920-de7d38fb3a2e";

const by_year =
  "https://statbank.hagstova.fo:443/sq/a195dbd5-b9c6-405a-922e-d592d8f21eb0";

/**
 * @param {string} data
 * @returns {(number | string)[][]}
 */
const parse_csv = (data) => {
  // split the data into rows and then split the rows into columns
  let parsed = data.split("\n").map((row) =>
    // the data is separated by semicolons
    row.split(";").map((col) => col.replaceAll('"', "").trim())
  );
  //   // Remove the first row
  //   parsed.shift();
  // Remove the last row
  parsed.pop();

  // Remove the first two columns
  const sliced = parsed.map((row) => row.slice(2));
  while (true) {
    // if last column is ".." then remove it
    if (sliced[sliced.length - 1][sliced[0].length - 1] === "..") {
      sliced.map((row) => row.pop());
    } else {
      break;
    }
  }

  // Replace "-" with 0
  const replaced = sliced.map((row) =>
    row.map((col) => (col === "-" ? 0 : col))
  );

  return replaced;
};

// fetch csv data from the API and write to files
const fetch_csv = async (url, filename) => {
  const response = await fetch(url);
  const data = await response.text();
  const parsed = parse_csv(data);
  const stringified = parsed.map((row) => row.join(";")).join("\n");
  writeFileSync(filename, stringified);
};

fetch_csv(by_month, "by_month.csv");
fetch_csv(by_quarter, "by_quarter.csv");
fetch_csv(by_year, "by_year.csv");
