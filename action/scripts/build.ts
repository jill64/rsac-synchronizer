import { build } from 'esbuild'

await build({
  entryPoints: ['action/src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'action/dist/index.cjs'
})
