import esbuild = require("esbuild");
import fs = require("fs");
import { compile as sCompile } from "surplus/compiler";

const surplusImportTest = /(?<=(?:;|^)\s*)import\s*\*\s*as\s+Surplus\s+from\s*(['"])surplus(\1)(?=\s*(?:;|$))/gm

export const surplusEsbuild = (opts?: SurplusPluginOptions): esbuild.Plugin => ({
	name: "surplus-esbuild",
	setup(build) {
		const isDebug = build.initialOptions.logLevel === 'debug'

		const {
			tsxSurplusImport: addImport = 'auto',
			tsxTransform = {},
			jsxFilter,
			tsxFilter
		} = opts ?? {}

		const tsxTransformOptions = Object.assign({
			loader: 'tsx',
			jsx: 'preserve',
			jsxFactory: 'Surplus'
		}, tsxTransform)

		function shouldAddImport(content: string, transformed: string) {
			return addImport !== 'never' // import should never be auto-added
				&& !surplusImportTest.test(transformed) // import is already added in transform
				&& (
					addImport === 'always' // always add import
					|| surplusImportTest.test(content) // auto-add import
				)
		}

		// for .jsx files
		build.onLoad({ filter: jsxFilter ?? /\.jsx$/i }, async ({ path }) => {
			const content = await fs.promises.readFile(path, 'utf8');
			const compiled = sCompile(content) as string;

			// logging
			if (isDebug) console.log(`Transformed ${path} (jsx) with surplus compiler`)

			return {
				contents: compiled,
				loader: 'js'
			};
		});

		// for .tsx files
		build.onLoad({ filter: tsxFilter ?? /\.tsx$/i }, async ({ path }) => {
			const content = await fs.promises.readFile(path, 'utf8');
			const { code: transformed, warnings } = await esbuild.transform(content, tsxTransformOptions);
			let compiled = sCompile(transformed) as string;

			// logging
			if (isDebug) console.log(`Transformed ${path} (tsx) with surplus compiler`)

			// adding surplus import
			if (shouldAddImport(compiled, transformed)) {
				if (isDebug) console.log(`Addded import for surplus`)
				compiled = 'import * as Surplus from "surplus";\n' + compiled;
			}

			return {
				loader: 'js',
				contents: compiled,
				warnings: warnings
			};
		});
	},
});

export interface SurplusPluginOptions {
	/**
	 * JSX filter, defaults to `/\.tsx$/i`
	 */
	jsxFilter?: RegExp

	/**
	 * TSX filter, defaults to `/\.tsx$/i`
	 */
	tsxFilter?: RegExp

	/**
	 * ESBuild transofrm options for TSX files, default properties:
	 * ```js
	 * loader: 'tsx'
	 * jsx: 'preserve'
	 * jsxFactory: 'Surplus'
	 * ```
	 */
	tsxTransform?: esbuild.TransformOptions

	/**
	 * Automatically adds Surplus import for TSX files (`import * as Surplus from 'surplus'`).
	 * - Always: always adds import on tsx files
	 * - Auto: adds import only if included in tsx files
	 * - Never: never adds import
	 */
	tsxSurplusImport: 'always' | 'auto' | 'never'
}
