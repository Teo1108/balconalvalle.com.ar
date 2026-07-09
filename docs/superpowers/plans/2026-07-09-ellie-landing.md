# Ellie Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/ellie` landing page where Ellie's voice/chat panel opens automatically, framed as a 24/7 receptionist for cabin reservations and consultations, without changing the existing homepage floating widget's behavior.

**Architecture:** Extract the Vapi call/chat logic currently baked into the floating widget into a shared `useVapiConversation` hook. Refactor the existing widget to consume the hook with zero behavior change. Build a new embedded (non-floating, auto-open) panel and four new presentational sections on a new `app/ellie/page.tsx` route, all consuming the same hook and reusing the existing `valle-*` Tailwind palette and card patterns.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS, `@vapi-ai/web`, `lucide-react`.

## Global Constraints

- Reference spec: `docs/superpowers/specs/2026-07-09-ellie-landing-design.md`.
- Do not change the homepage's floating `VapiWidget` visual behavior — only its internal implementation (Task 1 is a pure refactor, verified by manual regression check).
- No new environment variables. Reuse `VAPI_PUBLIC_KEY` / `VAPI_ASSISTANT_ID` from `lib/vapi-config.ts`.
- Reuse existing design tokens only: colors `valle-brown` (#7A2B1E), `valle-sand` (#D4B896), `valle-cream` (#FAF6F0), `valle-dark` (#2C1810) from `tailwind.config.ts`; Inter font (already global via `app/layout.tsx`). No new colors or fonts.
- No automated test framework is configured in this project (no Jest/Vitest/React Testing Library) — per the spec's "Testing / verification" section, verification is `npx tsc --noEmit` for type safety plus manual checks via the dev server, not automated tests. Do not add a test framework as part of this plan (out of scope).
- No new dependencies — all icons used (`Mic`, `MessageCircle`, `Phone`, `PhoneOff`, `Send`, `X`, `Loader2`, `Headset`, `CalendarCheck`, `Tag`, `MapPin`, `Home`) are confirmed present in the installed `lucide-react@1.17.0`.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`), e.g. `@/hooks/use-vapi-conversation`, `@/lib/config`.

---

### Task 1: Extract `useVapiConversation` hook and refactor the existing floating widget

**Files:**
- Create: `hooks/use-vapi-conversation.ts`
- Modify: `components/ui/vapi-widget.tsx` (full rewrite, same visual output)

**Interfaces:**
- Produces (used by every later task that needs a conversation):
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

### Task 2: Create the embedded, auto-opening `EllieHeroPanel`

**Files:**
- Create: `components/ellie/ellie-hero-panel.tsx`

**Interfaces:**
- Consumes: `useVapiConversation` from `@/hooks/use-vapi-conversation` (Task 1), called with no options (no `onCallEnd` needed — panel stays embedded and simply returns to the `'selecting'` mode when a call ends).
- Produces: default export `EllieHeroPanel` (no props), used by Task 3's `EllieHero`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-hero-panel.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MessageCircle, PhoneOff, Send } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-md h-[28rem] overflow-hidden">
      <div className="bg-valle-brown text-white p-4 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <span className="font-semibold">Ellie</span>
        {isSpeaking && mode === 'voice' && (
          <span className="ml-2 text-xs bg-red-500 px-2 py-1 rounded-full animate-pulse">
            Hablando...
          </span>
        )}
      </div>

      {mode === 'selecting' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-valle-cream/30">
          <p className="text-base font-semibold text-valle-dark text-center">
            ¿Cómo querés hablar con Ellie?
          </p>
          <button
            onClick={startVoice}
            className="w-full flex items-center justify-center gap-2 bg-valle-brown hover:bg-valle-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <Mic size={18} />
            Hablar con voz
          </button>
          <button
            onClick={startChat}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            Chatear por texto
          </button>
        </div>
      )}

      {(mode === 'voice' || mode === 'chat') && (
        <>
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
git commit -m "feat: add embedded auto-open EllieHeroPanel component"
```

---

### Task 3: Create `EllieHeader` and `EllieHero`

**Files:**
- Create: `components/ellie/ellie-header.tsx`
- Create: `components/ellie/ellie-hero.tsx`

**Interfaces:**
- Consumes: `EllieHeroPanel` default export from `@/components/ellie/ellie-hero-panel` (Task 2).
- Produces: default exports `EllieHeader` and `EllieHero` (no props), used by Task 7's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the minimal header**

Create `components/ellie/ellie-header.tsx`:

```tsx
import Link from 'next/link';

export default function EllieHeader() {
  return (
    <header className="w-full py-4 px-4">
      <div className="container mx-auto">
        <Link href="/" className="text-xl font-bold text-valle-dark">
          Balcon al Valle
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create the hero section**

Create `components/ellie/ellie-hero.tsx`:

```tsx
import { Headset } from 'lucide-react';
import EllieHeroPanel from './ellie-hero-panel';

export default function EllieHero() {
  return (
    <section className="bg-valle-cream pt-8 pb-16 px-4">
      <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-4 py-1.5 rounded-full">
            🟢 Disponible ahora · Recepcionista 24/7
          </span>

          <div className="relative w-24 h-24 rounded-full bg-valle-brown/10 flex items-center justify-center">
            <Headset size={44} className="text-valle-brown" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-valle-cream animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-valle-dark">
            Reservá tu cabaña o resolvé tus dudas, hablando con Ellie
          </h1>
          <p className="text-lg text-valle-dark/80 max-w-md">
            Nuestra recepcionista virtual te atiende las 24 horas, los 365
            días del año, para consultar disponibilidad y reservar tu cabaña
            al instante.
          </p>
        </div>

        <div className="flex justify-center">
          <EllieHeroPanel />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ellie/ellie-header.tsx components/ellie/ellie-hero.tsx
git commit -m "feat: add EllieHeader and EllieHero sections"
```

---

### Task 4: Create `EllieCapabilities`

**Files:**
- Create: `components/ellie/ellie-capabilities.tsx`

**Interfaces:**
- Produces: default export `EllieCapabilities` (no props), used by Task 7's `app/ellie/page.tsx`.

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
      'Enterate de tarifas, descuentos y promociones vigentes para tu estadía.',
  },
  {
    icon: MapPin,
    title: 'Ubicación y cómo llegar',
    description:
      'Pedile indicaciones para llegar al complejo y recomendaciones de la zona.',
  },
  {
    icon: Home,
    title: 'Servicios y comodidades',
    description:
      'Preguntale qué incluye cada cabaña: capacidad, comodidades y servicios disponibles.',
  },
];

export default function EllieCapabilities() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-16">
          Qué puede hacer Ellie
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {CAPABILITIES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-valle-brown/10 flex items-center justify-center">
                <Icon size={32} className="text-valle-brown" />
              </div>
              <h3 className="text-xl font-semibold text-valle-dark">{title}</h3>
              <p className="text-valle-dark/70">{description}</p>
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

### Task 5: Create `EllieHowItWorks`

**Files:**
- Create: `components/ellie/ellie-how-it-works.tsx`

**Interfaces:**
- Produces: default export `EllieHowItWorks` (no props), used by Task 7's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-how-it-works.tsx`:

```tsx
const STEPS = [
  {
    number: '1',
    title: 'Elegí voz o texto',
    description: 'Hablá o escribile a Ellie, como prefieras.',
  },
  {
    number: '2',
    title: 'Contale qué necesitás',
    description:
      'Fechas, cantidad de personas, la cabaña que te interesa o cualquier duda.',
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
    <section className="bg-valle-cream py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-valle-dark mb-16">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-valle-brown text-white flex items-center justify-center text-2xl font-bold">
                {number}
              </div>
              <h3 className="text-xl font-semibold text-valle-dark">{title}</h3>
              <p className="text-valle-dark/70">{description}</p>
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

### Task 6: Create `EllieClosing`

**Files:**
- Create: `components/ellie/ellie-closing.tsx`

**Interfaces:**
- Consumes: `whatsappUrl` from `@/lib/config` (existing, signature `whatsappUrl(customMessage?: string): string`).
- Produces: default export `EllieClosing` (no props), used by Task 7's `app/ellie/page.tsx`.

- [ ] **Step 1: Create the component**

Create `components/ellie/ellie-closing.tsx`:

```tsx
import Link from 'next/link';
import { whatsappUrl } from '@/lib/config';

export default function EllieClosing() {
  return (
    <section className="bg-valle-brown py-16 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="text-2xl font-bold text-valle-cream mb-4">
          Disponible 24/7, los 365 días del año
        </p>
        <p className="text-valle-sand mb-8">
          ¿Preferís otro medio? Escribinos por WhatsApp o volvé al inicio para
          conocer más sobre nuestras cabañas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-valle-cream underline hover:text-white transition-colors"
          >
            Escribinos por WhatsApp
          </a>
          <Link
            href="/"
            className="text-valle-cream underline hover:text-white transition-colors"
          >
            Volver al inicio
          </Link>
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
git add components/ellie/ellie-closing.tsx
git commit -m "feat: add EllieClosing section"
```

---

### Task 7: Compose the `/ellie` page and do final end-to-end verification

**Files:**
- Create: `app/ellie/page.tsx`

**Interfaces:**
- Consumes: `EllieHeader` (Task 3), `EllieHero` (Task 3), `EllieCapabilities` (Task 4), `EllieHowItWorks` (Task 5), `EllieClosing` (Task 6) — all default exports, no props.

- [ ] **Step 1: Create the page**

Create `app/ellie/page.tsx`:

```tsx
import type { Metadata } from 'next';
import EllieHeader from '@/components/ellie/ellie-header';
import EllieHero from '@/components/ellie/ellie-hero';
import EllieCapabilities from '@/components/ellie/ellie-capabilities';
import EllieHowItWorks from '@/components/ellie/ellie-how-it-works';
import EllieClosing from '@/components/ellie/ellie-closing';

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
      <EllieHeader />
      <EllieHero />
      <EllieCapabilities />
      <EllieHowItWorks />
      <EllieClosing />
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
- The header shows only the "Balcon al Valle" logo, linking back to `/`.
- The hero shows the "Disponible ahora · Recepcionista 24/7" badge, the avatar with the pulsing green indicator, the headline/subheadline, and the embedded panel already showing the "¿Cómo querés hablar con Ellie?" selector — with no button click required to reveal it.
- Click "Hablar con voz" → browser prompts for microphone permission (first time) → call connects (`callStatus` becomes `active`) and live transcript appears as you speak.
- Click "Finalizar llamada" → panel returns to the "¿Cómo querés hablar?" selector (not hidden — stays embedded).
- Click "Chatear por texto" → chat input appears, type a message and press Enter or click send → message appears and Ellie responds.
- Scroll down and confirm "Qué puede hacer Ellie" (4 cards), "Cómo funciona" (3 steps), and the closing band with working WhatsApp and "Volver al inicio" links all render correctly.
- Navigate back to `http://localhost:3000` and repeat the Task 1 Step 4 regression check to confirm the floating widget is unaffected.

- [ ] **Step 5: Commit**

```bash
git add app/ellie/page.tsx
git commit -m "feat: compose /ellie landing page"
```
