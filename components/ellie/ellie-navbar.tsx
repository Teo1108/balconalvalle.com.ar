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
