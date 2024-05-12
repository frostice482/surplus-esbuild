//@ts-check

const crypto = require('crypto')
const fsp = require('fs/promises')
const path = require('path')
const { build } = require('esbuild')

const source = 'src/index.ts'
const outFile = 'dist/index.js'

;(async() => {
    const out = path.dirname(outFile)
    const temp = crypto.randomBytes(8).toString('hex') + '.js'

    await build({
        entryPoints: [source],
        outfile: temp,

        format: 'cjs',
        platform: 'node',
        bundle: true,
        minify: true,

        tsconfig: 'tsconfig.json',
        packages: 'external'
    })
    
    await fsp.rm(out, { force: true, recursive: true })
    await fsp.mkdir(out, { recursive: true })
    await fsp.rename(temp, outFile)
})()
