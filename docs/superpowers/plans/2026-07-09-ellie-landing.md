# Ellie Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Revision 2** — supersedes the original plan of the same filename. Rebuilt
to implement the Stitch-generated visual design from
`docs/superpowers/specs/2026-07-09-ellie-landing-design.md` (Revision 2):
new `ellie-*` color tokens, Noto Serif + Manrope fonts scoped to `/ellie`,
lucide-react icons, a navbar with a mobile drawer, a mountain-photo banner,
and a footer — none of which existed in Revision 1.

**Goal:** Build a dedicated `/ellie` landing page where Ellie's voice/chat
panel opens automatically, styled after the Stitch mockup ("Balcón al Valle
- Con Controles de Dispositivo y Modo"), framed as a 24/7 receptionist for
cabin reservations and consultations, without changing the existing
homepage floating widget's behavior or appearance.

**Architecture:** Extract the Vapi call/chat logic currently baked into the
floating widget into a shared `useVapiConversation` hook; refactor the
existing widget to consume it with zero visual/behavioral change. Add a new
`ellie-*` Tailwind color palette and a `/ellie`-scoped font pair (Noto Serif
+ Manrope via `next/font/google`). Build a new embedded (non-floating,
auto-open) panel and five new presentational sections — navbar, hero,
capabilities, how-it-works, mountain banner, footer — composed on
`app/ellie/page.tsx`, all using lucide-react icons and the new palette.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript (strict),
Tailwind CSS, `@vapi-ai/web`, `lucide-react`, `next/font/google`.

## Global Constraints

- Reference spec: `docs/superpowers/specs/2026-07-09-ellie-landing-design.md` (Revision 2).
- Do not change the homepage's floating `VapiWidget` visual behavior or its `valle-*` palette — only its internal implementation (Task 1 is a pure refactor, verified by manual regression check).
- No new environment variables. Reuse `VAPI_PUBLIC_KEY` / `VAPI_ASSISTANT_ID` from `lib/vapi-config.ts`.
- New color tokens use the `ellie-*` prefix in `tailwind.config.ts`, additive to the existing `valle-*` tokens — do not remove or rename `valle-*` tokens.
- New fonts (Noto Serif, Manrope) are scoped to `/ellie` only via a nested `app/ellie/layout.tsx` using `next/font/google` — do not touch `app/layout.tsx` or the site-wide Inter font.
- Icons: lucide-react only (already a dependency, `^1.17.0`) — no new icon font/library, no Material Symbols.
- No dark mode / theme toggle — out of scope per spec.
- No new environment/config for images: the mountain banner reuses the existing Cloudinary asset `https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero-bg_fuyzqg` (already used by `components/sections/hero-section.tsx`, already covered by the `res.cloudinary.com` entry in `next.config.mjs` `images.remotePatterns`). The logo uses the existing local file `public/images/BalconAlVallewb.jpg` (served at `/images/BalconAlVallewb.jpg`, covered by the `'self'` `img-src` in the CSP in `next.config.mjs` — no CSP change needed).
- No automated test framework is configured in this project (no Jest/Vitest/React Testing Library). Verification per task is `npx tsc --noEmit` plus manual checks via the dev server — do not add a test framework as part of this plan (out of scope).
- Path alias `@/*` maps to the repo root (see `tsconfig.json`), e.g. `@/hooks/use-vapi-conversation`, `@/components/ellie/ellie-hero-panel`.
- Footer links (Términos, Privacidad, Contacto, Instagram) are `#` placeholders, matching the Stitch mockup as-is — do not wire them to real destinations.

---

### Task 1: Extract `useVapiConversation` hook and refactor the existing floating widget

**Files:**
- Create: `hooks/use-vapi-conversation.ts`
- Modify: `components/ui/vapi-widget.tsx` (full rewrite, same visual output)

**Interfaces:**
- Produces (used by Task 4's `EllieHeroPanel`):
  ```ts
  export type ConversationMode = 'selecting' | 'voice' | 'chat';
  export type CallStatus = 'idle' | 'connecting' | 'active';
  export type ConversationMessage = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    isPartial?: boolean;
  };
  export interface UseVapiConversationOptions {
    onCallEnd?: () => void;
  }
  export interface UseVapiConversationResult {
    mode: ConversationMode;
    callStatus: CallStatus;
    messages: ConversationMessage[];
    partialTranscript: string;
    isSpeaking: boolean;
    startVoice: () => void;
    startChat: () => void;
    sendMessage: (content: string) => void;
    endCall: () => void;
  }
  export function useVapiConversation(
    options?: UseVapiConversationOptions
  ): UseVapiConversationResult;
  ```
  `mode` starts at `'selecting'`. On the Vapi `call-end` event, the hook resets `callStatus` to `'idle'`, `mode` to `'selecting'`, clears `messages`/`partialTranscript`, and invokes `options.onCallEnd?.()` if provided.

- [ ] **Step 1: Create the shared hook**

Create `hooks/use-vapi-conversation.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID as ASSISTANT_ID } from '@/lib/vapi-config';

export type ConversationMode = 'selecting' | 'voice' | 'chat';
export type CallStatus = 'idle' | 'connecting' | 'active';

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isPartial?: boolean;
};

interface VapiMessage {
  type: string;
  role?: 'user' | 'assistant';
  transcript?: string;
  transcriptType?: 'partial' | 'final';
}

export interface UseVapiConversationOptions {
  onCallEnd?: () => void;
}

export interface UseVapiConversationResult {
  mode: ConversationMode;
  callStatus: CallStatus;
  messages: ConversationMessage[];
  partialTranscript: string;
  isSpeaking: boolean;
  startVoice: () => void;
  startChat: () => void;
  sendMessage: (content: string) => void;
  endCall: () => void;
}

export function useVapiConversation(
  options: UseVapiConversationOptions = {}
): UseVapiConversationResult {
  const { onCallEnd } = options;

  const [mode, setMode] = useState<ConversationMode>('selecting');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');

  const vapiRef = useRef<Vapi | null>(null);
  const onCallEndRef = useRef(onCallEnd);
  onCallEndRef.current = onCallEnd;

  useEffect(() => {
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      setCallStatus('active');
    });

    vapi.on('call-end', () => {
      setCallStatus('idle');
      setMode('selecting');
      setMessages([]);
      setPartialTranscript('');
      onCallEndRef.current?.();
    });

    vapi.on('error', () => {
      setCallStatus('idle');
      setMode('selecting');
    });

    vapi.on('message', (msg: VapiMessage) => {
      if (msg.type === 'transcript') {
        const { role, transcript, transcriptType } = msg;
        if (!role || !transcript) return;

        if (transcriptType === 'partial') {
          setPartialTranscript(transcript);
        } else if (transcriptType === 'final') {
          setPartialTranscript('');
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === role && lastMsg?.isPartial) {
              return prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, text: transcript, isPartial: false }
                  : m
              );
            }
            return [
              ...prev,
              {
                id: Date.now().toString(),
                role,
                text: transcript,
                isPartial: false,
              },
            ];
          });
        }
      }

      if (msg.type === 'speech-start') {
        setIsSpeaking(true);
      }

      if (msg.type === 'speech-end') {
        setIsSpeaking(false);
      }
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const startVoice = () => {
    if (!vapiRef.current) return;
    setMode('voice');
    setCallStatus('connecting');
    setMessages([]);
    vapiRef.current.start(ASSISTANT_ID);
  };

  const startChat = () => {
    if (!vapiRef.current) return;
    setMode('chat');
    setCallStatus('connecting');
    setMessages([]);

    vapiRef.current.start(ASSISTANT_ID);

    setTimeout(() => {
      vapiRef.current?.setMuted(true);
      vapiRef.current?.send({
        type: 'control',
        control: 'mute-assistant',
      });
    }, 500);
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !vapiRef.current) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: content,
      isPartial: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    vapiRef.current.send({
      type: 'add-message',
      message: {
        role: 'user',
        content,
      },
      triggerResponseEnabled: true,
    });
  };

  const endCall = () => {
    vapiRef.current?.stop();
  };

  return {
    mode,
    callStatus,
    messages,
    partialTranscript,
    isSpeaking,
    startVoice,
    startChat,
    sendMessage,
    endCall,
  };
}
```

- [ ] **Step 2: Refactor the floating widget to consume the hook**

Replace the full contents of `components/ui/vapi-widget.tsx` with:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MessageCircle, Phone, PhoneOff, Send, X, Loader2 } from 'lucide-react';
import { useVapiConversation } from '@/hooks/use-vapi-conversation';

export default function VapiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    mode,
    callStatus,
    messages,
    partialTranscript,
    isSpeaking,
    startVoice,
    startChat,
    sendMessage,
    endCall,
  } = useVapiConversation({ onCallEnd: () => setIsOpen(false) });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  const handleClose = () => {
    if (callStatus === 'active') {
      endCall();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {!isOpen && (
        <>
          {callStatus === 'idle' && (
            <span className="bg-valle-dark text-valle-cream text-sm px-3 py-1.5 rounded-full shadow-md">
              Hablar con Ellie
            </span>
          )}
          <button
            onClick={() => setIsOpen(true)}
            disabled={callStatus === 'connecting'}
            aria-label="Abrir opciones de Ellie"
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
              callStatus === 'connecting'
                ? 'bg-valle-sand cursor-not-allowed'
                : 'bg-valle-brown hover:bg-valle-dark'
            }`}
          >
            {callStatus === 'connecting' ? (
              <Loader2 size={28} className="text-white animate-spin" />
            ) : (
              <Phone size={28} className="text-white" />
            )}
          </button>
        </>
      )}

      {isOpen && mode === 'selecting' && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 w-56">
          <p className="text-sm font-semibold text-valle-dark text-center">
            ¿Cómo querés hablar?
          </p>
          <button
            onClick={startVoice}
            className="flex items-center justify-center gap-2 bg-valle-brown hover:bg-valle-dark text-white font-semibold py-2 rounded-lg transition-colors"
          >
            <Mic size={18} />
            Hablar con voz
          </button>
          <button
            onClick={startChat}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            Chatear por texto
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-sm text-valle-dark/60 hover:text-valle-dark"
          >
            Cerrar
          </button>
        </div>
      )}

      {isOpen && (mode === 'voice' || mode === 'chat') && (
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-80 h-96 overflow-hidden">
          <div className="bg-valle-brown text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold">Ellie</span>
              {isSpeaking && mode === 'voice' && (
                <span className="ml-2 text-xs bg-red-500 px-2 py-1 rounded-full animate-pulse">
                  Hablando...
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-valle-cream/30">
            {messages.length === 0 && !partialTranscript && (
              <div className="flex items-center justify-center h-full text-valle-dark/50 text-sm text-center">
                {callStatus === 'connecting'
                  ? 'Conectando con Ellie...'
                  : 'Iniciá la conversación'}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-valle-brown text-white rounded-br-none'
                      : 'bg-white text-valle-dark rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {partialTranscript && (
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-valle-brown/70 text-white rounded-br-none italic text-sm">
                  {partialTranscript}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-valle-sand/30 p-3 bg-white">
            {mode === 'chat' && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Escribí tu mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendChat();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-valle-sand rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-valle-brown"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white p-2 rounded-lg transition-colors"
                  aria-label="Enviar"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
            <button
              onClick={endCall}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              <PhoneOff size={18} />
              Finalizar llamada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual regression check on the homepage**

Run: `npm run dev` (background, if not already running), then in a browser open `http://localhost:3000` and:
- Confirm the floating "Hablar con Ellie" bubble still appears bottom-right.
- Click it → confirm the "¿Cómo querés hablar?" selector appears.
- Click "Chatear por texto" → confirm the chat panel opens, connects, and you can type and send a message.
- Click "Finalizar llamada" → confirm the panel closes and the floating bubble reappears.

This must behave identically to before the refactor.

- [ ] **Step 5: Commit**

```bash
git add hooks/use-vapi-conversation.ts components/ui/vapi-widget.tsx
git commit -m "refactor: extract shared useVapiConversation hook from floating widget"
```

---

### Task 2: Add `ellie-*` design tokens to Tailwind config

**Files:**
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces (used by every later `components/ellie/*` and `app/ellie/*` task): Tailwind color utilities `bg-ellie-*` / `text-ellie-*` / `border-ellie-*` and font utilities `font-ellie-serif` / `font-ellie-sans`.

- [ ] **Step 1: Add the color and font tokens**

Modify `tailwind.config.ts` — replace its full contents with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'valle-brown': '#7A2B1E',
        'valle-sand':  '#D4B896',
        'valle-cream': '#FAF6F0',
        'valle-dark':  '#2C1810',
        background: "var(--background)",
        foreground: "var(--foreground)",
        'ellie-primary': '#370800',
        'ellie-primary-container': '#551a09',
        'ellie-on-primary-container': '#d67e66',
        'ellie-secondary': '#006e2e',
        'ellie-surface': '#fff8f6',
        'ellie-surface-low': '#fff1ed',
        'ellie-surface-container': '#faeae7',
        'ellie-surface-container-high': '#f5e5e1',
        'ellie-surface-container-highest': '#efdfdb',
        'ellie-surface-container-lowest': '#ffffff',
        'ellie-on-surface': '#221a18',
        'ellie-on-surface-variant': '#54433e',
        'ellie-outline-variant': '#dac1bb',
      },
      fontFamily: {
        'ellie-serif': ['var(--font-ellie-serif)'],
        'ellie-sans': ['var(--font-ellie-sans)'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add ellie-* design tokens to Tailwind config"
```

---

### Task 3: Create the `/ellie` nested layout with scoped fonts

**Files:**
- Create: `app/ellie/layout.tsx`

**Interfaces:**
- Consumes: `font-ellie-serif` / `font-ellie-sans` Tailwind utilities (Task 2).
- Produces: default export `EllieLayout`, a Next.js layout component that wraps every route under `app/ellie/*` (used automatically by Next.js — no explicit import needed by Task 11's `page.tsx`).

- [ ] **Step 1: Create the layout**

Create `app/ellie/layout.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Noto_Serif, Manrope } from 'next/font/google';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-ellie-serif',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ellie-sans',
});

export default function EllieLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${notoSerif.variable} ${manrope.variable} font-ellie-sans`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/ellie/layout.tsx
git commit -m "feat: add /ellie nested layout with Noto Serif + Manrope fonts"
```

---

### Task 4: Create the embedded, auto-opening `EllieHeroPanel`

**Files:**
- Create: `components/ellie/ellie-hero-panel.tsx`

**Interfaces:**
- Consumes: `useVapiConversation` from `@/hooks/use-vapi-conversation` (Task 1), called with no options (no `onCallEnd` needed — panel stays embedded and simply returns to the `'selecting'` mode when a call ends).
- Produces: default export `EllieHeroPanel` (no props), used by Task 6's `EllieHero`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-hero-panel.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MessageSquare, PhoneOff, Send, Bot } from 'lucide-react';
import { useVapiConversation } from '@/hooks/use-vapi-conversation';

export default function EllieHeroPanel() {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    mode,
    callStatus,
    messages,
    partialTranscript,
    isSpeaking,
    startVoice,
    startChat,
    sendMessage,
    endCall,
  } = useVapiConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="bg-ellie-surface-container-lowest rounded-2xl shadow-2xl border border-ellie-outline-variant/30 flex flex-col w-full max-w-md h-[30rem] overflow-hidden">
      <div className="bg-ellie-primary-container px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-ellie-surface-container-highest flex items-center justify-center">
          <Bot size={18} className="text-ellie-primary-container" />
        </div>
        <span className="text-ellie-on-primary-container font-ellie-serif text-sm uppercase tracking-widest">
          Ellie
        </span>
        {isSpeaking && mode === 'voice' && (
          <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
            Hablando...
          </span>
        )}
      </div>

      {mode === 'selecting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <p className="font-ellie-serif text-xl text-ellie-primary">
            ¿Cómo querés hablar con Ellie?
          </p>
          <div className="w-full space-y-3">
            <button
              onClick={startVoice}
              className="w-full flex items-center justify-center gap-3 bg-ellie-primary text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              <Mic size={18} />
              Hablar con voz
            </button>
            <button
              onClick={startChat}
              className="w-full flex items-center justify-center gap-3 bg-ellie-surface-container-high text-ellie-on-surface-variant py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              <MessageSquare size={18} />
              Chatear por texto
            </button>
          </div>
        </div>
      )}

      {(mode === 'voice' || mode === 'chat') && (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-ellie-surface-low">
            {messages.length === 0 && !partialTranscript && (
              <div className="flex items-center justify-center h-full text-ellie-on-surface-variant text-sm text-center">
                {callStatus === 'connecting'
                  ? 'Conectando con Ellie...'
                  : 'Iniciá la conversación'}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-ellie-primary text-white rounded-br-none'
                      : 'bg-white text-ellie-on-surface rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {partialTranscript && (
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-ellie-primary/70 text-white rounded-br-none italic text-sm">
                  {partialTranscript}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-ellie-outline-variant p-3 bg-white">
            {mode === 'chat' && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Escribí tu mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendChat();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-ellie-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ellie-primary"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="bg-ellie-secondary hover:opacity-90 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
                  aria-label="Enviar"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
            <button
              onClick={endCall}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              <PhoneOff size={18} />
              Finalizar llamada
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-hero-panel.tsx
git commit -m "feat: add embedded auto-open EllieHeroPanel styled with ellie-* tokens"
```

---

### Task 5: Create `EllieNavbar` with mobile drawer

**Files:**
- Create: `components/ellie/ellie-navbar.tsx`

**Interfaces:**
- Consumes: local file `public/images/BalconAlVallewb.jpg` (existing asset); scrolls to a DOM element with `id="ellie-panel"` (produced by Task 6's `EllieHero`).
- Produces: default export `EllieNavbar` (no props), used by Task 11's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-navbar.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function EllieNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollToPanel = () => {
    document.getElementById('ellie-panel')?.scrollIntoView({ behavior: 'smooth' });
    setDrawerOpen(false);
  };

  return (
    <header className="bg-ellie-surface sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/BalconAlVallewb.jpg"
            alt="Balcón al Valle"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="font-ellie-serif text-lg font-bold text-ellie-primary">
            Balcón al Valle
          </span>
        </Link>

        <button
          onClick={scrollToPanel}
          className="hidden md:inline-flex bg-ellie-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
        >
          Reservar
        </button>

        <button
          onClick={() => setDrawerOpen((open) => !open)}
          className="md:hidden text-ellie-primary"
          aria-label={drawerOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {drawerOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {drawerOpen && (
        <div className="md:hidden px-4 pb-4">
          <button
            onClick={scrollToPanel}
            className="w-full bg-ellie-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            Reservar
          </button>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-navbar.tsx
git commit -m "feat: add EllieNavbar with mobile drawer"
```

---

### Task 6: Create `EllieHero`

**Files:**
- Create: `components/ellie/ellie-hero.tsx`

**Interfaces:**
- Consumes: `EllieHeroPanel` default export from `@/components/ellie/ellie-hero-panel` (Task 4).
- Produces: default export `EllieHero` (no props), used by Task 11's `app/ellie/page.tsx`. Renders a DOM element with `id="ellie-panel"` that `EllieNavbar` (Task 5) scrolls to.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-hero.tsx`:

```tsx
import { Headset } from 'lucide-react';
import EllieHeroPanel from './ellie-hero-panel';

export default function EllieHero() {
  return (
    <section className="bg-ellie-surface pt-8 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full">
            🟢 Disponible ahora · Recepcionista 24/7
          </span>

          <div className="relative w-24 h-24 rounded-full bg-ellie-primary/10 flex items-center justify-center">
            <Headset size={44} className="text-ellie-primary" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-ellie-secondary border-2 border-ellie-surface animate-pulse" />
          </div>

          <h1 className="font-ellie-serif text-4xl md:text-5xl font-bold text-ellie-primary leading-tight">
            Reservá tu cabaña o resolvé tus dudas, hablando con Ellie
          </h1>
          <p className="text-lg text-ellie-on-surface-variant max-w-md">
            Nuestra recepcionista virtual te atiende las 24 horas, los 365
            días del año, para consultar disponibilidad y reservar tu cabaña
            al instante.
          </p>
        </div>

        <div id="ellie-panel" className="flex justify-center">
          <EllieHeroPanel />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-hero.tsx
git commit -m "feat: add EllieHero section"
```

---

### Task 7: Create `EllieCapabilities`

**Files:**
- Create: `components/ellie/ellie-capabilities.tsx`

**Interfaces:**
- Produces: default export `EllieCapabilities` (no props), used by Task 11's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-capabilities.tsx`:

```tsx
import { CalendarCheck, Tag, MapPin, Home } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: CalendarCheck,
    title: 'Disponibilidad y reservas',
    description:
      'Consultá qué cabañas están libres en tus fechas y reservá al instante, sin esperar una respuesta.',
  },
  {
    icon: Tag,
    title: 'Precios y promociones',
    description:
      'Enterate de tarifas, descuentos y promociones vigentes para tu estadía de forma inmediata.',
  },
  {
    icon: MapPin,
    title: 'Ubicación y cómo llegar',
    description:
      'Pedile indicaciones para llegar al complejo y recomendaciones personalizadas de la zona.',
  },
  {
    icon: Home,
    title: 'Servicios y comodidades',
    description:
      'Preguntale qué incluye cada cabaña: capacidad, comodidades y servicios disponibles en el predio.',
  },
];

export default function EllieCapabilities() {
  return (
    <section className="bg-ellie-surface-low py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-ellie-serif text-3xl md:text-4xl font-bold text-ellie-primary mb-16">
          Qué puede hacer Ellie
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-ellie-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col items-center text-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-ellie-surface-container-high flex items-center justify-center">
                <Icon size={28} className="text-ellie-primary" />
              </div>
              <h3 className="font-ellie-serif text-xl text-ellie-primary">{title}</h3>
              <p className="text-ellie-on-surface-variant leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-capabilities.tsx
git commit -m "feat: add EllieCapabilities section"
```

---

### Task 8: Create `EllieHowItWorks`

**Files:**
- Create: `components/ellie/ellie-how-it-works.tsx`

**Interfaces:**
- Produces: default export `EllieHowItWorks` (no props), used by Task 11's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-how-it-works.tsx`:

```tsx
const STEPS = [
  {
    number: '1',
    title: 'Elegí voz o texto',
    description: 'Hablá o escribile a Ellie, como prefieras, desde tu celular o computadora.',
  },
  {
    number: '2',
    title: 'Contale qué necesitás',
    description:
      'Fechas, cantidad de personas, la cabaña que te interesa o cualquier duda puntual.',
  },
  {
    number: '3',
    title: 'Reservá al instante',
    description:
      'Ellie resuelve tu consulta o confirma tu reserva, sin esperar respuesta.',
  },
];

export default function EllieHowItWorks() {
  return (
    <section className="bg-ellie-surface py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-ellie-serif text-3xl md:text-4xl font-bold text-ellie-primary mb-16">
          Cómo funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-ellie-outline-variant -z-10" />
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-ellie-primary text-white flex items-center justify-center text-2xl font-bold ring-8 ring-ellie-surface relative z-10">
                {number}
              </div>
              <h3 className="font-ellie-serif text-xl text-ellie-primary">{title}</h3>
              <p className="text-ellie-on-surface-variant">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-how-it-works.tsx
git commit -m "feat: add EllieHowItWorks section"
```

---

### Task 9: Create `EllieMountainBanner`

**Files:**
- Create: `components/ellie/ellie-mountain-banner.tsx`

**Interfaces:**
- Consumes: `next/image`; the existing Cloudinary asset `https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero-bg_fuyzqg`.
- Produces: default export `EllieMountainBanner` (no props), used by Task 11's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-mountain-banner.tsx`:

```tsx
import Image from 'next/image';

export default function EllieMountainBanner() {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
      <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-ellie-primary/50 to-transparent z-10" />
        <Image
          src="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero-bg_fuyzqg"
          alt="Vista panorámica del valle al amanecer"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-8 left-8 z-20">
          <p className="font-ellie-serif text-2xl md:text-3xl text-white mb-2">
            Tu refugio te espera
          </p>
          <p className="text-white/80">
            Encontrá la paz que buscás en Balcón al Valle.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-mountain-banner.tsx
git commit -m "feat: add EllieMountainBanner section"
```

---

### Task 10: Create `EllieFooter`

**Files:**
- Create: `components/ellie/ellie-footer.tsx`

**Interfaces:**
- Consumes: local file `public/images/BalconAlVallewb.jpg` (existing asset).
- Produces: default export `EllieFooter` (no props), used by Task 11's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-footer.tsx`:

```tsx
import Image from 'next/image';

export default function EllieFooter() {
  return (
    <footer className="bg-ellie-surface-container-lowest border-t border-ellie-outline-variant/40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-4 md:px-8 py-12">
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/images/BalconAlVallewb.jpg"
              alt="Balcón al Valle"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-ellie-serif text-lg font-bold text-ellie-primary">
              Balcón al Valle
            </span>
          </div>
          <p className="text-ellie-on-surface-variant text-sm max-w-xs">
            Experiencias de montaña diseñadas para el descanso y la reconexión
            con la naturaleza.
          </p>
        </div>

        <div className="flex gap-6">
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Términos
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Privacidad
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Contacto
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ellie/ellie-footer.tsx
git commit -m "feat: add EllieFooter section"
```

---

### Task 11: Compose the `/ellie` page and do final end-to-end verification

**Files:**
- Create: `app/ellie/page.tsx`

**Interfaces:**
- Consumes: `EllieNavbar` (Task 5), `EllieHero` (Task 6), `EllieCapabilities` (Task 7), `EllieHowItWorks` (Task 8), `EllieMountainBanner` (Task 9), `EllieFooter` (Task 10) — all default exports, no props. Wrapped automatically by `app/ellie/layout.tsx` (Task 3).

- [ ] **Step 1: Create the page**

Create `app/ellie/page.tsx`:

```tsx
import type { Metadata } from 'next';
import EllieNavbar from '@/components/ellie/ellie-navbar';
import EllieHero from '@/components/ellie/ellie-hero';
import EllieCapabilities from '@/components/ellie/ellie-capabilities';
import EllieHowItWorks from '@/components/ellie/ellie-how-it-works';
import EllieMountainBanner from '@/components/ellie/ellie-mountain-banner';
import EllieFooter from '@/components/ellie/ellie-footer';

export const metadata: Metadata = {
  title: 'Hablá con Ellie — Recepcionista 24/7 | Balcon al Valle Grande',
  description:
    'Consultá disponibilidad y reservá tu cabaña hablando con Ellie, nuestra recepcionista virtual disponible las 24 horas, los 365 días del año.',
  openGraph: {
    title: 'Hablá con Ellie — Recepcionista 24/7',
    description:
      'Consultá disponibilidad y reservá tu cabaña hablando con Ellie, disponible las 24 horas.',
    type: 'website',
  },
};

export default function EllieLandingPage() {
  return (
    <main>
      <EllieNavbar />
      <EllieHero />
      <EllieCapabilities />
      <EllieHowItWorks />
      <EllieMountainBanner />
      <EllieFooter />
    </main>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Start the dev server and smoke-test the route**

Run: `npm run dev` (background, if not already running), then:

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ellie`
Expected: `200`

- [ ] **Step 4: Manual end-to-end verification in a browser**

Open `http://localhost:3000/ellie` and confirm:
- Navbar shows the logo image + "Balcón al Valle" text (linking to `/`), and on desktop/tablet a "Reservar" button.
- Resize to mobile width (or use device toolbar): navbar shows a hamburger icon instead of "Reservar"; tapping it opens a drawer containing "Reservar"; tapping "Reservar" (desktop or drawer) smooth-scrolls to the Ellie panel and closes the drawer.
- The hero shows the "Disponible ahora · Recepcionista 24/7" badge, the avatar with the pulsing green indicator, the headline/subheadline, and the embedded panel already showing "¿Cómo querés hablar con Ellie?" — with no button click required to reveal it.
- Click "Hablar con voz" → browser prompts for microphone permission (first time) → call connects (`callStatus` becomes `active`) and live transcript appears as you speak.
- Click "Finalizar llamada" → panel returns to the "¿Cómo querés hablar?" selector (stays embedded, not hidden).
- Click "Chatear por texto" → chat input appears, type a message and press Enter or click send → message appears and Ellie responds.
- Scroll down and confirm "Qué puede hacer Ellie" (4 cards), "Cómo funciona" (3 steps with connector line on desktop), the mountain photo banner with "Tu refugio te espera" overlay, and the footer with logo + 4 links all render correctly.
- Confirm headings render in Noto Serif and body text in Manrope (visually distinct from the rest of the site's Inter).
- Navigate back to `http://localhost:3000` and repeat the Task 1 Step 4 regression check to confirm the floating widget is unaffected (still uses `valle-*` styling, unchanged behavior).

- [ ] **Step 5: Commit**

```bash
git add app/ellie/page.tsx
git commit -m "feat: compose /ellie landing page with Stitch-derived design"
```
