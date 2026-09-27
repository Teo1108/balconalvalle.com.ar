import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function HeroSection() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/v1790534583/BAVG-homemini.jpg"
      bgImageSrc="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/v1790533721/bavg-home.jpg"
      title="Cabañas Valle Grande"
      date="San Rafael, Mendoza"
      scrollToExpand="Scroll para descubrir"
      textBlend
    />
  );
}
