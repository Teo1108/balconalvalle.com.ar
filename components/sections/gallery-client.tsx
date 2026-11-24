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
                alt={`Foto ${i + 1} de la ${active} en Valle Grande, San Rafael`}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {i === visible.length - 1 && photos.length > visible.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-valle-cream text-2xl font-bold">
                  +{photos.length - visible.length}
                </div>
              )}
            </div>
          ))}
        </div>

        {photos.length > visible.length && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={() => setLightboxIndex(visible.length)}
              className="px-8 py-3 rounded-full bg-valle-brown text-valle-cream font-semibold shadow-lg hover:brightness-110 transition"
            >
              Ver las {photos.length} fotos
            </button>
          </div>
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
