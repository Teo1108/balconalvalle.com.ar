import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function HeroSection() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero_g2iqiz"
      bgImageSrc="https://res.cloudinary.com/davjgtfy0/image/upload/f_auto,q_auto/hero-bg_fuyzqg"
      title="Balcon al Valle"
      date="Valle Grande"
      scrollToExpand="Scroll para descubrir"
      textBlend
    />
  );
}
