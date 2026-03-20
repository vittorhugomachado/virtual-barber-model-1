export interface StoreStyle {
  text_color: string;
  background_color: string;
  primary_color: string;
  text_button_color: string;
}

export interface SocialMedia {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
}

export interface Service {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
  duration_min?: number | null;
  price?: number | null;
}

export interface Barber {
  id: string;
  name: string;
  avatar_url?: string | null;
  description?: string | null;
  is_active: boolean;
  serviceIds: string[];
  services: string[];
}

export interface Address {
  country?: string | null;
  street: string;
  number: string;
  neighborhood: string;
  state: string;
  zip_code: string;
  complement?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OpeningHour {
  id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  period_order: number;
  is_open: boolean;
}

export interface BarbershopData {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  style: StoreStyle;
  socialMedia?: SocialMedia | null;
  address?: Address | null;
  services: Service[];
  barbers: Barber[];
  openingHours: OpeningHour[];
}
