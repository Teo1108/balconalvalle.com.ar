# Ellie Landing Page — Design Spec

Date: 2026-07-09
Revision: 2 (replaces the original design with a Stitch-generated visual
design for the same page; see "Revision history" at the bottom)

## Purpose

Create a dedicated landing page, `/ellie`, that lets a visitor talk to Ellie
(the existing Vapi-powered AI assistant) immediately on arrival, framed
explicitly as a **24/7 receptionist** for consultations and cabin
reservations. This is separate from the existing floating widget on the
homepage, which is left unchanged.

## Non-goals

- Do not change the homepage's floating `VapiWidget` behavior or its entry
  point. It keeps working exactly as it does today.
- No testimonials section (none exist in the codebase; not being originated
  here).
- No cabin preview/gallery embed on this page.
- No automated test framework (none exists in the project; out of scope).
- No dark mode / light-dark theme toggle. (The sun/moon and device-size
  icons visible in the Stitch mockup screenshot are Stitch's own editor
  toolbar for previewing breakpoints/themes — they are not part of the
  actual page design and are not implemented.)
- No new nav links beyond "Reservar" (no site-wide nav menu, no additional
  page links).

## Architecture

### Routing

- New route: `app/ellie/page.tsx` (Next.js App Router).
- New nested layout: `app/ellie/layout.tsx` — loads the page-specific fonts
  (see "Visual design") and wraps `children`, without touching the root
  `app/layout.tsx` (which keeps serving Inter to the rest of the site).
- Exports its own `metadata` for SEO/OG: title along the lines of "Hablá con
  Ellie — Recepcionista 24/7 | Balcón al Valle", with a description
  emphasizing 24/7 availability for reservations and consultations.

### Shared Vapi logic (refactor)

Today, `components/ui/vapi-widget.tsx` is a monolithic component that both
owns the floating UI *and* all the Vapi call logic (client creation, event
listeners for `call-start`/`call-end`/`error`/`message`, transcript state,
mute-for-chat behavior, sending chat messages). To support a second,
differently-shaped UI (embedded instead of floating, auto-opened instead of
click-to-open) without duplicating this logic:

- Extract the non-visual logic into a hook: `hooks/use-vapi-conversation.ts`.
  - Owns: Vapi client instance (lazy-created via `useEffect`), `callStatus`
    (`idle | connecting | active`), `messages`/transcript state, `muted`
    state.
  - Exposes actions: `startVoice()`, `startChat()` (starts call then mutes
    mic after the existing ~500ms delay), `sendMessage(content: string)`,
    `stop()`.
  - Uses the existing `VAPI_PUBLIC_KEY` / `VAPI_ASSISTANT_ID` from
    `lib/vapi-config.ts` — no new env vars.
- `components/ui/vapi-widget.tsx` is refactored to consume this hook instead
  of owning the logic inline. Its rendered behavior on the homepage must stay
  visually and functionally identical to today (floating button → selector →
  panel), including its existing `valle-*` palette — the widget is NOT
  restyled with the new `ellie-*` tokens.
- New component `components/ellie/ellie-hero-panel.tsx` also consumes the
  hook, but:
  - Renders embedded in the page layout (not `fixed`/floating).
  - Starts in the "selecting" state automatically on mount — i.e. the
    voice/text choice is visible immediately without any prior button click.
  - Reuses the panel's functional states (connecting, active voice with live
    transcript, active chat with input, "Finalizar llamada") but restyled
    with the new `ellie-*` palette and typography (see "Visual design").

### Page composition

`app/ellie/page.tsx` renders, top to bottom:

1. `EllieNavbar` (new) — logo image + "Balcón al Valle" text, linking to
   `/`; "Reservar" button (desktop/tablet) or hamburger menu (mobile) that
   opens a drawer containing the same "Reservar" button. "Reservar" performs
   a smooth scroll to the embedded `EllieHeroPanel`.
2. `EllieHero` (new) — badge + avatar + headline/subheadline + embedded
   `EllieHeroPanel`.
3. `EllieCapabilities` (new) — "Qué puede hacer Ellie" 2x2 grid.
4. `EllieHowItWorks` (new) — "Cómo funciona" 3-step section with a connector
   line on desktop.
5. `EllieMountainBanner` (new) — full-width panoramic photo with a text
   overlay ("Tu refugio te espera").
6. `EllieFooter` (new) — logo + short description, links to Términos,
   Privacidad, Contacto, Instagram (placeholders, `#` hrefs, matching the
   Stitch mockup as-is).

## Content

### Navbar

- Logo: `public/images/BalconAlVallewb.jpg` (existing asset) + "Balcón al
  Valle" text, links to `/`.
- "Reservar" button: smooth-scrolls to the `EllieHeroPanel` anchor. Visible
  directly on `md:` and larger; behind a hamburger icon + drawer on mobile.

### Hero

- Badge: "🟢 Disponible ahora · Recepcionista 24/7".
- Headline: "Reservá tu cabaña o resolvé tus dudas, hablando con Ellie".
- Subheadline: reinforces 24/7 availability for questions and reservations.
- Avatar: circular badge (~80–96px), `ellie-primary`-tinted background,
  `Headset` (lucide-react) icon, with a small pulsing green "en línea"
  indicator overlapping the corner.
- The `EllieHeroPanel` sits alongside this text (side-by-side on desktop,
  stacked on mobile), already showing the "¿Cómo querés hablar con Ellie?"
  voice/text selector on load.

