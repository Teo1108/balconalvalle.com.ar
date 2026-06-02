'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Props {
  cabania1: string[];
  cabania2: string[];
}

const TABS = ['Cabaña 1', 'Cabaña 2'] as const;
type TabKey = (typeof TABS)[number];

export default function GalleryClient({ cabania1, cabania2 }: Props) {
  const [active, setActive] = useState<TabKey>('Cabaña 1');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const photos = active === 'Cabaña 1' ? cabania1 : cabania2;
  const visible = photos.slice(0, 10);
  const slides = photos.map((src) => ({ src }));

  return (
    <section id="galeria" className="bg-valle-dark py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-valle-cream text-center mb-4">
          Galería
        </h2>
        <p className="text-center text-valle-sand mb-10">
          Un vistazo al paraíso que te espera
        </p>

        <div className="flex justify-center gap-3 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                active === tab
                  ? 'bg-valle-brown text-valle-cream'
                  : 'border border-valle-sand/50 text-valle-sand hover:border-valle-cream hover:text-valle-cream'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {visible.map((src, i) => (
            <div
              key={src}
              onClick={() => setLightboxIndex(i)}
              className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Foto ${i + 1}`}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>

        {photos.length > 10 && (
          <p
            onClick={() => setLightboxIndex(0)}
            className="text-center text-valle-sand/70 text-sm cursor-pointer hover:text-valle-sand transition-colors mt-2"
          >
            + {photos.length - 10} fotos más — clickeá para ver todas
          </p>
        )}

        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={slides}
        />
      </div>
    </section>
  );
}
