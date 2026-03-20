import { MapPin, Phone } from "lucide-react";
import { AiFillTikTok } from "react-icons/ai";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { useBarbershop } from "../hooks/useBarbershop";

function getSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getMapEmbedUrl({
  latitude,
  longitude,
  query,
}: {
  latitude?: number | null;
  longitude?: number | null;
  query: string;
}) {
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function ContactSection() {
  const { phone, address, socialMedia, style } = useBarbershop();
  const { background_color, primary_color, text_color } = style;
  const instagramUrl = getSafeExternalUrl(socialMedia?.instagram);
  const facebookUrl = getSafeExternalUrl(socialMedia?.facebook);
  const tiktokUrl = getSafeExternalUrl(socialMedia?.tiktok);

  const addressParts = [
    address?.street,
    address?.number,
    address?.neighborhood,
    address?.state,
    address?.zip_code,
    address?.country,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");
  const mapUrl = address
    ? getMapEmbedUrl({
        latitude: address.latitude,
        longitude: address.longitude,
        query: fullAddress,
      })
    : null;

  return (
    <section
      id="contato"
      style={{ backgroundColor: background_color, color: text_color }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        <div className="mb-10 md:mb-14 flex justify-center">
          <h2
            style={{ borderColor: primary_color }}
            className="inline text-[40px] px-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            CONTATO
          </h2>
        </div>

        <div className="gap-8 flex flex-col-reverse lg:flex-row lg:gap-0 lg:items-stretch lg:justify-center">
          {mapUrl && (
            <div
              style={{ borderColor: `${text_color}30` }}
              className="overflow-hidden border min-h-80 w-full max-w-125 mx-auto lg:mx-0"
            >
              <iframe
                title="Mapa da barbearia"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-80 w-full"
              />
            </div>
          )}

          <div
            className="flex flex-col justify-between items-center gap-8 p-6 md:p-8"
          >
            <div className="flex flex-col justify-center space-y-6">
              {fullAddress && (
                <div className="flex items-start gap-4">
                  <MapPin
                    style={{ color: primary_color }}
                    className="mt-1 size-6 shrink-0"
                  />
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest opacity-50">
                      Endereco
                    </p>
                    <p className="text-lgleading-relaxed">
                      {fullAddress}
                    </p>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-4">
                  <Phone
                    style={{ color: primary_color }}
                    className="mt-1 size-6 shrink-0"
                  />
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest opacity-50">
                      Telefone
                    </p>
                    <p
                      className="text-lg transition-opacity hover:opacity-70"
                    >
                      {phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-start w-full gap-6">
              {phone && (
                <a
                  href={`https://wa.me/55${phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  aria-label="WhatsApp"
                >
                  <IoLogoWhatsapp
                    style={{ color: "#39DA56" }}
                    className="size-12"
                  />
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  aria-label="Instagram"
                >
                  <FaInstagram
                    style={{ color: "#FE0CB1" }}
                    className="size-12"
                  />
                </a>
              )}

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  aria-label="Facebook"
                >
                  <FaFacebook
                    style={{ color: "#0266FF" }}
                    className="size-12"
                  />
                </a>
              )}

              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  aria-label="TikTok"
                >
                  <AiFillTikTok
                    style={{ color: "#52D7D7" }}
                    className="size-12"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
