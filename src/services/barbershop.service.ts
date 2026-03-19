import { supabase } from "../lib/supabase";
import type { BarbershopData } from "../types/barbershop.types";

type StoreStyleRow = {
  text_color: string;
  background_color: string;
  primary_color: string;
  text_button_color: string;
};

type SocialMediaRow = {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
};

type AddressRow = {
  street: string;
  number: string;
  neighborhood: string;
  state: string;
  zip_code: string;
  complement?: string | null;
};

type ServiceRow = {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
  duration_min?: number | null;
  price?: number | null;
};

type OpeningHourRow = {
  id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  period_order: number;
  is_open: boolean;
};

type BarberServiceRelation = {
  services?: { name?: string | null } | { name?: string | null }[] | null;
};

type BarberRow = {
  id: string;
  name: string;
  avatar_url?: string | null;
  description?: string | null;
  barber_services?: BarberServiceRelation[] | null;
};

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getArrayRelation<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

export async function fetchBarbershopBySlug(slug: string): Promise<BarbershopData> {
  const { data, error } = await supabase
    .from("barbershops")
    .select(`
      id, name, slug, phone, description, logo_url, banner_url,
      store_style ( text_color, background_color, primary_color, text_button_color ),
      social_media ( instagram, facebook, tiktok ),
      addresses ( street, number, neighborhood, state, zip_code, complement ),
      opening_hours ( id, day_of_week, opens_at, closes_at, period_order, is_open ),
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
  if (!data) throw new Error("Barbearia nao encontrada");

  const style = getSingleRelation(data.store_style as StoreStyleRow | StoreStyleRow[] | null);

  if (!style) throw new Error("Estilo da barbearia nao configurado");

  const socialMedia = getSingleRelation(
    data.social_media as SocialMediaRow | SocialMediaRow[] | null,
  );
  const address = getSingleRelation(data.addresses as AddressRow | AddressRow[] | null);
  const openingHours = getArrayRelation(
    data.opening_hours as OpeningHourRow | OpeningHourRow[] | null,
  );
  const services = getArrayRelation(data.services as ServiceRow | ServiceRow[] | null);
  const barbers = getArrayRelation(data.barbers as BarberRow | BarberRow[] | null);

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
    socialMedia,
    address,
    openingHours: openingHours
      .filter((item) => item.day_of_week >= 0 && item.day_of_week <= 6)
      .sort((a, b) => a.day_of_week - b.day_of_week || a.period_order - b.period_order),
    services,
    barbers: barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
      avatar_url: barber.avatar_url ?? null,
      description: barber.description ?? null,
      services: (barber.barber_services ?? [])
        .flatMap((relation) => getArrayRelation(relation.services))
        .map((service) => service.name)
        .filter((name): name is string => !!name),
    })),
  };
}
