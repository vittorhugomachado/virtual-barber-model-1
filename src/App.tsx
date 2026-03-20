import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { LoadingComponent } from "./components/loading-component";
import { BarberProvider } from "./context/barber-provider";
import { fetchBarbershopBySlug } from "./services/barbershop.service";
import type { BarbershopData } from "./types/barbershop.types";

const VintagePage = lazy(() => import("./templates/vintage"));

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
  if (isLoading) return <LoadingComponent tailwindClass={"h-screen"} backgroundColor={"black"} color={"white"} text={"Carregando"} />;
  if (!data) return null;

  return (
    <BarberProvider data={data}>
      <Suspense fallback={<LoadingComponent tailwindClass={"h-screen"} backgroundColor={"black"} color={"white"} text={"Carregando"} />}>
        <VintagePage />
        {/* Quando novos templates forem criados:
          {data.template === "modern" && <ModernPage />}
          {data.template === "minimalist" && <MinimalistPage />}
        */}
      </Suspense>
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
