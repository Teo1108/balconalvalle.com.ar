import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export default function HeroSection() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="/images/hero.jpg"
      bgImageSrc="/images/hero-bg.jpg"
      title="Balcon al Valle"
      date="Valle Grande"
      scrollToExpand="Scroll para descubrir"
      textBlend
    />
  );
}
