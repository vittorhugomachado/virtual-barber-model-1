import { MapPin, Phone } from "lucide-react";
import { AiFillTikTok } from "react-icons/ai";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";

interface SocialMedia {
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
}

interface ContactSectionProps {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
  address: string;
  phone: string;
  socialMedia: SocialMedia | undefined;
}

export function ContactSection({
  backgroundColor,
  primaryColor,
  textColor,
  address,
  phone,
  socialMedia,
}: ContactSectionProps) {
  return (
    <section
      id="contato"
      style={{ backgroundColor, color: textColor }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        {/* TÍTULO */}
        <div className="mb-10 md:mb-14 flex justify-center">
          <h2
            style={{ borderColor: primaryColor }}
            className="inline text-[40px] px-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            CONTATO
          </h2>
        </div>

        <div className="flex flex-col items-center gap-4 md:gap-12">
          {/* ENDEREÇO E TELEFONE */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-4">
              <MapPin
                style={{ color: primaryColor }}
                className="size-6 mt-1 shrink-0"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">
                  Endereço
                </p>
                <p className="text-lg font-semibold">{address}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Phone
                style={{ color: primaryColor }}
                className="size-6 mt-1 shrink-0"
              />
              <div className="w-full">
                <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">
                  Telefone
                </p>
                <a
                  href={`tel:${phone}`}
                  className="text-lg font-semibold hover:opacity-70 transition-opacity"
                >
                  {phone}
                </a>
              </div>
            </div>
          </div>

          {/* REDES SOCIAIS */}
          <div className="flex flex-wrap gap-6">
            {socialMedia?.instagram && (
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <FaInstagram style={{ color: "#FE0CB1" }} className="size-12" />
              </a>
            )}

            {socialMedia?.whatsapp && (
              <a
                href={`https://wa.me/${socialMedia.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <IoLogoWhatsapp
                  style={{ color: "#39DA56" }}
                  className="size-12"
                />
              </a>
            )}

            {socialMedia?.facebook && (
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <FaFacebook style={{ color: "#0266FF" }} className="size-12" />
              </a>
            )}

            {socialMedia?.tiktok && (
              <a
                href={socialMedia.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <AiFillTikTok style={{ color: "#52D7D7" }} className="size-12" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
