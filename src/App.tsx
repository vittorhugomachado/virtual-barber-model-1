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
import { LoadingComponent } from "./components/loading-component";

function BarbershopPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <p style={{ color: "red", padding: 32 }}>Erro: Slug invalido</p>;
  }

  return <BarbershopPageContent key={slug} slug={slug} />;
}

interface BarbershopPageContentProps {
  slug: string;
}

function BarbershopPageContent({ slug }: BarbershopPageContentProps) {
  const [data, setData] = useState<BarbershopData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchBarbershopBySlug(slug)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return <p style={{ color: "red", padding: 32 }}>Erro: {error}</p>;
  if (isLoading) return <LoadingComponent />;
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
