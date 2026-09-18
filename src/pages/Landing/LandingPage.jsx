/**
 * src/pages/Landing/LandingPage.jsx
 * The public-facing landing page.
 * Composed of all section components — no business logic lives here.
 */
import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  DashboardPreview,
  RolesComparison,
  CTASection,
  Footer,
} from '../../components';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <RolesComparison />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
