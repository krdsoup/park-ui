## Park UI conventions (read before building)

**Setup.** Link `styles.css` once; it imports `_ds_bundle.css` (Panda CSS reset, every token, every component recipe). No provider is required: components are styled by class names. `LocaleProvider` (`locale="en-US"`) is optional and only changes date/number formatting. Dark mode: add the class `dark` to `<html>`; every token switches. Components, layout patterns, icons and the Ark helpers below are all on `window.ParkUI`.

**Components are compound.** Compose the parts: `Card.Root / Header / Title / Description / Body / Footer`, `Field.Root / Label / HelperText / ErrorText`, `Dialog.Root / Trigger / Backdrop / Positioner / Content / Header / Title / Body / Footer / CloseTrigger`. In the examples, overlay content (Dialog, Drawer, Popover, Menu, HoverCard) is wrapped in `<Portal>`. `Select` and `Combobox` take `collection={createListCollection({ items })}`. Toasts: render `<Toaster />` once, then call `toaster.create({ title, description })`. Copy the composition from `components/<group>/<Name>/<Name>.prompt.md`.

**Styling = Panda style props with token values.** Every component, and the layout patterns `Box Stack HStack VStack Flex Grid GridItem Center Container Wrap Divider Spacer`, accepts style props:
- Variants: `variant` (e.g. Button `solid | surface | subtle | outline | plain`) and `size` (per component, `2xs`–`2xl`; see its `.d.ts`).
- Color: `colorPalette="blue"` recolors a component. Palettes: `gray` (neutral) `amber blue bronze brown crimson cyan gold grass green indigo iris jade lime mauve mint olive orange pink plum purple red ruby sage sand sky slate teal tomato violet yellow`.
- Spacing: `gap p px py pt pb m mx my mt mb` take the spacing scale `0`–`12, 14, 16, 20, 24 … 96` (`1` = 0.25rem).
- `color` / `bg` / `borderColor`: semantic `fg.default fg.muted fg.subtle canvas border error colorPalette.solid.bg colorPalette.subtle.bg`, or scale steps `gray.1`–`gray.12`, `blue.9`, `blue.a3`.
- Type: `textStyle="xs | sm | md | lg | xl | 2xl … 9xl | label"`, `fontWeight="medium | semibold | bold"`. Shape: `borderRadius="l1 | l2 | l3 | sm | md | lg | full"`, `boxShadow="xs | sm | md | lg | xl"`. Layout keywords for `display`, `flexDirection`, `alignItems`, `justifyContent`, `flex="1"`, `width="full"`, `maxW="md"`.
- Only these token values exist in the stylesheet (designs run no Panda build). Arbitrary values (`p="13px"`), responsive objects (`{ base, md }`) and `_hover={{…}}` produce no CSS. For anything else use `style={{…}}` with the variables: `var(--spacing-4)`, `var(--colors-fg-muted)`, `var(--colors-blue-9)`, `var(--radii-l2)`, `var(--shadows-md)`.

**Icons.** lucide-react icons are on the global with the `Icon` suffix (`SearchIcon`, `CheckIcon`, `GithubIcon`). Put them inside `Button` / `IconButton` children, or size them with `<Icon size="lg">`.

**Where the truth lives.** `_ds_bundle.css` (all tokens and classes); each component's `.d.ts` (its own API, such as `variant`, `size`, `loading`, comes at the end, after the inherited Panda style props) and `.prompt.md` (examples).

```jsx
const { Card, Field, Input, Button, Stack, HStack } = window.ParkUI;

<Card.Root maxW="md">
  <Card.Header gap="1">
    <Card.Title>Sign up</Card.Title>
    <Card.Description>Create an account to get started.</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="4">
      <Field.Root>
        <Field.Label>E-Mail</Field.Label>
        <Input type="email" placeholder="you@example.com" />
      </Field.Root>
      <HStack gap="2">
        <Button variant="outline" colorPalette="gray" flex="1">Cancel</Button>
        <Button flex="1">Create account</Button>
      </HStack>
    </Stack>
  </Card.Body>
</Card.Root>
```
