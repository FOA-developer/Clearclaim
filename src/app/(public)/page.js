import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import LogoCloud from '@/components/landing/LogoCloud'
import ClaimTypes from '@/components/landing/ClaimTypes'
import HowItWorks from '@/components/landing/HowItWorks'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <LogoCloud />
        <ClaimTypes />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
