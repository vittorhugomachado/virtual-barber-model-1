import { supabase } from "../lib/supabase";
import type { BarbershopData } from "../types/barbershop.types";

export async function fetchBarbershopBySlug(slug: string): Promise<BarbershopData> {
  const { data, error } = await supabase
    .from("barbershops")
    .select(`
      id, name, slug, phone, description, logo_url, banner_url,
      store_style ( text_color, background_color, primary_color, text_button_color ),
      social_media ( instagram, facebook, tiktok ),
      addresses ( street, number, neighborhood, state, zip_code, complement ),
      services ( id, name, image_url, description, duration_min, price ),
      barbers (
        id, name, avatar_url, description,
        barber_services ( services ( name ) )
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Barbearia não encontrada");

  // Supabase retorna relações 1:1 com UNIQUE FK como objeto direto
  const style = data.store_style as {
    text_color: string;
    background_color: string;
    primary_color: string;
    text_button_color: string;
  } | null;

  if (!style) throw new Error("Estilo da barbearia não configurado");

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    phone: data.phone ?? null,
    description: data.description ?? null,
    logo_url: data.logo_url ?? null,
    banner_url: data.banner_url ?? null,

    style: {
      text_color: style.text_color,
      background_color: style.background_color,
      primary_color: style.primary_color,
      text_button_color: style.text_button_color,
    },

    socialMedia: (data.social_media as { instagram?: string; facebook?: string; tiktok?: string } | null) ?? null,

    address: (data.addresses as {
      street: string;
      number: string;
      neighborhood: string;
      state: string;
      zip_code: string;
      complement?: string | null;
    } | null) ?? null,

    services: ((data.services as { id: string; name: string; image_url?: string | null; description?: string | null; duration_min?: number | null; price?: number | null }[]) ?? []),

    barbers: ((data.barbers as {
      id: string;
      name: string;
      avatar_url?: string | null;
      description?: string | null;
      barber_services: { services: { name: string } | null }[];
    }[]) ?? []).map((barber) => ({
      id: barber.id,
      name: barber.name,
      avatar_url: barber.avatar_url ?? null,
      description: barber.description ?? null,
      services: barber.barber_services
        .map((bs) => bs.services?.name)
        .filter((name): name is string => !!name),
    })),
  };
}
