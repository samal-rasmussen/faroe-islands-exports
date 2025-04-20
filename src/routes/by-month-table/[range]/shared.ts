export const ranges = ["months", "quarters", "half-year", "years"] as const;
export type Range = (typeof ranges)[number];
