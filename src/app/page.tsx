import ScrollFrameHero from '@/components/home/ScrollFrameHero'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import VideoSection from '@/components/home/VideoSection'
import ContactSection from '@/components/home/ContactSection'

export default function Home() {
  return (
    <main>
      <ScrollFrameHero />
      <HeroSection />
      <AboutSection />
      <FeaturedSection />
      <VideoSection />
      <ContactSection />
    </main>
  )
}
