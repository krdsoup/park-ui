# design-sync notes — @park-ui/react

Synced package: `components/react` (`@park-ui/react`). Claude Design renders React, so the Solid/Vue
packages are not synced. Target project: see `projectId` in config.json.

## Build setup (fresh clone)

- Package manager is bun (`packageManager: bun@1.3.6`). bun may not be installed globally — run it as
  `npx -y bun@1.3.6 ...`. On Windows the first `bun install` can fail in a `prepare` script with
  "Cannot read directory ../../node_modules ... used by another process" (file-lock race); re-running
  the install succeeds.
- Run `cfg.buildCmd` from the repo root before the converter. It does three things:
  1. `bun install --frozen-lockfile` (runs `panda codegen` via each package's `prepare`).
  2. `panda cssgen --config ../../.design-sync/panda.config.ts --outfile styled-system/styles.css` in
     components/react — Panda has no prebuilt stylesheet; this is the full static CSS (the repo config's
     `staticCss.recipes: '*'` + every class extracted from `src/**` + the sync's utility vocabulary and
     `fonts.code` token, see Fixes). It is `cfg.cssEntry`.
  3. `node .design-sync/emit-dts.mjs` — emits `.d.ts` for `src/components/ui` into
     `components/react/dist/types` (gitignored). The converter discovers exports/props from a .d.ts
     tree and the package ships TS source only. `components/react/package.json`
     `publishConfig.types` points the converter at it (inert: the package is private).
- `cfg.entry` is the TS source barrel (`src/components/ui/index.ts`); esbuild bundles it directly.
- Reference storybook: `cd components/react && npx storybook build -c .storybook -o <repo>/.design-sync/sb-reference`.

## Fixes (symptom → root cause → fix)

- [GENERAL] Every `styled-system/*` import unresolved in the bundle → esbuild 0.28 no longer resolves
  bare imports through tsconfig `baseUrl` (the repo relies on `baseUrl: "."`) → `.design-sync/tsconfig.json`
  maps `styled-system/*` and `@/components/ui` explicitly via `paths`; `cfg.tsconfig` points at it.
  (`@/components/ui` needs an exact entry: the converter's paths plugin would otherwise resolve the
  directory itself.)
- [GENERAL] Only 10 "components", all lucide icon names (Badge, Menu, Table...) → no .d.ts tree for the
  package, so the export scan saw only lucide/styled-system types → emit-dts.mjs + `publishConfig.types`.
- [GENERAL] Emitted `.d.ts` lost `styled-system/recipes` variant types (size/variant would be `any`) →
  ts-morph resolves type imports via node_modules, not baseUrl → emit-dts.mjs creates the junction
  `components/react/node_modules/styled-system -> ../styled-system`.
- dialog.d.ts missing (TS7056: `ActionTrigger`'s inferred type too long to serialize) → emit-dts.mjs
  injects an explicit annotation in memory (no source edit). Upstream fix: annotate `ActionTrigger` in
  `components/react/src/components/ui/dialog.tsx`; then drop the PATCHES entry.
- Toast story title doesn't match an export → `titleMap: {Toast: "Toaster"}`.
- [GENERAL] Every preview threw `withThemeByClassName is not a function` → `.storybook/preview.ts` uses
  `@storybook/addon-themes`, which the converter's storybook stub doesn't cover. The decorator is a no-op
  in light mode (theme class `''`). → `cfg.provider` = Ark UI `LocaleProvider locale="en-US"` (Ark's
  default locale, visually identical), which replaces the decorator bundle. Park UI needs no provider
  otherwise.
- Stories import components via `@/components/ui` (the barrel `src/components/ui/index.ts`), which the
  converter's barrel rule doesn't recognize → `storyImports.shim` routes it (and `styled-system/jsx`) to
  `window.ParkUI` so previews render the shipped bundle.
- Extra exports on `window.ParkUI` for the design agent (`cfg.extraEntries`): ark-ui `portal`,
  `collection`, `locale`, `carousel`, `file-upload` (Portal, createListCollection, useListCollection,
  useFilter, carousel/file-upload context hooks used by the examples) and `.design-sync/entries/extras.mjs`
  (lucide-react icons + Panda layout patterns from styled-system/jsx). lucide also exports
  Box/Square/Circle/Grid/Container icons; extras.mjs re-exports those names explicitly from Panda so they
  aren't dropped as ambiguous star exports (icons remain as BoxIcon etc.).
- Table stories are wider than a grid cell → `overrides.Table.cardMode: "column"`.
- [GENERAL] Panda style props silently unstyled in designs → Claude Design runs no Panda extraction, so a
  style prop only works if its class is already in the static CSS → `.design-sync/panda.config.ts` (the
  repo config + `staticCss.css` utility vocabulary: layout keywords, all spacing/color/type/radius/shadow
  token values, all colorPalettes). `buildCmd` runs `panda cssgen` with it. Stylesheet ≈ 890 KB.
- [GENERAL] Code/Kbd text rendered in the browser default font (serif in storybook's `lang="en"` iframe,
  sans in the `lang`-less preview on a ko-KR machine) → recipes use `fontFamily: 'code'`, a token the preset
  never defines (park-ui.com defines it as Roboto Mono) → `.design-sync/panda.config.ts` defines
  `fonts.code = {fonts.mono}`. Code/Kbd are graded `close` against storybook for this deliberate delta.
- DisplayValue `basic` story is `sb-error` "no storybook root content" → it returns a bare text node, which
  the capture harness reads as an empty root (both sides) → `overrides.DisplayValue.skip`.

## Decisions (user, 2026-10-11)

- Target: the existing project "Park UI Design System From GitHub" (re-adopted; it held a hand-written
  import from Claude Design's GitHub importer, not a design-sync upload). The sync replaces its old
  components (`components/<group>/<Name>.jsx|d.ts|prompt.md`, group `*.card.html`/`*.css`,
  `components/lib/*`, `components/components.css`, `components/core.css`), `tokens/*.css`, `styles.css`,
  `readme.md`. Keep: `guidelines/*.html` (21 hand-made pages; they use token names that exist in the real
  CSS) and `assets/*` (logos/favicon/OG). Remove: `ui_kits/website/*` (built on the old components),
  `SKILL.md`, `github.md`.
- Fonts: system font stacks, same as storybook. `[FONT_MISSING] "Cambria"` (Panda's default `--fonts-serif`
  system stack) accepted as a system substitute. park-ui.com's Outfit/Roboto Mono are not shipped.

## Known warnings (triaged — upstream, identical in the reference storybook)

- `[TOKENS_MISSING]` `--colors-border-emphasized`, `--colors-bg-default`: referenced by
  `packages/preset/src/recipes/color-picker.ts` but never defined by the preset. `--animate-from-y`,
  `--animate-to-y`, `--transform-origin`, `--track-color`, `--depth` are set at runtime by components.
- `[FONT_MISSING]` "Cambria": part of Panda's default `--fonts-serif` system stack (accepted, see Decisions).
  ("code" no longer fires since `fonts.code` is defined.)
- `[ASSETS_BLOCKED] shorturl.at`: `examples/tooltip/with-avatar.tsx` uses `https://shorturl.at/gaV8r`, which
  returns 403 to everyone - a dead upstream link, not a network sandbox (every other remote image loads).
- ScrollArea stories call `lorem-ipsum`, so their text differs on every render; grade on structure.

## Re-sync risks

- `emit-dts.mjs` PATCHES is tied to the exact `ActionTrigger` line in `dialog.tsx`; it fails loudly when
  upstream changes it.
- `.design-sync/tsconfig.json` hand-lists `styled-system/*` entry points; a new Panda output dir needs a line.
- `extras.mjs` resolves the lucide/Panda name clashes explicitly for Box/Square/Circle/Grid/Container; a new
  Panda pattern or lucide icon with a shared name would silently drop to undefined (ambiguous star export).
- `provider` is `LocaleProvider` purely to replace the unbundlable theme decorator; if `.storybook/preview.ts`
  gains real providers, distill them into `cfg.provider`.
- Verified at the default story cap (6 per component) except Button/Avatar/Dialog/Text (up to 12); tail
  stories of capped components (Dialog, Input, Menu, NumberInput, PinInput, Popover, Switch, Textarea,
  Tooltip, FileUpload, RatingGroup) are trusted, not individually graded.
- Accepted `close`: Code, Kbd (deliberate `fonts.code` fix vs. storybook's undefined-token fallback).
- Build assumed bun 1.3.6 via npx, esbuild 0.28 (no tsconfig `baseUrl` resolution), node 20, TypeScript 5.9.
- The reference storybook (`.design-sync/sb-reference`) must be rebuilt whenever components/stories change.
