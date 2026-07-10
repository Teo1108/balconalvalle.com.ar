import Image from 'next/image';

export default function EllieMountainBanner() {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 pb-20">
      <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-ellie-primary/50 to-transparent z-10" />
        <Image
          src="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero-bg_fuyzqg"
          alt="Vista panorámica del valle al amanecer"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-8 left-8 z-20">
          <p className="font-ellie-serif text-2xl md:text-3xl text-white mb-2">
            Tu refugio te espera
          </p>
          <p className="text-white/80">
            Encontrá la paz que buscás en Balcón al Valle.
          </p>
        </div>
      </div>
    </section>
  );
}
