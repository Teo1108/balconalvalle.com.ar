'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, MessageCircle, PhoneOff, Send, X, Loader2 } from 'lucide-react';

const VAPI_PUBLIC_KEY = '77ed4e9c-4c57-4c5f-9ca2-d3482da6dcf3';
const ASSISTANT_ID = 'a41bb4c0-7a79-4789-b26f-7dfcc86ce3f6';

type WidgetMode = 'idle' | 'selecting' | 'voice' | 'chat';
type CallStatus = 'idle' | 'connecting' | 'active';
type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isPartial?: boolean;
};

export default function VapiWidget() {
  const [widgetMode, setWidgetMode] = useState<WidgetMode>('idle');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');

  const vapiRef = useRef<Vapi | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      setCallStatus('active');
    });

    vapi.on('call-end', () => {
      setCallStatus('idle');
      setWidgetMode('idle');
      setMessages([]);
      setPartialTranscript('');
    });

    vapi.on('error', () => {
      setCallStatus('idle');
      setWidgetMode('idle');
    });

    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript') {
        const { role, transcript, transcriptType } = msg;

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const handleStartTalk = async () => {
    if (!vapiRef.current) return;
    setWidgetMode('voice');
    setCallStatus('connecting');
    setMessages([]);
    vapiRef.current.start(ASSISTANT_ID);
  };

  const handleStartChat = async () => {
    if (!vapiRef.current) return;
    setWidgetMode('chat');
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

  const handleSendChat = () => {
    if (!chatInput.trim() || !vapiRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      isPartial: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    vapiRef.current.send({
      type: 'add-message',
      message: {
        role: 'user',
        content: chatInput,
      },
      triggerResponseEnabled: true,
    });

    setChatInput('');
  };

  const handleEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const handleClose = () => {
    if (callStatus === 'active') {
      handleEndCall();
    } else {
      setWidgetMode('idle');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {widgetMode === 'idle' && (
        <>
          {callStatus === 'idle' && (
            <span className="bg-valle-dark text-valle-cream text-sm px-3 py-1.5 rounded-full shadow-md">
              Hablar con Ellie
            </span>
          )}
          <button
            onClick={() => setWidgetMode('selecting')}
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
              <MessageCircle size={28} className="text-white" />
            )}
          </button>
        </>
      )}

      {widgetMode === 'selecting' && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 w-56">
          <p className="text-sm font-semibold text-valle-dark text-center">
            ¿Cómo querés hablar?
          </p>
          <button
            onClick={handleStartTalk}
            className="flex items-center justify-center gap-2 bg-valle-brown hover:bg-valle-dark text-white font-semibold py-2 rounded-lg transition-colors"
          >
            <Mic size={18} />
            Hablar con voz
          </button>
          <button
            onClick={handleStartChat}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            Chatear por texto
          </button>
          <button
            onClick={() => setWidgetMode('idle')}
            className="text-sm text-valle-dark/60 hover:text-valle-dark"
          >
            Cerrar
          </button>
        </div>
      )}

      {(widgetMode === 'voice' || widgetMode === 'chat') && (
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-80 h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-valle-brown text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold">Ellie</span>
              {isSpeaking && widgetMode === 'voice' && (
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

          {/* Messages */}
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

          {/* Footer */}
          <div className="border-t border-valle-sand/30 p-3 bg-white">
            {widgetMode === 'chat' && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Escribí tu mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
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
              onClick={handleEndCall}
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
