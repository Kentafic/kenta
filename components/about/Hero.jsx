// pages/about.tsx  (hoặc about.js nếu bạn dùng JS thường)
import React from "react";
import Link from "next/link";
export default function AboutSection() {
  return (
    <div
      style={{
        width: "100%",
        background: "#f5f7fb",
        fontFamily:
          "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      {/* MAIN CONTENT 2 CỘT – đặt sát dưới hero About của theme */}
      <section style={{ padding: "20px 0 24px" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "minmax(0,2.6fr) minmax(0,1.4fr)",
            gap: 40,
          }}
        >
          {/* CỘT TRÁI – GIỚI THIỆU & HÀNH TRÌNH */}
          <div>
            <p
              style={{
                fontSize: 13,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 2,
              }}
            >
              Về chúng tôi
            </p>

            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              Kenta Finance Connect
            </h1>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "#475569",
                marginBottom: 6,
              }}
            >
              Được thành lập từ năm 2017, Kenta Finance Connect ra đời với sứ mệnh trở thành
              đối tác tư vấn tài chính đáng tin cậy cho khách hàng cá nhân và doanh nghiệp có 
              nhu cầu vay vốn tại TP.HCM và các khu vực lân cận.
            </p>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "#475569",
                marginBottom: 16,
              }}
            >
              Chúng tôi chuyên sâu vào{" "}
              <strong>phân tích dòng tiền, lịch sử tín dụng và tài sản bảo đảm</strong>{" "}
              để xây dựng cấu trúc tối ưu cho toàn bộ khoản vay của KH. Ngoài ra, đội ngũ nhân viên của Kenta sẽ luôn đồng hành cùng
              khách hàng trong{" "}
              <strong>
                quản lý hồ sơ, làm việc với ngân hàng, chăm sóc khách hàng
              </strong>{" "}
              và theo sát hồ sơ từ giai đoạn khó khăn nhất cho đến khi khoản vay
              được giải ngân hoặc tái cơ cấu thành công.
            </p>

            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "#475569",
              }}
            >
              Vai trò của Kenta không chỉ là “giới thiệu ngân hàng”, mà là{" "}
              <strong>người thiết kế &amp; bảo vệ phương án tín dụng</strong> cho
              khách hàng – đảm bảo bài toán vốn, chi phí lãi vay và tiến độ giải
              ngân phù hợp với thực tế hoạt động kinh doanh.

            </p>
          </div>

          {/* CỘT PHẢI – CARD NĂNG LỰC */}
          <div>
            <div
              style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                border: "1px solid rgba(148,163,184,0.18)",
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: 12,
                }}
              >
                Năng lực cốt lõi của Kenta
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                <li>• Thẩm định và phân tích hồ sơ vay CN & DN</li>
                <li>• Quản lý và chuẩn hóa hồ sơ vay có Tsbđ</li>
                <li>• Chăm sóc khách hàng, theo sát hồ sơ đến khi giải ngân.</li>
                <li>
                  • Thiết kế &amp; cung cấp giải pháp tài chính phù hợp từng mục
                  tiêu.
                </li>
                <li>
                  • Tái cơ cấu các khoản vay phức tạp, xử lý áp lực trả nợ.
                </li>
                <li>
                  • Cấp tăng thêm hạn mức cho khách hàng cần bổ sung dòng vốn
                  sản xuất – kinh doanh.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SỐ LIỆU */}
      <section style={{ padding: "0 0 48px" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            background: "#0f172a",
            borderRadius: 24,
            color: "#e5e7eb",
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 24,
          }}
        >
          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#facc15",
                marginBottom: 4,
              }}
            >
              17+
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              Năm kinh nghiệm
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cbd5f5" }}>
              Định hình và triển khai các chiến lược vốn cho khách hàng cá nhân
              &amp; doanh nghiệp từ 2017.
            </p>
          </div>

          <div
            style={{
              padding: "24px 20px",
              borderLeft: "1px solid rgba(148,163,184,0.35)",
              borderRight: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#38bdf8",
                marginBottom: 4,
              }}
            >
              1.000+
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              Hồ sơ được tư vấn
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cbd5f5" }}>
              Cấp mới, cấp thêm, điều chỉnh áp lực thanh toán nợ vay, tái cấu trúc khoản vay ...
            </p>
          </div>

          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#4ade80",
                marginBottom: 4,
              }}
            >
              100%
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              Tư vấn độc lập
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cbd5f5" }}>
              Kenta đứng về phía KH, đặt quyền lợi của khách hàng lên trên hết.
            </p>
          </div>
        </div>
      </section>

      {/* CTA CUỐI TRANG */}
      <section style={{ padding: "0 0 72px" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            background: "#ffffff",
            borderRadius: 24,
            boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
            border: "1px solid rgba(226,232,240,0.9)",
          }}
        >
          <div style={{ padding: "24px 20px" }}>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Bắt đầu cùng Kenta
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                maxWidth: 520,
              }}
            >
              Hãy cho chúng tôi biết nhu cầu dòng tiền hoặc tình trạng khoản 
              của bạn. Đội ngũ Kenta sẽ đề xuất phương án tái tài chính phù hợp – rõ ràng, minh bạch, có lộ trình thực hiện cụ thể.
            </p>
          </div>
          <div style={{ paddingRight: 24, paddingBottom: 20 }}>
           <Link
  href="/brokers"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 22px",
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #1e293b 100%)",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
    boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
  }}
>
  Chọn Broker đồng hành
</Link>
          </div>
        </div>
      </section>
    </div>
  );
}