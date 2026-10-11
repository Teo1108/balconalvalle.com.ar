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
  isThinking: boolean;
  blockedMessage: string | null;
  startVoice: () => void;
  startChat: () => void;
  sendMessage: (content: string) => void;
  endCall: () => void;
}

const VAPI_CHAT_URL = 'https://api.vapi.ai/chat/web';
const CHAT_ERROR_MESSAGE =
  'Perdón, tuve un problema para responder. Probá de nuevo o escribinos por WhatsApp.';

const RATE_LIMIT_MESSAGE =
  'Estamos recibiendo muchas solicitudes desde tu conexión. Probá de nuevo en un rato.';

export function useVapiConversation(
  options: UseVapiConversationOptions = {}
): UseVapiConversationResult {
  const { onCallEnd } = options;

  const [mode, setMode] = useState<ConversationMode>('selecting');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const vapiRef = useRef<Vapi | null>(null);
  // Chat de texto: usa la API de chat de Vapi (sin llamada, sin micrófono ni voz).
  const chatTokenRef = useRef<string | null>(null);
  const chatSessionRef = useRef<string | null>(null);
  const onCallEndRef = useRef(onCallEnd);
  onCallEndRef.current = onCallEnd;

  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  function attachListeners(vapi: Vapi) {
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
      setMessages([]);
      setPartialTranscript('');
      onCallEndRef.current?.();
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
  }

  // Asks our backend whether this conversation is allowed (rate-limit gate)
  // and, if so, mints a short-lived Vapi token scoped to this assistant/origin.
  // Returns null when blocked.
  async function getAuthKey(): Promise<string | null> {
    let authKey: string = VAPI_PUBLIC_KEY;

    try {
      const res = await fetch('/api/start-call', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.allowed === false) return null;
        if (data.token) authKey = data.token;
      }
      // non-OK response: fail open with the static public key
    } catch {
      // backend unreachable: fail open with the static public key
    }
    return authKey;
  }

  // A fresh Vapi client is created per call since the auth token only lives
  // for the lifetime of one call.
  async function prepareCall(): Promise<boolean> {
    const authKey = await getAuthKey();
    if (!authKey) return false;

    const vapi = new Vapi(authKey);
    attachListeners(vapi);
    vapiRef.current = vapi;
    return true;
  }

  const startVoice = async () => {
    setMode('voice');
    setCallStatus('connecting');
    setMessages([]);
    setBlockedMessage(null);

    const allowed = await prepareCall();
    if (!allowed) {
      setCallStatus('idle');
      setMode('selecting');
      setBlockedMessage(RATE_LIMIT_MESSAGE);
      return;
    }

    vapiRef.current!.start(ASSISTANT_ID);
  };

  const startChat = async () => {
    setMode('chat');
    setCallStatus('connecting');
    setMessages([]);
    setBlockedMessage(null);
    chatSessionRef.current = null;

    const authKey = await getAuthKey();
    if (!authKey) {
      setCallStatus('idle');
      setMode('selecting');
      setBlockedMessage(RATE_LIMIT_MESSAGE);
      return;
    }

    chatTokenRef.current = authKey;
    setCallStatus('active');
  };

  const addAssistantMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role: 'assistant', text, isPartial: false },
    ]);
  };

  const sendChatMessage = async (content: string) => {
    setIsThinking(true);
    try {
      const res = await fetch(VAPI_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chatTokenRef.current}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID,
          input: content,
          ...(chatSessionRef.current ? { sessionId: chatSessionRef.current } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Vapi chat ${res.status}`);
      const data: { sessionId?: string; output?: { role: string; content?: unknown }[] } =
        await res.json();
      if (data.sessionId) chatSessionRef.current = data.sessionId;

      const replies = (data.output ?? []).filter(
        (m): m is { role: string; content: string } =>
          m.role === 'assistant' && typeof m.content === 'string' && m.content.trim() !== ''
      );
      if (replies.length === 0) throw new Error('Vapi chat sin respuesta');
      replies.forEach((m) => addAssistantMessage(m.content));
    } catch (err) {
      console.error('[ellie chat]', err);
      addAssistantMessage(CHAT_ERROR_MESSAGE);
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    if (mode === 'chat' ? !chatTokenRef.current : !vapiRef.current) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: content,
      isPartial: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    if (mode === 'chat') {
      void sendChatMessage(content);
      return;
    }

    vapiRef.current!.send({
      type: 'add-message',
      message: {
        role: 'user',
        content,
      },
      triggerResponseEnabled: true,
    });
  };

  // La sesión de chat en Vapi expira sola; cerrarla explícitamente (sessionEnd)
  // tarda más de un minuto y no aporta nada.
  const endChat = () => {
    chatTokenRef.current = null;
    chatSessionRef.current = null;
    setIsThinking(false);
    setCallStatus('idle');
    setMode('selecting');
    setMessages([]);
    onCallEndRef.current?.();
  };

  const endCall = () => {
    if (mode === 'chat') {
      endChat();
      return;
    }
    vapiRef.current?.stop();
  };

  return {
    mode,
    callStatus,
    messages,
    partialTranscript,
    isSpeaking,
    isThinking,
    blockedMessage,
    startVoice,
    startChat,
    sendMessage,
    endCall,
  };
}
