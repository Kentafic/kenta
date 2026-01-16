import LoanChatbot from "../chatbot/chatbot";
import { useEffect, useState } from "react";

export default function ChatbotPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f3f7ff",
        paddingTop: 40,
        paddingLeft: isMobile ? 0 : 200, // 🔥 CHỈ ĐẨY TRÊN DESKTOP
      }}
    >
      {/* WRAPPER CHO KENTA CHATBOT */}
      <div className="kenta-chatbot">
        <LoanChatbot />
      </div>

      {/* 🔥 OVERRIDE SCROLLBAR – ĐÈ GLOBAL.CSS 100% */}
      <style jsx global>{`
        /* Nếu scrollbar nằm trong vùng chat body */
        .kenta-chatbot .chat-body::-webkit-scrollbar {
          width: 6px !important;
        }

        .kenta-chatbot .chat-body::-webkit-scrollbar-track {
          background: #f0f3f7 !important;
          border-radius: 10px !important;
        }

        .kenta-chatbot .chat-body::-webkit-scrollbar-thumb,
        .kenta-chatbot .chat-body::-webkit-scrollbar-button {
          background-color: #c8c8c8 !important;
          border-radius: 10px !important;
        }

        /* Nếu scrollbar thuộc container khác (phòng hờ) */
        .kenta-chatbot .chat-box::-webkit-scrollbar-thumb,
        .kenta-chatbot .chat-box::-webkit-scrollbar-button {
          background-color: #c8c8c8 !important;
        }

        /* Nếu scrollbar là của BODY (phòng trường hợp xấu nhất) */
        body::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-button {
          background-color: #c8c8c8 !important;
        }
      `}</style>
    </div>
  );
}
