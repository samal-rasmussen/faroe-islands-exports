import adapter from "@sveltejs/adapter-static";

const base = process.env.NODE_ENV === "production" ? "/faroe-islands-exports" : "";
console.log("svelte config base", base);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: "docs",
		}),
		paths: {
			base,
		},
	},
};

export default config;
