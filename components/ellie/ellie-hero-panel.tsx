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
