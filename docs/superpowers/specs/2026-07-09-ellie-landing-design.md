# Ellie Landing Page — Design Spec

Date: 2026-07-09

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
- No cabin preview/gallery embed on this page (explicitly excluded by the
  user in favor of a focused, minimal page).
- No full site navbar on this page.

## Architecture

### Routing

- New route: `app/ellie/page.tsx` (Next.js App Router).
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
  panel).
- New component `components/ellie/ellie-hero-panel.tsx` also consumes the
  hook, but:
  - Renders embedded in the page layout (not `fixed`/floating).
  - Starts in the "selecting" state automatically on mount — i.e. the
    voice/text choice is visible immediately without any prior button click.
  - Otherwise reuses the same panel visual structure (header "Ellie",
    message list, input for chat mode, "Finalizar llamada" button) as the
    existing widget's panel.

### Page composition

`app/ellie/page.tsx` renders, top to bottom:

1. `EllieHeader` (new, minimal) — logo/site name only, linking to `/`. No
   anchor-link menu.
2. `EllieHero` (new) — headline + badge + avatar + embedded
   `EllieHeroPanel`.
3. `EllieCapabilities` (new) — "Qué puede hacer Ellie" grid.
4. `EllieHowItWorks` (new) — "Cómo funciona" 3-step section.
5. A simple closing band reinforcing 24/7 availability, with a link back to
   `/` and/or the existing WhatsApp CTA as an alternative channel.

## Content

### Hero

- Badge: "🟢 Disponible ahora · Recepcionista 24/7".
- Headline (approx.): "Reservá tu cabaña o resolvé tus dudas, hablando con
  Ellie".
- Subheadline: short line reinforcing that she answers questions and
  handles reservations at any hour, any day.
- Avatar: circular badge (~80–96px), `valle-brown/10` background, a
  lucide-react icon (headset or chat bubble) in `valle-brown`, with a small
  pulsing green "en línea" indicator overlapping the corner — visually
  consistent with the icon-circle pattern already used in
  `about-section.tsx`.
- The `EllieHeroPanel` sits alongside/below this text (side-by-side on
  desktop, stacked on mobile) and is already showing the "¿Cómo querés
  hablar?" voice/text selector on load.

### "Qué puede hacer Ellie" (capability grid)

Four cards, same icon-circle + title + short description pattern as
`about-section.tsx`, 2x2 on desktop / 1 column on mobile:

1. Disponibilidad y reservas
2. Precios y promociones
3. Ubicación y cómo llegar
4. Servicios y comodidades de las cabañas

### "Cómo funciona" (3 steps)

1. Elegí voz o texto.
2. Contale qué necesitás (fechas, cabaña, dudas).
3. Reservá o resolvé tu consulta al instante, sin esperar respuesta.

### Closing

Short line reinforcing "disponible 24/7, los 365 días del año", plus a
discreet link back to the homepage and/or the existing WhatsApp CTA as an
alternative contact channel. Not a full repeat of `contact-section.tsx`.

## Visual design

- Reuses the existing design tokens: `valle-brown` (#7A2B1E) as primary
  accent, `valle-cream` (#FAF6F0) background, `valle-dark` (#2C1810) text,
  Inter font — no new palette or fonts introduced.
- Capability grid and "how it works" steps reuse the existing icon-circle +
  title + text card pattern from `about-section.tsx`.
- The embedded conversation panel reuses the existing panel visual
  structure from the floating widget, just not positioned as `fixed`, and
  sized larger to be a hero centerpiece on desktop.
- Closing band: a smaller, simpler treatment than `contact-section.tsx`
  (not a full re-implementation of that section) — centered text on either
  a light `valle-brown` band or plain `valle-cream` background.

## Testing / verification

- Manual verification via the `run` skill: launch dev server, navigate to
  `/ellie`, confirm the panel auto-shows the voice/text selector with no
  prior click, confirm starting a voice or text conversation works
  end-to-end (mic permission prompt, transcript/messages appearing), and
  confirm the homepage's existing floating widget still behaves exactly as
  before (regression check on the shared hook refactor).
- No automated test suite exists in this project currently; this spec does
  not introduce one (out of scope).
