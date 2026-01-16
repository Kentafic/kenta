import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useRouter } from "next/router";
import { navData } from "./navData";
import Logo from "/public/images/logo.png";

const NavBar = () => {
  const [windowHeight, setWindowHeight] = useState(0);
  const menus = useRef(null);
  const togglerRef = useRef(null);
  const router = useRouter();

  // =========================
  // Close menu (Bootstrap-safe)
  // =========================
  const hideMenu = async () => {
    const el = menus.current;
    const btn = togglerRef.current;
    if (!el) return;

    try {
      const bootstrap = (await import(
        "bootstrap/dist/js/bootstrap.bundle.min.js"
      )).default;

      const inst =
        bootstrap.Collapse.getInstance(el) ||
        new bootstrap.Collapse(el, { toggle: false });

      inst.hide();
    } catch (e) {
      // fallback
      el.classList.remove("show");
    }

    if (btn) {
      btn.classList.add("collapsed");
      btn.setAttribute("aria-expanded", "false");
    }
  };

  // =========================
  // Header scroll effect
  // =========================
  const navBarTop = () => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.scrollY);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", navBarTop);
    return () => window.removeEventListener("scroll", navBarTop);
  }, []);

  // =========================
  // Auto close menu on route
  // =========================
  useEffect(() => {
    hideMenu(); // đóng ngay khi mount

    const onRoute = () => hideMenu();
    router.events.on("routeChangeComplete", onRoute);

    return () => router.events.off("routeChangeComplete", onRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events]);

  return (
    <header
      className={`header-section ${
        windowHeight > 50 ? "header-fixed animated fadeInDown" : ""
      }`}
    >
      <div className="overlay">
        <div className="container">
          <div className="row d-flex header-area">
            <nav className="navbar navbar-expand-lg navbar-light">
              {/* LOGO */}
              <Link href="/" className="navbar-brand" onClick={hideMenu}>
                <Image src={Logo} className="logo" alt="logo" />
              </Link>

              {/* TOGGLER */}
              <button
                ref={togglerRef}
                className="navbar-toggler collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbar-content"
                aria-controls="navbar-content"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <FaBars />
              </button>

              {/* COLLAPSE */}
              <div
                className="collapse navbar-collapse justify-content-end"
                id="navbar-content"
                ref={menus}
              >
                {/* MENU LIST */}
                <ul className="navbar-nav mr-auto mb-2 mb-lg-0">
                  {navData.map(
                    ({ itm, url, id, dropdown, dropdown_itms }) =>
                      !dropdown ? (
                        <li key={id} className="nav-item">
                          <Link
                            href={url}
                            className="nav-link"
                            onClick={hideMenu}
                          >
                            {itm}
                          </Link>
                        </li>
                      ) : (
                        <li
                          key={id}
                          className="nav-item dropdown main-navbar"
                        >
                          <Link
                            href="/"
                            className="nav-link dropdown-toggle"
                            data-bs-toggle="dropdown"
                            data-bs-auto-close="outside"
                            onClick={(e) => e.preventDefault()}
                          >
                            {itm}
                          </Link>

                          <ul className="dropdown-menu main-menu shadow">
                            {dropdown_itms?.map(
                              ({
                                id,
                                dp_itm,
                                url,
                                sbu_dropdown,
                                sub_items,
                              }) =>
                                !sbu_dropdown ? (
                                  <li key={id}>
                                    <Link
                                      href={url}
                                      className="nav-link"
                                      onClick={hideMenu}
                                    >
                                      {dp_itm}
                                    </Link>
                                  </li>
                                ) : (
                                  <li
                                    key={id}
                                    className="dropend sub-navbar"
                                  >
                                    <Link
                                      href="/"
                                      className="dropdown-item dropdown-toggle"
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"
                                      onClick={(e) =>
                                        e.preventDefault()
                                      }
                                    >
                                      {dp_itm}
                                    </Link>

                                    <ul className="dropdown-menu sub-menu shadow">
                                      {sub_items?.map(
                                        ({ id, url, sub_itm }) => (
                                          <li key={id}>
                                            <Link
                                              href={url}
                                              className="nav-link"
                                              onClick={hideMenu}
                                            >
                                              {sub_itm}
                                            </Link>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </li>
                                )
                            )}
                          </ul>
                        </li>
                      )
                  )}

                  {/* ======================
                      CTA – MOBILE ONLY
                  ====================== */}
                  <li className="nav-item d-lg-none">
                    <Link
                      href="/register"
                      className="cmn-btn mt-2"
                      onClick={hideMenu}
                    >
                      Đối tác liên kết
                    </Link>
                  </li>
                </ul>

                {/* ======================
                    CTA – DESKTOP ONLY
                ====================== */}
                <div className="right-area header-action d-none d-lg-flex align-items-center">
                  <Link
                    href="/register"
                    className="cmn-btn"
                    onClick={hideMenu}
                  >
                    Đối tác liên kết
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
