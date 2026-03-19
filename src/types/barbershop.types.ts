// Espelha: public.store_style
export interface StoreStyle {
  text_color: string;
  background_color: string;
  primary_color: string;
  text_button_color: string;
}

// Espelha: public.social_media (whatsapp vem de barbershops.phone)
export interface SocialMedia {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
}

// Espelha: public.services
export interface Service {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
  duration_min?: number | null;
  price?: number | null;
}

// Espelha: public.barbers + public.barber_services
export interface Barber {
  id: string;
  name: string;
  avatar_url?: string | null;
  description?: string | null;
  services: string[]; // nomes dos serviços via barber_services join
}

// Espelha: public.addresses
export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  state: string;
  zip_code: string;
  complement?: string | null;
}

// Dados completos da barbearia para o contexto
export interface BarbershopData {
  // public.barbershops
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;

  // public.store_style
  style: StoreStyle;

  // public.social_media
  socialMedia?: SocialMedia | null;

  // public.addresses
  address?: Address | null;

  // public.services
  services: Service[];

  // public.barbers
  barbers: Barber[];
}