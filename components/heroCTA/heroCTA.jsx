import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function HeroCTA({ variant = "primary" }) {
  const router = useRouter();

  const handleStart = (e) => {
    // prevent double click
    e.currentTarget.setAttribute("disabled", "true");

    // track event if you use gtag/dataLayer
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "click_start", { label: "Hero - Bắt đầu" });
    }

    // navigate to /start (SPA navigation)
    router.push("/start");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Primary CTA */}
      <button
        onClick={handleStart}
        aria-label="Bắt đầu tư vấn - mở trang tư vấn"
        className={
          // primary visual: pill, gradient, shadow, hover scale
          "relative inline-flex items-center justify-center px-6 py-3 min-w-[160px] min-h-[48px] rounded-full text-white font-semibold text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform duration-200 " +
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95"
        }
      >
        <span className="mr-3 transform transition-transform duration-200 group-hover:translate-x-1 select-none" aria-hidden>
          🚀
        </span>
        <span>Bắt đầu</span>

        {/* subtle pulse highlight (pseudo) - accessible & non-blocking */}
        <span
          aria-hidden
          className="absolute -inset-0.5 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"
          style={{ boxShadow: "0 14px 30px rgba(59,130,246,0.16)" }}
        />
      </button>

      {/* Secondary CTA */}
      <button
        onClick={() => router.push("/brokers")}
        className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 min-h-[44px]"
        aria-label="Chọn Broker"
      >
        Chọn Broker
      </button>
    </div>
  );
}
