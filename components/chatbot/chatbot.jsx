// components/chatbot/chatbot.jsx
import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Chào anh/chị, em là trợ lý vay vốn KENTA..." },
    { from: "bot", text: "Câu 1: Anh/chị cần vay để làm gì?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: input },
      { from: "bot", text: "Cảm ơn anh/chị, chuyên viên sẽ liên hệ sớm ạ." },
    ]);
    setInput("");
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f4f6fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          height: "70vh",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #edf2f7",
            fontWeight: 700,
          }}
        >
          Trợ lý vay vốn KENTA
        </div>

        <div
          style={{
            flex: 1,
            padding: "16px 24px",
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "8px 12px",
                  borderRadius: 16,
                  background: m.from === "user" ? "#2f55ff" : "#edf2ff",
                  color: m.from === "user" ? "#fff" : "#1a202c",
                  fontSize: 14,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #edf2f7",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu trả lời của anh/chị..."
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 20,
              border: "1px solid #cbd5e0",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              borderRadius: 20,
              padding: "8px 16px",
              border: "none",
              background: "#2f55ff",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Gửi
          </button>
        </form>
      </div>
    </section>
  );
}
