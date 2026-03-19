import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { AboutSection } from "./components/about-section";
import { ServicesSection } from "./components/service-section";
import { TeamSection } from "./components/team-section";
import { ContactSection } from "./components/contact-section";

const mockData = {
  barbershopName: "Freshcut",
  textColor: "#FFFFFF",
  textButtonColor: "#000000",
  backgroundColor: "#000000",
  primaryColor: "#CF2820",
  backgroundHero: "/hero.png",
  aboutImage: "/image-about.png",
  description:
    "lorem fewf fwefewf wefwef ef vdfv f bvvbrejvnre ever evrevervv ev rv evervev vevevrver rververvvr erervvrevevfv evevvfdvfvvervre erve v evervevve erververvrev ",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  phone: "51 98056-0089",
  socialMedia: {
    instagram: "https://instagram.com/freshcut",
    whatsapp: "5511999999999",
    facebook: "https://facebook.com/freshcut",
    tiktok: "https://tiktok.com/@freshcut",
  },
  services: [
    { name: "Corte", image: "/service1.png" },
    { name: "Barba", image: "/service2.png" },
    { name: "Combo", image: "/service3.png" },
    { name: "Combo", image: "/service4.png" },
    { name: "Combo", image: "/service5.png" },
    { name: "Combo", image: "/service6.png" },
  ],
  professionals: [
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
    { name: "Vitor", photo: "/service1.png", services: ["corte", "degrade", "black power", "corte", "degrade", "black power"] },
  ],
};

function App() {

  console.log(mockData)
  return (
    <>
      <Header
        barbershopName={mockData.barbershopName}
        backgroundColor={mockData.backgroundColor}
        textButtonColor={mockData.textButtonColor}
        textColor={mockData.textColor}
        primaryColor={mockData.primaryColor}
        description={mockData.description}
      />

      <HeroSection
        backgroundHero={mockData.backgroundHero}
        backgroundColor={mockData.backgroundColor}
        textColor={mockData.textColor}
        primaryColor={mockData.primaryColor}
      />

      <AboutSection
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        description={mockData.description}
        imageAboutSection={mockData.aboutImage}
      />
      <ServicesSection
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        services={mockData.services}
      />
      <TeamSection
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        professionals={mockData.professionals}
      />
     <ContactSection
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        address={mockData.address}
        phone={mockData.phone}
        socialMedia={mockData.socialMedia}
      />
    </>
  );
}

export default App;
