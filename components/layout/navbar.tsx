'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Cabañas', href: '#cabanas' },
  { label: 'Galería', href: '#galeria' },
  { label: 'Ubicación', href: '#ubicacion' },
  { label: 'Contacto', href: '#contacto' },
];

function skipHero() {
  window.dispatchEvent(new CustomEvent('skipHeroExpansion'));
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-valle-cream/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-valle-dark">
          Balcon al Valle
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={skipHero}
              className="text-valle-dark hover:text-valle-brown transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          className="md:hidden text-valle-dark"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menú"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-valle-cream/95 backdrop-blur-md px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-valle-dark hover:text-valle-brown font-medium text-lg"
              onClick={() => { skipHero(); setIsOpen(false); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
