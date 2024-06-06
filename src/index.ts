import esbuild = require("esbuild");
import fs = require("fs");
import { compile as sCompile } from "surplus/compiler";

const tsxOpts: esbuild.TransformOptions = { loader: "tsx", jsx: "preserve" };

export const surplusEsbuild: esbuild.Plugin = {
    name: "surplus-esbuild",
    setup(build) {
        // for .jsx files
        build.onLoad({ filter: /\.jsx$/i }, async ({ path }) => {
            const content = await fs.promises.readFile(path, 'utf8');
            const compiled = sCompile(content) as string;

            return { contents: compiled };
        });

        // for .tsx files
        build.onLoad({ filter: /\.tsx$/i }, async ({ path }) => {
            const content = await fs.promises.readFile(path, 'utf8');
            const transformed = await esbuild.transform(content, tsxOpts);
            const compiled = sCompile(transformed.code) as string;

            return {
                contents: compiled,
                warnings: transformed.warnings,
            };
        });
    },
};
