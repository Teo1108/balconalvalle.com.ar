'use client';

import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, PhoneOff, Loader2 } from 'lucide-react';

import { VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID as ASSISTANT_ID } from '@/lib/vapi-config';

type CallStatus = 'idle' | 'connecting' | 'active';

export default function VapiButton() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
    const vapi = vapiRef.current;

    vapi.on('call-start', () => setStatus('active'));
    vapi.on('call-end', () => setStatus('idle'));
    vapi.on('error', () => setStatus('idle'));

    return () => {
      vapi.stop();
    };
  }, []);

  const handleClick = () => {
    if (!vapiRef.current) return;
    if (status === 'active') {
      vapiRef.current.stop();
      setStatus('idle');
    } else if (status === 'idle') {
      setStatus('connecting');
      vapiRef.current.start(ASSISTANT_ID);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {status === 'idle' && (
        <span className="bg-valle-dark text-valle-cream text-sm px-3 py-1.5 rounded-full shadow-md">
          Hablar con Ellie
        </span>
      )}
      {status === 'active' && (
        <span className="bg-valle-dark text-valle-cream text-sm px-3 py-1.5 rounded-full shadow-md">
          En llamada...
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={status === 'connecting'}
        aria-label={status === 'active' ? 'Finalizar llamada' : 'Hablar con Ellie'}
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          status === 'active'
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : status === 'connecting'
            ? 'bg-valle-sand cursor-not-allowed'
            : 'bg-valle-brown hover:bg-valle-dark'
        }`}
      >
        {status === 'connecting' ? (
          <Loader2 size={28} className="text-white animate-spin" />
        ) : status === 'active' ? (
          <PhoneOff size={28} className="text-white" />
        ) : (
          <Mic size={28} className="text-white" />
        )}
      </button>
    </div>
  );
}
