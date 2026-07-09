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
