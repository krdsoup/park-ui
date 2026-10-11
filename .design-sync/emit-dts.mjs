#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
// Emit .d.ts for components/react/src/components/ui -> components/react/dist/types
// (gitignored). The design-sync converter reads component exports and props from
// a .d.ts tree; @park-ui/react ships TS source only, so this is its type build.
//
// dialog.tsx's ActionTrigger has an inferred type too long for tsc to serialize
// (TS7056), which drops dialog.d.ts entirely. Rather than edit the component,
// the compiler host injects an explicit annotation in memory. If the source line
// changes upstream this fails loudly - update PATCHES (or annotate upstream).
//
// Run from the repo root: node .design-sync/emit-dts.mjs
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(resolve('node_modules') + '/')
const ts = require('typescript')

// ts-morph resolves `styled-system/*` type imports through node_modules (it has
// no baseUrl), so expose the generated styled-system there.
const link = resolve('components/react/node_modules/styled-system')
if (!existsSync(link)) {
  mkdirSync(resolve('components/react/node_modules'), { recursive: true })
  symlinkSync(resolve('components/react/styled-system'), link, 'junction')
}

const PATCHES = [
  {
    file: resolve('components/react/src/components/ui/dialog.tsx'),
    find: 'export const ActionTrigger = forwardRef<HTMLButtonElement, ComponentProps<typeof StyledButton>>(',
    replace:
      "export const ActionTrigger: import('react').ForwardRefExoticComponent<Omit<ComponentProps<typeof StyledButton>, 'ref'> & import('react').RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, ComponentProps<typeof StyledButton>>(",
  },
]

const configPath = resolve('.design-sync/tsconfig.dts.json')
const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile)
if (error) throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'))
const parsed = ts.parseJsonConfigFileContent(config, ts.sys, resolve('.design-sync'))

rmSync(parsed.options.outDir, { recursive: true, force: true })

const host = ts.createCompilerHost(parsed.options)
const norm = (p) => resolve(p).toLowerCase()
const patchFor = new Map(PATCHES.map((p) => [norm(p.file), p]))
const applied = new Set()
const origGetSourceFile = host.getSourceFile
host.getSourceFile = (fileName, lang, onError, shouldCreate) => {
  const patch = patchFor.get(norm(fileName))
  if (!patch) return origGetSourceFile(fileName, lang, onError, shouldCreate)
  const text = ts.sys.readFile(fileName)
  if (!text.includes(patch.find)) {
    throw new Error(
      `emit-dts: patch target not found in ${fileName} - upstream changed; update PATCHES`,
    )
  }
  applied.add(norm(fileName))
  return ts.createSourceFile(fileName, text.replace(patch.find, patch.replace), lang)
}

const program = ts.createProgram(parsed.fileNames, parsed.options, host)
const result = program.emit(undefined, undefined, undefined, true)
const diags = result.diagnostics
for (const d of diags) {
  const where = d.file
    ? `${d.file.fileName}(${d.file.getLineAndCharacterOfPosition(d.start).line + 1}): `
    : ''
  console.error(`${where}TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`)
}
for (const p of PATCHES) {
  if (!applied.has(norm(p.file))) console.error(`emit-dts: patch for ${p.file} was never applied`)
}
if (diags.length || applied.size !== PATCHES.length) process.exit(1)
console.error(`emit-dts: wrote ${parsed.options.outDir}`)
