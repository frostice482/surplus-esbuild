//@ts-check

const { context } = require('esbuild');

;(async() => {
    const ctx = await context({
        entryPoints: ['src/**/*'],
        outdir: 'dist',
    
        format: 'cjs',
        platform: 'node',
        
        tsconfig: 'tsconfig.json'
    })

    ctx.watch()
})()
