// Extra exports merged onto window.ParkUI for the claude.ai/design agent:
// lucide-react icons (the icon set Park UI's examples use) and Panda's layout
// patterns from styled-system/jsx (Stack, HStack, Box, Grid...). One module so
// the names both export (lucide icons Box/Square/Circle/Grid/Container) resolve
// explicitly to the layout pattern; the icons stay reachable as BoxIcon etc.
export * from 'lucide-react'
export * from '../../components/react/styled-system/jsx/index.mjs'
export {
  Box,
  Circle,
  Container,
  Grid,
  Square,
} from '../../components/react/styled-system/jsx/index.mjs'
