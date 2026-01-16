
import { useRouter } from "next/router";
import KentaHero from "../components/hero/KentaHero";
import AppleContainer from "../components/layout/AppleContainer";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";


// ===== BROKER ITEM =====

type Broker = {
  id: string;
  initials: string;
  color: string;
  name: string;
  zalo: string;
  role: string;
  region: string;
  exp: string;
  address: string;
  desc: string;
  rating: string;
  reviews: number;
  tags: string[];
   avatar?: string; // ✅ thêm dòng này
};




/**
 * SequenceTypewriter (stable loop)
 */
function SequenceTypewriter({
  steps = [],
  startDelay = 150,
  charDelay = 60,
  pauseAfter = 600,
  deleteSpeedFactor = 0.6,
  cursor = "|",
  loop = false,
  hideCursorOnComplete = true,
  style = {},
  textcolor = "#1e2735",
}: any) {
  const [displayed, setDisplayed] = useState("");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const mounted = useRef(true);

  const typeTimerRef = useRef<any>(null);
  const deleteTimerRef = useRef<any>(null);
  const pauseTimerRef = useRef<any>(null);
  const startTimerRef = useRef<any>(null);

  useEffect(() => {
    mounted.current = true;

    startTimerRef.current = setTimeout(() => {
      if (!mounted.current) return;
      setStepIndex(0);
    }, startDelay);

    return () => {
      mounted.current = false;
      clearTimeout(startTimerRef.current);
      clearInterval(typeTimerRef.current);
      clearInterval(deleteTimerRef.current);
      clearTimeout(pauseTimerRef.current);
    };
  }, [startDelay]);

  useEffect(() => {
    if (stepIndex === null) return;

    if (!steps || steps.length === 0 || stepIndex < 0 || stepIndex >= steps.length) {
      setDisplayed("");
      return;
    }

    const step = steps[stepIndex];
    const text = step.text ?? "";
    const reverse = !!step.reverse;

    clearInterval(typeTimerRef.current);
    clearInterval(deleteTimerRef.current);
    clearTimeout(pauseTimerRef.current);

    let i = 0;
    setDisplayed("");

    typeTimerRef.current = setInterval(() => {
      if (!mounted.current) return;
      i++;
      setDisplayed(text.slice(0, i));

      if (i >= text.length) {
        clearInterval(typeTimerRef.current);

        pauseTimerRef.current = setTimeout(() => {
          if (!mounted.current) return;

          if (reverse) {
            let j = text.length;
            deleteTimerRef.current = setInterval(() => {
              if (!mounted.current) return;
              j--;
              setDisplayed(text.slice(0, j));

              if (j <= 0) {
                clearInterval(deleteTimerRef.current);
                const next = stepIndex + 1;

                if (next < steps.length) setStepIndex(next);
                else if (loop) setStepIndex(0);
                else setStepIndex(null);
              }
            }, Math.max(12, charDelay * deleteSpeedFactor));
          } else {
            const next = stepIndex + 1;

            if (next < steps.length) setStepIndex(next);
            else if (loop) setStepIndex(0);
            else setStepIndex(null);
          }
        }, pauseAfter);
      }
    }, charDelay);

    return () => {
      clearInterval(typeTimerRef.current);
      clearInterval(deleteTimerRef.current);
      clearTimeout(pauseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, steps, charDelay, pauseAfter, deleteSpeedFactor, loop]);

  const running = stepIndex !== null;

  return (
    <span
      suppressHydrationWarning
      style={{ display: "inline-block", color: textcolor, ...style }}
    >
      <span style={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>
        {displayed}
      </span>

      <span
        aria-hidden
        style={{
          fontSize: "inherit",
          marginLeft: 6,
          display: running ? "inline-block" : hideCursorOnComplete ? "none" : "inline-block",
          color: "inherit",
          opacity: running ? 1 : hideCursorOnComplete ? 0 : 0.7,
          transition: "opacity 160ms linear",
        }}
      >
        {cursor}
      </span>
    </span>
  );
}

/* ================= BrokersPage (main) ================= */

export default function BrokersPage() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // ✅ Ép đóng menu khi vào /brokers
  useEffect(() => {
    const closeMenu = () => {
      document
        .querySelectorAll(".navbar-collapse.show")
        .forEach((el) => el.classList.remove("show"));

      document
        .querySelectorAll('[aria-expanded="true"]')
        .forEach((el) => el.setAttribute("aria-expanded", "false"));
    };

    closeMenu();

    const onDone = () => closeMenu();
    router.events?.on("routeChangeComplete", onDone);

    return () => {
      router.events?.off("routeChangeComplete", onDone);
    };
  }, [router.events]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

 return (
  <div
    className="apple-fade-page brokers-page"
    style={{
      width: "100%",
      background: "#f5f7fb",
      fontFamily:
        "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    }}
  >
    {/* TOP GAP + WHITE STRIP (render luôn, desktop/mobile xử lý bằng CSS) */}
    <div className="brokers-top-gap" />
    <BrokersWhiteStrip />

    {/* ===== BROKERS CONTENT ===== */}
    <section className="brokers-section">
      <AppleContainer
        variant="wide"
        className={!isMobile ? "apple-container--brokers-desktop" : ""}
      >
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </AppleContainer>
    </section>
  </div>
);
}

function DesktopLayout() {
  return (
    <div className="brokers-desktop-grid">
      <div className="brokers-list-col">
        <div className="brokers-grid">
          <BrokerList/>
        </div>
      </div>
    </div>
  );
}

function MobileLayout() {
  return (
    <div className="brokers-mobile">
      {/* HERO */}
      <div className="apple-bleed">
        <div className="brokers-hero-card">
          <KentaHero
            showPartners={false}
            secondaryAsButton={false}
            secondaryLabel=""
            className="kenta-hero--compact"
          />
        </div>
      </div>

      {/* LIST */}
      <div id="broker-list">
        <p className="brokers-subtitle">
  Đội ngũ chuyên gia tư vấn tại Kenta
</p>
      <BrokerList horizontal />
      </div>
    </div>
  );
}

/* ---------------------- BROKER LIST + ITEM ---------------------- */

function BrokerList({ horizontal = false }: { horizontal?: boolean }) {
  const brokers = [
    {
      id: "b1",
      avatar: "/images/avatar/nhi.png", 
      initials: "VA",
      color: "#0ea5e9",
      name: "Đỗ Nguyễn Yến Nhi",
      zalo: "0902684539",
      role: "Giám đốc chi nhánh",
      region: "Khu Nam và TT TP.HCM",
      exp: "17 năm",
      address: "Món vay: Lớn hơn 10 tỷ",
      desc: "Chuyên cấu trúc lại các món vay lớn và phức tạp đối cá nhân và doanh nghiệp",
      rating: "5.0",
      reviews: 127,
      tags: ["Tái cấu trúc KH CN/DN"],
    },
    {
      id: "b2",
      avatar: "/images/avatar/kha.png",
      initials: "VB",
      color: "#22c55e",
      name: "Đào Trọng Kha",
      zalo: "0908038277",
      role: "Trưởng phòng KD",
      region: "Khu Đông, TB, BT",
      exp: "10 năm",
      address: "Món vay: từ 5 -20 tỷ",
      desc: "Tái tài trợ để điều chỉnh lãi suất, thời hạn mức cấp cho phù hợp với tình hình tài chính hiện tại.",
      rating: "5.0",
      reviews: 93,
      tags: ["Tái tài trợ - Cấp tăng thêm"],
    },
    {
      id: "b3",
      avatar: "/images/avatar/an.png",
      initials: "TC",
      color: "#a855f7",
      name: "Nguyễn Trường An",
      zalo: "0989103158",
      role: "Chuyên viên tư vấn",
      region: "Quận 2, Thủ Đức, Quận 9",
      exp: "8 năm",
      address: "Món vay: Từ 1- 10 tỷ",
      desc: "Các BĐS ngoại lệ như đất nông nghiệp, đất lúa, tài sản quy hoạch.",
      rating: "4.9",
      reviews: 81,
      tags: ["Ngoại lệ tài sản bảo đảm"],
    },
    {
      id: "b4",
      avatar: "/images/avatar/long.png",
      initials: "TC",
      color: "#a855f7",
      name: "Hồ Hoàng Long",
      zalo: "0987321021",
      role: "Chuyên viên tư vấn",
      region: "Khu Đông, Hóc Môn, Củ Chi",
      exp: "4 năm",
      address: "Món vay: Từ 1- 10 tỷ",
      desc: "Ngoại lệ đối tượng khách hàng như tuổi tác, nghề nghiệp, thu nhập, Cic.",
      rating: "4.9",
      reviews: 81,
      tags: ["Ngoại lệ đối tượng khách hàng"],
    },
    {
      id: "b5",
      avatar: "/images/avatar/thien.png",
      initials: "TC",
      color: "#a855f7",
      name: "Hồ Thanh Thiện",
      zalo: "0903342263",
      role: "Chuyên viên tư vấn",
      region: "Khu Tây và Nam TP.HCM",
      exp: "2 năm",
      address: "Món vay: Từ 1- 10 tỷ",
      desc: "Điều chỉnh món vay, giảm lãi suất, gia hạn thời gian thanh toán nợ vay.",
      rating: "4.9",
      reviews: 81,
      tags: ["Điều chỉnh áp lực thanh toán"],
    },
  ];

  if (horizontal) {
  return <BrokerRailAuto brokers={brokers} />;
}

  return (
    <div className="broker-list">
      {brokers.map((b) => (
        <BrokerItem key={b.id} broker={b} />
      ))}
    </div>
  );
}
const HOLD_MS = 5000;

function BrokerRailAuto({ brokers }: { brokers: any[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);

  // 👉 chỉ để render UI
  const [, forceRender] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || brokers.length <= 1) return;

    const slides = Array.from(rail.children) as HTMLElement[];

    const scrollToIndex = (idx: number) => {
      const target = slides[idx];
      if (!target) return;

      rail.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth",
      });
    };

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;

      indexRef.current = (indexRef.current + 1) % slides.length;
      scrollToIndex(indexRef.current);

      // 🔄 trigger UI update
      forceRender((n) => n + 1);
    }, HOLD_MS);

    return () => window.clearInterval(timer);
  }, [brokers.length]);

  return (
    <div className="broker-rail-wrap">
      {/* ===== Rail ===== */}
      <div
        ref={railRef}
        className="apple-broker-rail"
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => setTimeout(() => (pausedRef.current = false), 800)}
      >
        {brokers.map((b) => (
          <BrokerItem key={b.id} broker={b} />
        ))}
      </div>

      {/* ===== Auto Carousel Controller (VISUAL ONLY) ===== */}
      <div className="carousel-controller">
        <div className="carousel-dots">
          {brokers.map((_, i) => (
            <span
              key={i}
              className={`dot ${
                i === indexRef.current ? "is-active" : ""
              }`}
            />
          ))}
        </div>

        <div
          className="carousel-progress"
          key={indexRef.current} // reset animation mỗi lần đổi slide
        />
      </div>
    </div>
  );
}


