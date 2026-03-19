import { Header } from "./components/header";
import { Section1 } from "./components/section-1";
import { Section2 } from "./components/section-2";
import { Section3 } from "./components/section-3";

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

      <Section1
        backgroundHero={mockData.backgroundHero}
        backgroundColor={mockData.backgroundColor}
        textColor={mockData.textColor}
        primaryColor={mockData.primaryColor}
      />

      <Section2
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        description={mockData.description}
        imageSection2={mockData.aboutImage}
      />
      <Section3
        backgroundColor={mockData.backgroundColor}
        primaryColor={mockData.primaryColor}
        textColor={mockData.textColor}
        services={mockData.services}
      />
    </>
  );
}

export default App;
