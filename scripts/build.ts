import * as esbuild from "esbuild";

(async () => {
	for (const format of ["cjs", "esm"] as const) {
		await esbuild
			.build({
				entryPoints: ["./src/index.ts"],
				bundle: true,
				outdir: "dist",
				entryNames: "[dir]/[name]",
				outExtension: {
					".js": format === "esm" ? ".mjs" : ".js",
				},
				minify: true,
				sourcemap: "linked",
				treeShaking: true,
				target: "es2016",
				format,
				platform: "browser",
				logLevel: "info",
			})
			.catch(() => process.exit(1));
	}
})();
