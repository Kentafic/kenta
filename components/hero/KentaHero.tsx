import React from "react";
import Link from "next/link";

export default function KentaHero({
  showPartners = false,
  PartnersComp = null,
  secondaryAsButton = false,
  secondaryLabel = "Chọn Broker",
  secondaryHref = "/brokers",
  onSecondaryClick,
  className = "",
}: any) {
  return (
    <>
      <section className={`banner-section kenta-home-hero ${className}`}>
        <div className="overlay">
          <div className="banner-content kenta-hero-content">
            <div className="container">
              <div className="row justify-content-start">
                <div className="col-lg-7 col-md-10">
                  <div className="main-content">
                    <div className="top-area section-text justify-content-center">
                      <div className="apple-hero-eyebrow kenta-eyebrow">
                        Bảo mật. Phân tích sâu. Cung cấp giải pháp
                      </div>

                      <h1 className="apple-hero-title">
                        Tái cơ cấu khoản vay bảo đảm bằng tài sản
                      </h1>

                      <p className="apple-hero-desc">
                        Hãy cho chúng tôi biết vấn đề. Chúng tôi sẽ đồng hành cùng bạn!
                      </p>
                    </div>

                    <div className="bottom-area">
                      <Link href="/chatbot" className="cmn-btn">
                        Bắt đầu!
                      </Link>

                      {secondaryAsButton && secondaryLabel && (
                        <button
                          type="button"
                          className="cmn-btn second"
                          onClick={onSecondaryClick}
                          style={{ border: "none" }}
                        >
                          {secondaryLabel}
                        </button>
                      )}

                      {!secondaryAsButton && secondaryLabel && (
                        <Link href={secondaryHref} className="cmn-btn second">
                          {secondaryLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showPartners ? PartnersComp : null}
      </section>
    </>
  );
}