function BrokerItem({ broker }: { broker: Broker }) {
  const { initials, color, name, role, region, exp, address, desc, rating, reviews, tags } = broker;

  return (
    <article className="apple-broker-card">
      <div className="apple-broker-grid">
        <div className="apple-broker-top-left">
          <div className="apple-broker-avatarFrame" aria-label={`Avatar của ${broker.name}`}>
          {broker.avatar ? (
            <Image
              src={broker.avatar}
              alt={broker.name}
              width={96}          // ảnh bên trong (không upscale)
              height={96}
              unoptimized         // ✅ tránh next tự chọn 2x gây "vỡ" với ảnh nhỏ
              className="apple-broker-avatarImg"
              priority={false}
            />
            ) : (
              <div className="apple-broker-avatarFallback" style={{ background: color }}>
                {broker.initials}
              </div>  
            )}
          </div>
        </div>

        <div className="apple-broker-top-right">
          <div className="apple-broker-rating">
            <span className="star">★</span>
            <span className="score">{rating}</span>
            <span className="count">({reviews})</span>
          </div>
          <div className="apple-broker-name">{name}</div>
          <div className="apple-broker-role">{role}</div>
        </div>

        <div className="apple-broker-middle">
        
          <div className="apple-pill-row">
            {tags?.slice(0, 3).map((t) => (
              <span key={t} className="apple-pill">
                {t}
              </span>
            ))}
          </div>

          <div className="apple-broker-meta">
            <div>Kinh nghiệm: {exp}</div>
            <div>Phân khu: {region}</div>
             <div>{address}</div>
          </div>

          <div className="apple-broker-desc">{desc}</div>
        </div>

        <div className="apple-broker-bottom">
          <button
            className="apple-btn apple-btn-primary"
            type="button"
            onClick={() => window.open(`https://zalo.me/${broker.zalo}`, "_blank")}
          >
            Nhắn Zalo
          </button>
        </div>
      </div>
    </article>
  );
}
// ✅ đặt BrokersWhiteStrip ở dưới các function helper là ok

