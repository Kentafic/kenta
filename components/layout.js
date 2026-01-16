import { useRouter } from "next/router";
import Footer from "./footer/Footer";
import NavBar from "./navBar/NavBar";
import Preloader from "./preloader/Preloader";
import Ready from "./ready/Ready";
import ScrollToTop from "./scrollToTop/ScrollToTop";

const Layout = ({ children }) => {
   const router = useRouter(); 
  return (
    <>
      <NavBar />

      {/* ✅ Fade chạy lại mỗi lần đổi route */}
      <main key={router.asPath} className="apple-route-fade">
        {children}
      </main>

      <Ready />
      <Footer />
      <ScrollToTop />
      <Preloader />
    </>
  );
};

export default Layout;
