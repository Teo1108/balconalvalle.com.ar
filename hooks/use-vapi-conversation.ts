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
