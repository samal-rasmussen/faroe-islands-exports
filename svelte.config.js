import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: "docs",
		}),
		paths: {
			base: process.env.NODE_ENV === "production" ? "/faroe-islands-exports" : "",
		},
	},
};

export default config;
