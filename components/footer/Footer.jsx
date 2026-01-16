import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import Social from "../social/Social";
import footer_Illu_left from "/public/images/footer-Illu-left.png";
import footer_Illu_right from "/public/images/footer-Illu-right.png";
import Logo from "/public/images/logo4.png";

const Footer = () => {
  // ✅ Chỉ để ẩn pill trên mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="footer-section">
      <div className="container pt-120">
        {/* 🔹 LOGO + SOCIAL (BÊN TRÁI) */}
        <div className="row cus-mar pt-120 pb-40 wow fadeInUp">
          <div className="col-xl-4 col-lg-4 col-md-6 col-12">
            <div className="footer-box">
              <Link href="/" className="logo">
                <Image src={Logo} alt="logo" />
              </Link>

              <div className="social-link d-flex align-items-center">
                <Social
                  items={[
                    [FaFacebookF, "/"],
                    [FaTwitter, "/"],
                    [FaLinkedinIn, "/"],
                    [FaInstagram, "/"],
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===============================
            FOOTER CENTER PILL (PREMIUM)
            ✅ ẨN TRÊN MOBILE
        ================================ */}
        {!isMobile && (
          <div
            style={{
              position: "relative",
              marginTop: -200,
              marginBottom: 100,
              display: "flex",
              justifyContent: "center",
              transform: "translateX(140px)",
            }}
          >
            <div
              style={{
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(6px)",
                borderRadius: 999,
                padding: "16px 28px",
                boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
                minWidth: 380,
                maxWidth: 540,
                textAlign: "center",
                transform: "translateY(0px)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "3.2px",
                  textTransform: "uppercase",
                  color: "rgba(0, 0, 0, 0.85)",
                  marginBottom: 8,
                }}
              >
                Kenta Finance Connect
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  color: "#000000ff",
                }}
              >
                Mô hình công ty tư vấn khách hàng vay tại khu vực TP.HCM
                <br />
                và các tỉnh lân cận
              </div>
            </div>
          </div>
        )}

        {/* 🔹 FOOTER BOTTOM */}
        <div className="row">
          <div className="col-12">
            <div
              className="footer-bottom"
              style={{
                marginTop: 28, // 👈 hạ line xuống
                paddingTop: 16,
              }}
            >
              <div className="left">
                <p>
                  Copyright © <Link href="index">Kenta</Link> | Designed by{" "}
                  <Link href="https://themeforest.net/user/pixelaxis">Nhất Duy</Link>
                </p>
              </div>
              <div className="right">
                <Link href="/privacy-policy" className="cus-bor">
                  Privacy
                </Link>
                <Link href="terms-conditions">Terms &amp; Condition</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 ILLUSTRATION */}
      <div className="img-area">
        <Image src={footer_Illu_left} className="left" alt="Images" />
        <Image src={footer_Illu_right} className="right" alt="Images" />
      </div>
    </div>
  );
};

export default Footer;