### "Qué puede hacer Ellie" (capability grid)

Four cards, icon-circle + title + short description, 2x2 on desktop / 1
column on mobile:

1. Disponibilidad y reservas — `CalendarCheck`
2. Precios y promociones — `Tag`
3. Ubicación y cómo llegar — `MapPin`
4. Servicios y comodidades — `Home`

### "Cómo funciona" (3 steps)

1. Elegí voz o texto.
2. Contale qué necesitás (fechas, cabaña, dudas).
3. Reservá al instante.

Numbered circles (`ellie-primary` background), connected by a horizontal
line on desktop (hidden on mobile).

### Mountain banner

Full-width (aspect ~21:9) photo using the existing
`public/images/hero-bg.jpg` asset, dark gradient overlay, with overlay text
"Tu refugio te espera" / "Encontrá la paz que buscás en Balcón al Valle."

### Footer

- Logo + "Balcón al Valle" + one-line description.
- Links: Términos, Privacidad, Contacto, Instagram — all `#` placeholders,
  matching the Stitch mockup exactly (no real destinations wired yet).

## Visual design

### Colors

New Tailwind tokens, prefixed `ellie-*`, added to `tailwind.config.ts`
alongside the existing `valle-*` tokens (which remain untouched and are
still used by the rest of the site, including the floating widget). Values
taken 1:1 from the Stitch-generated mockup:

| Token | Value | Usage |
|---|---|---|
| `ellie-primary` | `#370800` | Headlines, primary buttons, icons |
| `ellie-primary-container` | `#551a09` | Panel header background |
| `ellie-on-primary-container` | `#d67e66` | Icon/text on panel header |
| `ellie-secondary` | `#006e2e` | Online indicator dot |
| `ellie-surface` | `#fff8f6` | Page background |
| `ellie-surface-low` | `#fff1ed` | Section band background |
| `ellie-surface-container` | `#faeae7` | Card/panel backgrounds |
| `ellie-surface-container-high` | `#f5e5e1` | Icon-circle backgrounds |
| `ellie-surface-container-highest` | `#efdfdb` | Emphasis backgrounds |
| `ellie-surface-container-lowest` | `#ffffff` | Card surfaces |
| `ellie-on-surface` | `#221a18` | Body text (dark) |
| `ellie-on-surface-variant` | `#54433e` | Secondary/muted text |
| `ellie-outline-variant` | `#dac1bb` | Borders, connector lines |

These tokens are used only by components under `components/ellie/` and
`app/ellie/`; nothing else in the codebase references them.

### Typography

- Headlines: **Noto Serif** (weights 600/700).
- Body/UI text: **Manrope** (weights 400/500/600/700).
- Loaded via `next/font/google` in `app/ellie/layout.tsx` only — the rest of
  the site keeps using Inter from the root layout.

### Icons

lucide-react only (already a project dependency) — no new icon font/library.
Mapping from the Stitch mockup's Material Symbols:

| Material Symbol | lucide-react |
|---|---|
| `support_agent` | `Headset` |
| `mic` | `Mic` |
| `forum` | `MessageSquare` |
| `menu` | `Menu` |
| `calendar_today` | `CalendarCheck` |
| `sell` | `Tag` |
| `location_on` | `MapPin` |
| `deck` | `Home` |
| `smart_toy` | `Bot` |

### Layout patterns

- Rounded cards (`rounded-2xl`), soft organic shadows, generous vertical
  section padding — matching the Stitch mockup's visual rhythm.
- `EllieHeroPanel` keeps the same functional states as the original
  floating-widget panel (selecting → connecting → active voice/chat →
  ended), restyled with the new palette/typography instead of `valle-*`.

## Testing / verification

- Manual verification via the `run` skill: launch dev server, navigate to
  `/ellie`, and confirm:
  - The panel auto-shows the voice/text selector with no prior click.
  - Voice: mic permission prompt, call connects, live transcript appears.
  - Chat: input works, message sends, Ellie responds.
  - "Finalizar llamada" returns to the selector (panel stays embedded).
  - Navbar: "Reservar" visible directly on desktop/tablet and scrolls to the
    panel; on mobile, the hamburger icon opens a drawer containing
    "Reservar".
  - Logo renders correctly, mountain banner image loads, footer renders with
    its 4 placeholder links.
  - Regression: homepage's floating widget (`/`) still behaves exactly as
    before (shared hook refactor did not change its behavior or styling).
- `npx tsc --noEmit` — no errors.
- No automated test suite exists in this project; this spec does not
  introduce one (out of scope).

## Revision history

- **Revision 1** (superseded): original from-scratch visual design reusing
  the `valle-*` palette, Inter font, and the existing `about-section.tsx`
  card patterns.
- **Revision 2** (this document): visual design replaced with a
  Stitch-generated mockup ("Balcón al Valle - Con Controles de Dispositivo y
  Modo"), adapted to the codebase's conventions — new `ellie-*` color
  tokens, Noto Serif + Manrope fonts scoped to `/ellie`, lucide-react icons
  instead of Material Symbols, self-hosted logo/mountain images instead of
  Stitch's temporary hosted assets, and an added navbar/mountain-banner/
  footer (present in the mockup, absent from Revision 1). The functional
  architecture (shared `useVapiConversation` hook, page composition order,
  non-goals around the floating widget and dark mode) carries over
  unchanged.
