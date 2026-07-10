import Image from 'next/image';

export default function EllieFooter() {
  return (
    <footer className="bg-ellie-surface-container-lowest border-t border-ellie-outline-variant/40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 px-4 md:px-8 py-12">
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/images/BalconAlVallewb.jpg"
              alt="Balcón al Valle"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-ellie-serif text-lg font-bold text-ellie-primary">
              Balcón al Valle
            </span>
          </div>
          <p className="text-ellie-on-surface-variant text-sm max-w-xs">
            Experiencias de montaña diseñadas para el descanso y la reconexión
            con la naturaleza.
          </p>
        </div>

        <div className="flex gap-6">
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Términos
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Privacidad
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Contacto
          </a>
          <a href="#" className="text-ellie-on-surface-variant hover:text-ellie-primary underline text-sm">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
