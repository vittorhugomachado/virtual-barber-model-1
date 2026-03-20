import { BookingProvider } from "./components/booking-modal";
import { ContactSection } from "./components/contact-section";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { HoursSection } from "./components/hours-section";
import { ServicesSection } from "./components/service-section";
import { TeamSection } from "./components/team-section";

export default function VintagePage() {
  return (
    <BookingProvider>
      <Header />
      <HeroSection />
      <HoursSection />
      <TeamSection />
      <ServicesSection />
      <ContactSection />
    </BookingProvider>
  );
}
