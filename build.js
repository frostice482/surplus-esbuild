//@ts-check
require('esbuild').build({
    entryPoints: ['src/**/*'],
    outdir: 'dist',

    format: 'cjs',
    platform: 'node',
    //bundle: true,
    //minify: true,

    tsconfig: 'tsconfig.json',
    packages: 'external'
})
