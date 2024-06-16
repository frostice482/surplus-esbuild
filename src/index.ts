import esbuild = require("esbuild");
import fs = require("fs");
import { compile as sCompile } from "surplus/compiler";

export const surplusEsbuild: esbuild.Plugin = {
    name: "surplus-esbuild",
    setup(build) {
        build.initialOptions.sourcemap
        // for .jsx files
        build.onLoad({ filter: /\.jsx$/i }, async ({ path }) => {
            const content = await fs.promises.readFile(path, 'utf8');
            const compiled = sCompile(content) as string;

            return {
                contents: compiled,
                loader: 'js'
            };
        });

        // for .tsx files
        build.onLoad({ filter: /\.tsx$/i }, async ({ path }) => {
            const content = await fs.promises.readFile(path, 'utf8');
            const transformed = await esbuild.transform(content, {
                loader: 'tsx',
                jsx: 'preserve',
                jsxFactory: 'Surplus'     
            });
            const compiled = sCompile(transformed.code) as string;

            return {
                loader: 'js',
                contents: compiled,
                warnings: transformed.warnings,
            };
        });
    },
};