function BrokersWhiteStrip() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reset để lần scroll tới mới chạy
    setRun(false);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
        }
      },
      { threshold: 0.4 } // thấy ~40% là chạy
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
  <section className="brokers-white-strip">
    <div className="brokers-white-inner">
      {/* ✅ INTRO TĨNH Ở GIỮA STRIP */}
      <div className="brokers-strip-intro">
        <div className="brokers-strip-company">
          KENTA FINANCE CONNECT
        </div>
        <div className="brokers-strip-note">
          Hãy làm việc trực tiếp với các broker của chúng tôi
        </div>
      </div>

      {/* ✅ STACK ANIMATION GIỮ NGUYÊN */}
      <div ref={ref} className={`brokers-text-stack ${run ? "is-animate" : ""}`}>
        <h1 className="brokers-line line-1">TÁI CẤU TRÚC CÁC KHOẢN VAY</h1>

        <h1 className="brokers-line line-2">TÁI TÀI TRỢ VÀ CẤP TĂNG THÊM</h1>

        <h1 className="brokers-line line-3">ĐIỀU CHỈNH ÁP LỰC THANH TOÁN</h1>

        <h1 className="brokers-line line-4">NGOẠI LỆ ĐỐI TƯỢNG KH</h1>

        <h1 className="brokers-line line-5">NGOẠI LỆ TÀI SẢN BẢO ĐẢM</h1>
      </div>
    </div>
  </section>
);
}