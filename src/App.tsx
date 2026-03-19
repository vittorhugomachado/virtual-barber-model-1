import { useEffect, useState } from "react";
import { useParams, Routes, Route } from "react-router-dom";
import { BarberProvider } from "./context/barber-provider";
import { fetchBarbershopBySlug } from "./services/barbershop.service";
import type { BarbershopData } from "./types/barbershop.types";
import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { AboutSection } from "./components/about-section";
import { ServicesSection } from "./components/service-section";
import { TeamSection } from "./components/team-section";
import { ContactSection } from "./components/contact-section";

function BarbershopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<BarbershopData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchBarbershopBySlug(slug)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [slug]);

  if (error) return <p style={{ color: "red", padding: 32 }}>Erro: {error}</p>;
  if (!data) return null;

  return (
    <BarberProvider data={data}>
      <Header />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <ContactSection />
    </BarberProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/:slug" element={<BarbershopPage />} />
    </Routes>
  );
}

export default App;
