import { Header } from "./components/header";
import { HeroSection } from "./components/hero-section";
import { AboutSection } from "./components/about-section";
import { ServicesSection } from "./components/service-section";

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
  services: [
    {
      name: "Corte",
      image: "/service1.png",
    },
    {
      name: "Barba",
      image: "/service2.png",
    },
    {
      name: "Combo",
      image: "/service3.png",
    },
    {
      name: "Combo",
      image: "/service4.png",
    },
    {
      name: "Combo",
      image: "/service5.png",
    },
    {
      name: "Combo",
      image: "/service6.png",
    },
  ],
};

function App() {
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
    </>
  );
}

export default App;
