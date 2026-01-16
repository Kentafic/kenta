import Link from "next/link";
import Partners from "./Partners";
import KentaHero from "../hero/KentaHero";

const HomeBanner = () => {
  return (
    <>
      <KentaHero
        showPartners
        PartnersComp={<Partners />}
      />
    </>
  );
};

export default HomeBanner;