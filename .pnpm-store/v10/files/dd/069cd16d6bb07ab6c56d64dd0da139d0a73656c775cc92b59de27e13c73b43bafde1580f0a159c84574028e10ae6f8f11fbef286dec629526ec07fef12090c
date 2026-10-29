//#region src/config/preset.ts
function pluginOption(def, options = []) {
	const list = def(Array.isArray(options) ? options : []).filter(Boolean);
	if (typeof options === "function") return options(list);
	return list;
}
/**
* apply MDX processor presets
*/
function applyMdxPreset(options = {}) {
	return async (environment = "bundler") => {
		if (options.preset === "minimal") return options;
		const plugins = await import("fumadocs-core/mdx-plugins");
		const { valueToExport = [], rehypeCodeOptions, remarkImageOptions, remarkHeadingOptions, remarkStructureOptions, remarkCodeTabOptions, remarkNpmOptions, ...mdxOptions } = options;
		const remarkPlugins = pluginOption((v) => [
			plugins.remarkGfm,
			[plugins.remarkHeading, {
				generateToc: false,
				...remarkHeadingOptions
			}],
			remarkImageOptions !== false && [plugins.remarkImage, {
				...remarkImageOptions,
				useImport: remarkImageOptions?.useImport ?? environment === "bundler"
			}],
			"remarkCodeTab" in plugins && remarkCodeTabOptions !== false && [plugins.remarkCodeTab, remarkCodeTabOptions],
			"remarkNpm" in plugins && remarkNpmOptions !== false && [plugins.remarkNpm, remarkNpmOptions],
			...v,
			remarkStructureOptions !== false && [plugins.remarkStructure, {
				exportAs: "structuredData",
				...remarkStructureOptions
			}],
			valueToExport.length > 0 && (() => {
				return (_, file) => {
					file.data["mdx-export"] ??= [];
					for (const name of valueToExport) {
						if (!(name in file.data)) continue;
						file.data["mdx-export"].push({
							name,
							value: file.data[name]
						});
					}
				};
			})
		], mdxOptions.remarkPlugins);
		const rehypePlugins = pluginOption((v) => [
			rehypeCodeOptions !== false && [plugins.rehypeCode, rehypeCodeOptions],
			...v,
			plugins.rehypeToc
		], mdxOptions.rehypePlugins);
		return {
			...mdxOptions,
			outputFormat: environment === "runtime" ? "function-body" : mdxOptions.outputFormat,
			remarkPlugins,
			rehypePlugins
		};
	};
}
//#endregion
export { applyMdxPreset as t };
