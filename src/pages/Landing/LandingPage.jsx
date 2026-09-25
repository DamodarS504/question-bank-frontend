import {
  Navbar,
  Hero,
  Features,
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
        <RolesComparison />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
