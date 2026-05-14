import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import ClaimTypes from '@/components/landing/ClaimTypes'
import SquadIntegration from '@/components/landing/SquadIntegration'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <ClaimTypes />
        <SquadIntegration />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}