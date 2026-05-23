import ScrollFrameHero from '@/components/home/ScrollFrameHero'
import HeroSection from '@/components/home/HeroSection'
import ScrollAboutSection from '@/components/home/ScrollAboutSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import VideoSection from '@/components/home/VideoSection'
import ContactSection from '@/components/home/ContactSection'

export default function Home() {
  return (
    <main>
      <ScrollFrameHero />
      <HeroSection />
      <ScrollAboutSection />
      <FeaturedSection />
      <VideoSection />
      <ContactSection />
    </main>
  )
}
