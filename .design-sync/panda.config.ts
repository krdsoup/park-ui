// Sync-only Panda config: the repo's components/react config plus a static
// utility vocabulary. Claude Design runs no Panda extraction, so a style prop
// only works when its class already exists in the shipped stylesheet. This
// pre-generates the token-valued utilities a design agent reaches for (layout,
// spacing, color, type, radius, shadow) so <Stack gap="6"> or <Box bg="gray.2">
// resolve. Run from components/react:
//   panda cssgen --config ../../.design-sync/panda.config.ts --outfile styled-system/styles.css
import { defineConfig } from '@pandacss/dev'
import base from '../components/react/panda.config'

const all = ['*']
export default defineConfig({
  ...base,
  // The preset's code/kbd recipes use fontFamily 'code', a token the preset
  // never defines - consuming apps must (park-ui.com sets Roboto Mono). Without
  // it the browser default font renders. Map it to Panda's mono stack.
  theme: {
    extend: {
      tokens: {
        fonts: {
          code: { value: '{fonts.mono}' },
        },
      },
    },
  },
  staticCss: {
    ...base.staticCss,
    css: [
      {
        properties: {
          colorPalette: all,
          // layout
          display: [
            'none',
            'block',
            'inline',
            'inline-block',
            'flex',
            'inline-flex',
            'grid',
            'inline-grid',
            'contents',
          ],
          flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'],
          flexWrap: ['wrap', 'nowrap'],
          alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
          justifyContent: [
            'flex-start',
            'center',
            'flex-end',
            'space-between',
            'space-around',
            'space-evenly',
          ],
          alignSelf: ['flex-start', 'center', 'flex-end', 'stretch'],
          flex: ['1', 'none', 'auto'],
          flexShrink: ['0', '1'],
          gridTemplateColumns: [
            'repeat(2, minmax(0, 1fr))',
            'repeat(3, minmax(0, 1fr))',
            'repeat(4, minmax(0, 1fr))',
          ],
          position: ['relative', 'absolute', 'fixed', 'sticky'],
          overflow: ['hidden', 'auto', 'scroll', 'visible'],
          textAlign: ['left', 'center', 'right'],
          width: ['full', 'auto', 'fit-content'],
          height: ['full', 'auto', 'fit-content'],
          minHeight: ['100vh', 'full'],
          maxWidth: [
            'sm',
            'md',
            'lg',
            'xl',
            '2xl',
            '3xl',
            '4xl',
            '5xl',
            '6xl',
            '7xl',
            '8xl',
            'prose',
            'full',
          ],
          // spacing (all spacing tokens)
          gap: all,
          rowGap: all,
          columnGap: all,
          padding: all,
          paddingInline: all,
          paddingBlock: all,
          paddingTop: all,
          paddingBottom: all,
          paddingLeft: all,
          paddingRight: all,
          margin: all,
          marginInline: all,
          marginBlock: all,
          marginTop: all,
          marginBottom: all,
          marginLeft: all,
          marginRight: all,
          // color (all color tokens + semantic tokens)
          color: all,
          background: all,
          borderColor: all,
          // type, shape, elevation
          textStyle: all,
          fontWeight: all,
          fontSize: all,
          lineHeight: all,
          borderRadius: all,
          borderWidth: ['0', '1px', '2px'],
          boxShadow: all,
        },
      },
    ],
  },
})
