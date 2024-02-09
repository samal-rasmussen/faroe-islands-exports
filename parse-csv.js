import { readFileSync } from "fs";

const by_month = "by_month.csv";
const by_quarter = "by_quarter.csv";
const by_year = "by_year.csv";

// parse csv data
const parse_csv = (filename) => {
  const data = readFileSync(filename, "utf-8");
  // split the data into rows and then split the rows into columns
  let parsed = data.split("\n").map((row) =>
    // the data is separated by semicolons
    row.split(";").map((col) => col.replaceAll('"', "").trim())
  );
  //   // Remove the first row
  //   parsed.shift();
  // Remove the last row
  //   parsed.pop();

  //   // Remove the first two columns
  //   const sliced = parsed.map((row) => row.slice(2));
  //   while (true) {
  //     // if last column is ".." then remove it
  //     if (sliced[sliced.length - 1][sliced[0].length - 1] === "..") {
  //       sliced.map((row) => row.pop());
  //     } else {
  //       break;
  //     }
  //   }

  //   // Replace "-" with 0
  //   const replaced = sliced.map((row) =>
  //     row.map((col) => (col === "-" ? 0 : col))
  //   );

  debugger;
  //   console.log first column of each row
  parsed.map((row) => console.log(row[0]));

  return parsed;
};

// parse the csv files
const month_data = parse_csv(by_month);
// const quarter_data = parse_csv(by_quarter);
// const year_data = parse_csv(by_year);
