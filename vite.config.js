import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { json5Plugin } from "vite-plugin-json5";

const base = process.env.NODE_ENV === "production" ? "/faroe-islands-exports/" : "/";
console.log("vite config base", base);

export default defineConfig({
	plugins: [sveltekit(), json5Plugin()],
	base,
});
