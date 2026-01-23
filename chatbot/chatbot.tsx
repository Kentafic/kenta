import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useRouter } from "next/router";
// Loại người gửi tin nhắn
type Sender = "bot" | "user";
// Loại dịch vụ tư vấn
type ServiceType = "PERSONAL" | "BUSINESS" | "UNSECURED" | null;
// Cấu trúc tin nhắn
interface Message {
  id: string;
  from: Sender;
  text: string;
}
// Helper tạo ID ngẫu nhiên cho tin nhắn
function createId() {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// Tốc độ gõ chữ của bot
const TYPING_SPEED = 20; // ms / ký tự
const EXTRA_PAUSE = 500; // nghỉ sau khi gõ xong 1 câu
//tính thời gian gõ chữ
const getTypingDuration = (text: string) =>
  text.length * TYPING_SPEED + EXTRA_PAUSE;

//----------------------------------------------------------------
//định dạng số điện thoại
const formatPhone = (s?: string) => {
  if (!s) return "";
  const nums = s.replace(/\D/g, "");
  if (nums.length === 10)
    return nums.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  if (nums.length === 11 && nums.startsWith("84"))
    return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, "+$1 $2 $3 $4");
  // fallback group from right (3-3-3...)
  if (nums.length >= 9) {
    const last9 = nums.slice(-9);
    const head = nums.slice(0, nums.length - 9);
    const grouped = last9.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
    return head ? `${head} ${grouped}` : grouped;
  }
  return nums;
};

//----------------------------------------------------------------
// state hiển thị report
type LoanReport = {
  fullName: string | null;
  age: number | null;
  livingArea: string | null; // khu vực sinh sống
  monthlyIncome: number | null; // thu nhập bình quân/tháng
  loanPurpose?: string | null; // mục đích khoản vay

  collateralType: string | null; // loại TSBĐ
  collateralValue: number | null; // giá trị TSBĐ
  creditStatus: string | null; // tình trạng tín dụng
  loanAmount: number | null; // nhu cầu vay dự kiến
  phoneNumber?: string | null; // số điện thoại
};

// Helper tạo ripple khi click
const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
  const btn = e.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${
    e.clientX - btn.getBoundingClientRect().left - radius
  }px`;
  circle.style.top = `${
    e.clientY - btn.getBoundingClientRect().top - radius
  }px`;
  circle.style.position = "absolute";
  circle.style.background = "rgba(37,99,235,0.25)";
  circle.style.borderRadius = "50%";
  circle.style.transform = "scale(0)";
  circle.style.animation = "ripple 0.6s linear";
  circle.style.pointerEvents = "none";

  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
};

interface LoanOptionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

// Component nút lựa chọn – tái sử dụng
const LoanOptionButton: React.FC<LoanOptionButtonProps> = ({
  onClick,
  children,
  isMobile=false,
}) => {
  const baseStyle: React.CSSProperties = {
    position: "relative",

    // ✅ QUAN TRỌNG: luôn co theo nội dung
    width: "fit-content",
    maxWidth: "100%",

    textAlign: "left",
    padding: "12px 20px",
    borderRadius: 999,
    border: "1px solid #c7d2fe",
    background: "linear-gradient(135deg, #ffffff, #eef4ff)",
    cursor: "pointer",
    fontSize: isMobile ? 15 : 14,
    fontWeight: 600,
    color: "#1e3a8a",
    overflow: "hidden",
    whiteSpace: "nowrap", // ✅ không cho xuống dòng
    transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = "translateY(-2px)";
    btn.style.boxShadow = "0 8px 20px rgba(37,99,235,0.25)";
    btn.style.background = "linear-gradient(135deg, #e0edff, #f0f6ff)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = "none";
    btn.style.background = "linear-gradient(135deg, #ffffff, #eef4ff)";
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick?.();
  };

  return (
    <button
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// Main component chatbot
export default function LoanChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAreaOptions, setShowAreaOptions] = useState(false);
  const [canShowLoanOptions, setCanShowLoanOptions] = useState(false);
  const hasRunIntro = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [fullName, setFullName] = useState("");
  const [showAgeInput, setShowAgeInput] = useState(false);
  const [age, setAge] = useState("");
  const [showLoanAmountInput, setShowLoanAmountInput] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [showLoanTermInput, setShowLoanTermInput] = useState(false);
  const [loanTerm, setLoanTerm] = useState("");
  const hasStartedNameFlow = useRef(false); // để tránh lặp lại flow nhập tên
  const [showPurposeOptions, setShowPurposeOptions] = useState(false);
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [showCollateralOptions, setShowCollateralOptions] = useState(false);
  const [collateralType, setCollateralType] = useState("");
  const [showCollateralValueInput, setShowCollateralValueInput] =
    useState(false);
  const [collateralValue, setCollateralValue] = useState("");
  const [showCreditOptions, setShowCreditOptions] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [assetInput, setAssetInput] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<LoanReport | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [selectedCollateralType, setSelectedCollateralType] =
    useState<string | null>(null);
  const [creditStatus, setCreditStatus] = useState<string | null>(null);
  const [hideChatContent, setHideChatContent] = useState(false);
  const [customerArea, setCustomerArea] = useState<string | null>(null);
  const [loanPurpose, setLoanPurpose] = useState<string | null>(null);
  const [livingArea, setLivingArea] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneStep, setIsPhoneStep] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [showBrokerOptions, setShowBrokerOptions] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [showFinalNotice, setShowFinalNotice] = useState(false);


  // Gõ từng chữ cho 1 bubble của bot
  const typeBotMessage = (fullText: string) => {
    const id = createId();
    setIsTyping(true);
    setMessages((prev) => [...prev, { id, from: "bot", text: "" }]);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, text: fullText.slice(0, i) } : m
        )
      );

      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, TYPING_SPEED);
  };

  // Hàm định dạng số tiền với dấu phẩy
  const formatNumber = (value: string) => {
    const number = value.replace(/[^\d]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatMoney = (value: string) => {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  //---------------------------------------------------------------------
  // Intro mở đầu – chỉ chạy 1 lần
  useEffect(() => {
    if (hasRunIntro.current) return;
    hasRunIntro.current = true;

    const intro = [
      "Kenta xin chào bạn 👋 Chào mừng bạn đến với dịch vụ tư vấn khách hàng vay.",
      "Để đề xuất được giải pháp phù hợp, Kenta sẽ hỏi bạn một vài thông tin cơ bản về cá nhân hoặc doanh nghiệp. Mỗi câu hỏi chỉ mất vài giây để trả lời.",
      "Trước tiên, cho Kenta biết: hiện tại bạn đang quan tâm tới dịch vụ tư vấn nào của chúng tôi?",
    ];

    const run = (index: number) => {
      const text = intro[index];
      typeBotMessage(text);

      const duration = getTypingDuration(text);

      if (index === intro.length - 1) {
        // câu cuối: xong thì hiện nút chọn loại vay
        setTimeout(() => setCanShowLoanOptions(true), duration);
      } else {
        // còn câu tiếp theo: gọi đệ quy
        setTimeout(() => run(index + 1), duration);
      }
    };

    run(0);
  }, []);

  //----------------------------------------------------------------
  // Phát hiện kích thước màn hình
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth <= 768);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  //--------------------------------------------------------------------
  // Phát hiện kích thước màn hình
  useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkMobile(); // chạy lần đầu
  window.addEventListener("resize", checkMobile);

  return () => {
    window.removeEventListener("resize", checkMobile);
  };
}, []);
//--------------------------------------------------------------------
//--------------------------------------------------------------------
// Cuộn khung chat xuống dưới cùng khi có tin nhắn mới (fix iOS)
useEffect(() => {
  const el = chatBodyRef.current;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
}, [
  messages,
  isTyping,
  showAreaOptions,
  showNameInput,
  showAgeInput,
  showLoanAmountInput,
  showPurposeOptions,
  showIncomeInput,
  showCollateralOptions,
  showCollateralValueInput,
  showCreditOptions,
]);

//--------------------------------------------------------------------
  // Xử lý khi nhấn "vay cá nhân"
  const handlePersonalLoan = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        from: "user",
        text: "Tôi muốn vay cá nhân",
      },
    ]);

    const botText =
      "Rất tốt 👍 Trước hết, cho Kenta biết bạn đang sinh sống và làm việc tại khu vực nào nhé?";

    setCanShowLoanOptions(false);
    setShowAreaOptions(false);

    typeBotMessage(botText);

    const delay = getTypingDuration(botText);
    setTimeout(() => {
      setShowAreaOptions(true);
    }, delay);
  };
  // Hàm xử lý khi chọn dịch vụ không được hỗ trợ
const showUnsupportedAndBrokers = (label: string, key: "BUSINESS" | "UNSECURED") => {
  setSelectedService(key);

  // user chọn option
  setMessages((prev) => [...prev, { id: createId(), from: "user", text: label }]);

  // tắt cụm chọn dịch vụ
  setCanShowLoanOptions(false);

  // đảm bảo các cụm option khác không bật
  setShowAreaOptions(false);
  setShowNameInput(false);
  setShowAgeInput(false);
  setShowLoanAmountInput(false);
  setShowPurposeOptions(false);
  setShowIncomeInput(false);
  setShowCollateralOptions(false);
  setShowCollateralValueInput(false);
  setShowCreditOptions(false);
  setShowFinishButton(false);

  const botText =
    `Hiện chúng tôi chưa triển khai dịch vụ tư vấn tự động cho "${label}".\n` +
    `Kenta sẽ chuyển bạn đến trang tư vấn trực tiếp của chúng tôi.\n`+
    'Lưu ý: Kenta chỉ hỗ trợ đối với các món vay 1 tỷ VNĐ trở lên.';
  typeBotMessage(botText);

  const delay = getTypingDuration(botText);
  setTimeout(() => {
    setShowBrokerOptions(true);
  }, delay);
};
// Hàm xử lý khi chọn vay doanh nghiệp
const handleBusinessLoan = () => {
  showUnsupportedAndBrokers("Tư vấn vay doanh nghiệp", "BUSINESS");
};
// Hàm xử lý khi chọn vay tín chấp
const handleUnsecuredLoan = () => {
  showUnsupportedAndBrokers("Tư vấn vay tín chấp", "UNSECURED");
};
// Xử lý khi chọn broker
const handlePickBroker = (brokerName: string) => {
  setMessages((prev) => [...prev, { id: createId(), from: "user", text: brokerName }]);
  setShowBrokerOptions(false);

  const botText =
    `Kenta đã ghi nhận yêu cầu. ${brokerName} sẽ liên hệ hỗ trợ Quý khách trong thời gian sớm nhất.`;

  typeBotMessage(botText);
};
//----------------------------------------------------------------
  // XỬ LÝ KHI CHỌN KHU VỰC SINH SỐNG
  const handleSelectArea = (area: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createId(), from: "user", text: area },
    ]);
    setCustomerArea(area);
    setLivingArea(area);
    setShowAreaOptions(false);
    setShowNameInput(false);
    setShowAgeInput(false);
    // Lưu khu vực vào report
 setReport((prev) => ({
  ...(prev ?? {
    fullName: null,
    age: null,
    livingArea: null,
    monthlyIncome: null,
    loanPurpose: null,
    collateralType: null,
    collateralValue: null,
    creditStatus: null,
    loanAmount: null,
    phoneNumber: null,
  }),
  livingArea: area,
}));
    // Nếu khu vực khác → dừng tại đây
    if (area === "Khu vực khác") {
      typeBotMessage(
        "Rất tiếc 🙏 Hiện tại Kenta chỉ hỗ trợ các khách hàng sinh sống và làm việc tại khu vực TP.HCM và các tỉnh lân cận."
      );
      return;
    }
    // Nếu TP.HCM & lân cận → bot nói câu cảm ơn + hỏi tên
    const botText =
      "Cảm ơn bạn 👍 Kenta đã ghi nhận khu vực: TP. Hồ Chí Minh và các tỉnh lân cận. Để tiếp tục, Quý khách vui lòng cho Kenta biết Họ và tên đầy đủ của mình nhé.";

    typeBotMessage(botText);

    // ⏱ Đợi bot gõ xong rồi mới hiện ô nhập tên
    const delay = botText.length * 20 + 500; // cùng tốc độ typeBotMessage

    setTimeout(() => {
      setShowNameInput(true);
    }, delay);
  };

  // Xử lý khi chọn mục đích vay
  const handleSelectPurpose = (purpose: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createId(), from: "user", text: purpose },
    ]);
    setLoanPurpose(purpose);
    setShowPurposeOptions(false);

    const botText = `✅ Kenta đã ghi nhận mục đích vay: ${purpose}. Tiếp theo, Quý khách vui lòng cho Kenta biết tổng thu nhập bình quân hàng tháng là bao nhiêu nhé.`;

    typeBotMessage(botText);

    const delay = botText.length * 20 + 500;
    setTimeout(() => {
      setShowIncomeInput(true);
    }, delay);
  };

  // Xử lý khi chọn loại tài sản bảo đảm
  const handleSelectCollateral = (collateral: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createId(), from: "user", text: collateral },
    ]);
    setSelectedCollateralType(collateral);
    setShowCollateralOptions(false);

    const botText = `✅ Kenta đã ghi nhận loại tài sản bảo đảm: ${collateral}. Quý khách vui lòng cho Kenta biết giá trị ước tính của tài sản (VNĐ) nhé.`;

    typeBotMessage(botText);

    const delay = botText.length * 20 + 500;

    setTimeout(() => {
      setShowCollateralValueInput(true); // 👉 hiện ô nhập giá trị sau khi bot nói xong
    }, delay);
  };

  // Xử lý khi chọn tình trạng tín dụng
  const handleSelectCreditStatus = (status: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createId(), from: "user", text: status },
    ]);

    setShowCreditOptions(false);
    setCreditStatus(status);

    let botText = "";

    if (status === "Có nợ quá hạn") {
      botText =
        "ℹ️ Kenta đã ghi nhận thông tin: Quý khách đang có nợ quá hạn. Hồ sơ có thể cần được thẩm định kỹ hơn theo quy định hiện hành.";
    } else {
      botText =
        "✅ Lịch sử tín dụng của Quý khách khá tốt. Điều này sẽ hỗ trợ tích cực cho quá trình xét duyệt khoản vay.";
    }

    typeBotMessage(botText);
    const delay = botText.length * 20 + 500;
    setTimeout(() => {
  setShowNameInput(true);
  setTimeout(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, 50);
}, delay);
  };

  // XỬ LÝ KHI CHỌN HOÀN TẤT HỒ SƠ
  const handleOpenReport = () => {
    setIsCreatingReport(true);

    const rawCollateralValue = collateralValue
      ? parseInt(collateralValue.replace(/[^\d]/g, ""), 10)
      : null;

    const rawLoanAmount = loanAmount
      ? parseInt(loanAmount.replace(/[^\d]/g, ""), 10)
      : null;

    const rawMonthlyIncome = monthlyIncome
      ? parseInt(monthlyIncome.replace(/[^\d]/g, ""), 10)
      : null;

    const ageNumber = age ? parseInt(age, 10) : null;

    const r: LoanReport = {
      fullName: fullName || null,
      age: isNaN(ageNumber as any) ? null : ageNumber,
      livingArea: livingArea || null, // <- use livingArea key
      monthlyIncome:
        rawMonthlyIncome && !isNaN(rawMonthlyIncome) ? rawMonthlyIncome : null,
      loanPurpose,

      collateralType: selectedCollateralType,
      collateralValue:
        rawCollateralValue && !isNaN(rawCollateralValue)
          ? rawCollateralValue
          : null,
      creditStatus,
      loanAmount:
        rawLoanAmount && !isNaN(rawLoanAmount) ? rawLoanAmount : null,

      phoneNumber: null, // will be set after phone confirm
    };

    setReport(r);
    setIsPhoneStep(true);
    setHideChatContent(true);

    typeBotMessage(
      "📄 Kenta đã tổng hợp hồ sơ của Quý khách. Chúng tôi cần số điện thoại để hoàn tất hồ sơ — thông tin sẽ được bảo mật tuyệt đối."
    );

    setIsCreatingReport(false);
  };

  // XỬ LÝ KHI NHẬP SỐ ĐIỆN THOẠI (fix)
  const handleConfirmPhone = () => {
    const digits = (phoneNumber || "").replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 12) {
      alert("Vui lòng nhập số điện thoại hợp lệ (9–12 chữ số).");
      return;
    }

    // 1) cập nhật report (lưu phone dưới dạng chỉ số)
setReport((prev) => ({
  ...(prev ?? {
    fullName: null,
    age: null,
    livingArea: null,
    monthlyIncome: null,
    loanPurpose: null,
    collateralType: null,
    collateralValue: null,
    creditStatus: null,
    loanAmount: null,
    phoneNumber: null,
  }),
  phoneNumber: digits,
}));

    // 2) xóa sạch lịch sử chat (bot + user)
    setMessages([]); // <- đây là điểm quan trọng

    // 3) ẩn khung chat
    setHideChatContent(true);

    // 4) hiển thị report
    setShowReport(true);

    // 5) tắt dialog nhập SĐT
    setIsPhoneStep(false);

    // tắt trạng thái typing để an toàn
    setIsTyping(false);
  };

  // CÁC CHỈ SỐ PHÂN TÍCH HỒ SƠ TÍN DỤNG
  const numericMonthlyIncome = monthlyIncome
    ? parseInt(monthlyIncome.replace(/[^\d]/g, ""), 10)
    : null;

  const loanToValue =
    report && report.collateralValue && report.loanAmount
      ? report.loanAmount / report.collateralValue
      : null;

  // --- ƯỚC TÍNH KHOẢN PHẢI TRẢ HÀNG THÁNG (MIN → MAX) ---
  const ANNUAL_RATE = 0.075; // 7.5%/năm
  const MONTHLY_RATE = ANNUAL_RATE / 12;

  const LOAN_TERM_YEARS = 30; // 30 năm
  const TENOR_MONTHS = LOAN_TERM_YEARS * 12;

  // Chỉ trả lãi
  const interestOnlyPayment = report?.loanAmount
    ? Math.round(report.loanAmount * MONTHLY_RATE)
    : null;

  // Trả gốc + lãi (gốc chia đều)
  const fullPayment = report?.loanAmount
    ? Math.round(
        report.loanAmount * MONTHLY_RATE + report.loanAmount / TENOR_MONTHS
      )
    : null;

  // DSR: nghĩa vụ trả nợ / thu nhập
  const dsr =
    numericMonthlyIncome && fullPayment
      ? fullPayment / numericMonthlyIncome
      : null;
  // ✅ % DSR để hiển thị
  const dsrPercent = dsr !== null ? Math.round(dsr * 100) : null;

  //--------------------------------------------------------------------
  // style khung chat
  const frameStyle: React.CSSProperties = isMobile
  ? {
      // MOBILE: full màn, dính sát 2 bên
      width: "100%",
      maxWidth: "100%",
      margin: 0,
      padding: 12,
      backgroundColor: "#f3f4ff",
      borderRadius: 0,
      boxShadow: "none",
      border: "none",
    }
  : {
      // DESKTOP – giữ nguyên
      width: 1400,
      maxWidth: "90vw",
      marginLeft: 60,
      marginTop: 140,
      marginBottom: 40,
      backgroundColor: "#fff",
      borderRadius: 24,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      padding: 24,
      border: "1px solid #e0e0e0",
    };

  const bubbleBotStyle: React.CSSProperties = {
    maxWidth: isMobile ? "100%" : 720,
    padding: "12px 18px",
    borderRadius: 22,
    background: "linear-gradient(180deg, #ffffff, #f3f6ff)",
    color: "#0f172a",
    fontSize: isMobile ? 14 : 15,
    lineHeight: 1.6,
    border: "1px solid #dbe3ff",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
    whiteSpace: "pre-line",
  };

  const optionsContainer: React.CSSProperties = {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  const bubbleUserStyle: React.CSSProperties = {
    maxWidth: 600,
    padding: "12px 18px",
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.5,
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
    border: "1px solid rgba(255,255,255,0.25)",
  };

  // khung scroll chính của chat
 const chatScrollStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  boxSizing: "border-box",
  gap: 12,
  scrollBehavior: "smooth",

  // khoảng cách trên/dưới tuỳ mobile – desktop
  paddingTop: isMobile ? 40 : 40,
  paddingBottom: isMobile ? 16 : 24,
  paddingLeft: 12,
  paddingRight: 4,

  // giới hạn chiều cao để xuất hiện thanh cuộn
  maxHeight: isMobile
    ? "calc(100vh - 120px)"   // mobile: chừa header + footer
    : "calc(100vh - 160px)",  // desktop: chừa thoáng hơn
};

   // ✅ RETURN DUY NHẤT CỦA COMPONENT
  return (
  <div className="kenta-chat-frame" style={frameStyle}>
    <style>
      {`
        @keyframes userPop {
          0% { transform: scale(0.9) translateY(6px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes botFade {
          0% { transform: translateY(6px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}
    </style>

{/* THÔNG BÁO CUỐI CÙNG KHI HOÀN TẤT HỒ SƠ */}

{showFinalNotice && (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "12px 12px 0",
    }}
  >
    <div
      style={{
        background: "linear-gradient(135deg,#ecfeff,#eef2ff)",
        border: "1px solid rgba(37,99,235,0.14)",
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
        color: "#0f172a",
        fontWeight: 600,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      Kenta đã tiếp nhận thông tin, chúng tôi sẽ liên hệ trong vòng{" "}
      <strong>4h làm việc</strong>.
    </div>
  </div>
)}

    {/* KHUNG CHÍNH CỦA CHAT */}
    <div className="chat-body" ref={chatBodyRef} style={chatScrollStyle}>
      {/* 👇 TOÀN BỘ CHAT CHỈ HIỆN KHI CHƯA ẨN */}
      {!hideChatContent && (
        <>
          {/* TIN NHẮN */}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.from === "bot" ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  ...(m.from === "bot" ? bubbleBotStyle : bubbleUserStyle),
                  borderRadius: m.from === "user" ? 999 : 22,
                  animation:
                    m.from === "user"
                      ? "userPop 0.25s ease-out"
                      : "botFade 0.3s ease-out",
                }}
              >
                {m.text}
              </div>
            </div>
            
          ))}


{/* BUBBLE BOT ĐANG GÕ CHỮ (giữ đơn giản) */}
{isTyping && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      marginTop: 4,
    }}
  >
    <div
      style={{
        ...bubbleBotStyle,
        opacity: 0.7,
        fontStyle: "italic",
        fontSize: 12,
      }}
    >
      Kenta đang nhập…
    </div>
  </div>
)}
            {/* 2 NÚT: VAY CÁ NHÂN / DOANH NGHIỆP */}
            {canShowLoanOptions && !isTyping && !showAreaOptions && (
              <div
                style={{
                  ...optionsContainer,
                  animation: "fadeInUp 0.4s ease-out",
                }}
              >
                <LoanOptionButton onClick={handlePersonalLoan}>
                  Tư vấn vay cá nhân
                </LoanOptionButton>

                <LoanOptionButton onClick={handleBusinessLoan}>
                  Tư vấn vay doanh nghiệp
                </LoanOptionButton>

                <LoanOptionButton onClick={handleUnsecuredLoan}>
                  Tư vấn vay tín chấp
                </LoanOptionButton>
              </div>
            )}
            {/* NÚT CHỌN BROKER KHI DỊCH VỤ KHÔNG HỖ TRỢ */}
          {showBrokerOptions && !isTyping && (
  <div
    style={{
      marginTop: 16,
      display: "flex",            // ✅ đổi inline-flex -> flex
      justifyContent: "flex-start",
      width: "100%",              // ✅ đảm bảo full hàng
      animation: "fadeInUp 0.4s ease-out",
    }}
  >
    <LoanOptionButton
      isMobile={isMobile}
      onClick={() => (window.location.href = "/brokers")}
    >
      👉 Kết nối đến các Broker!
    </LoanOptionButton>
  </div>
)}

            {/* KHU VỰC SINH SỐNG */}
            {showAreaOptions && (
              <div
                style={{
                  ...optionsContainer,
                  marginTop: 16,
                  animation: "fadeInUp 0.4s ease-out",
                }}
              >
                <LoanOptionButton
                  onClick={() =>
                    handleSelectArea("TP. Hồ Chí Minh và các tỉnh lân cận")
                  }
                >
                  TP. Hồ Chí Minh và các tỉnh lân cận
                </LoanOptionButton>

                <LoanOptionButton
                  onClick={() => handleSelectArea("Khu vực khác")}
                >
                  Khu vực khác
                </LoanOptionButton>
              </div>
            )}

            {/* INPUT TÊN KHÁCH HÀNG */}
          {showNameInput && (
  <div
    style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      marginTop: 10,

      // ✅ Mobile full width, Desktop co theo nội dung
      width: isMobile ? "100%" : "fit-content",
      alignSelf: isMobile ? "stretch" : "flex-start",

      // căn theo từng mode
      alignItems: isMobile ? "stretch" : "center",
    }}
  >
    <input
      type="text"
      value={fullName}
      placeholder="Nhập họ và tên của bạn..."
      onChange={(e) => setFullName(e.target.value)}
      style={{
        // ✅ Mobile full width, Desktop cố định vừa đẹp
        width: isMobile ? "100%" : 360,
        flex: isMobile ? "1 1 auto" : "0 0 360px",
        minWidth: 0,

        height: 44,
        padding: "0 16px",
        borderRadius: 999,
        border: "1px solid #c7d2fe",
        outline: "none",
        fontSize: 14,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    />

    <button
      onClick={() => {
        if (!fullName.trim()) return;

        setMessages((prev) => [
          ...prev,
          { id: createId(), from: "user", text: fullName },
        ]);

        setShowNameInput(false);
        setShowAgeInput(false);

        const botText = `Cảm ơn Quý khách ${fullName} 🙏 Quý khách vui lòng cho Kenta biết độ tuổi của mình nhé.`;

        typeBotMessage(botText);

        const delay = botText.length * 20 + 500;

        setTimeout(() => {
          setShowAgeInput(true);
        }, delay);
      }}
      style={{
        width: isMobile ? "100%" : "auto",
        height: 44,
        padding: "0 18px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Xác nhận
    </button>
  </div>
)}


            {/* NHẬP TUỔI */}
            {showAgeInput && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    background: "#f8fbff",
                    padding: "10px 12px",
                    borderRadius: 20,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.08)",
                  }}
                >
                  <input
                    type="number"
                    value={age}
                    placeholder="Nhập độ tuổi..."
                    onChange={(e) => setAge(e.target.value)}
                    style={{
                      width: 120,
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "1px solid #c7d2fe",
                      outline: "none",
                      fontSize: 14,
                    }}
                  />

                  <button
                    onClick={() => {
                      const ageNumber = parseInt(age, 10);
                      if (!ageNumber) return;

                      setMessages((prev) => [
                        ...prev,
                        {
                          id: createId(),
                          from: "user",
                          text: `${ageNumber} tuổi`,
                        },
                      ]);

                      setShowAgeInput(false);
                      setShowLoanAmountInput(false);

                      if (ageNumber < 18) {
                        typeBotMessage(
                          "Rất tiếc 😔 Quý khách chưa thuộc đối tượng được cấp tín dụng theo quy định hiện hành."
                        );
                        return;
                      }

                      if (ageNumber <= 65) {
                        const botText =
                          "✅ Độ tuổi của Quý khách phù hợp với tiêu chuẩn cấp tín dụng. Kenta sẽ tiếp tục thu thập thêm thông tin. Trước hết, Quý khách vui lòng cho Kenta biết số tiền dự kiến cần vay (VNĐ) nhé.";

                        typeBotMessage(botText);

                        const delay = botText.length * 20 + 500;
                        setTimeout(() => {
                          setShowLoanAmountInput(true);
                        }, delay);
                        return;
                      }

                      const botText =
                        "Quý khách thuộc nhóm cần được thẩm định kỹ hơn. Tuy nhiên, Kenta vẫn tiếp tục hỗ trợ tư vấn. Quý khách vui lòng cho biết số tiền dự kiến cần vay (VNĐ) nhé.";

                      typeBotMessage(botText);

                      const delay = botText.length * 20 + 500;
                      setTimeout(() => {
                        setShowLoanAmountInput(true);
                      }, delay);
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "none",
                      background:
                        "linear-gradient(135deg,#2563eb,#1d4ed8)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}

         {showLoanAmountInput && (
  <div
    style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      marginTop: 10,

      width: isMobile ? "100%" : "fit-content",
      alignSelf: isMobile ? "stretch" : "flex-start",
      alignItems: isMobile ? "stretch" : "center",
    }}
  >
    <input
      type="text"
      inputMode="numeric"
      placeholder="Nhập số tiền vay (VNĐ)..."
      value={loanAmount}
      onChange={(e) => setLoanAmount(formatMoney(e.target.value))}
      style={{
        width: isMobile ? "100%" : 360,
        flex: isMobile ? "1 1 auto" : "0 0 360px",
        minWidth: 0,

        height: 44,
        padding: "0 16px",
        borderRadius: 999,
        border: "1px solid #c7d2fe",
        outline: "none",
        fontSize: 14,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
    />

    <button
      onClick={() => {
        const rawAmount = parseInt(loanAmount.replace(/,/g, ""), 10);
        if (!rawAmount || rawAmount <= 0) return;

        setMessages((prev) => [
          ...prev,
          { id: createId(), from: "user", text: loanAmount + " VNĐ" },
        ]);

        setShowLoanAmountInput(false);
        setShowPurposeOptions(false);

        if (rawAmount < 1_000_000_000) {
          typeBotMessage(
            "❌ Rất tiếc, hiện tại Kenta chỉ hỗ trợ các hồ sơ vay từ 1 tỷ đồng trở lên."
          );
          return;
        }

        const botText =
          "✅ Số tiền vay dự kiến phù hợp với tiêu chuẩn hiện tại. Tiếp theo, Quý khách vui lòng cho Kenta biết mục đích khoản vay là gì nhé.";

        typeBotMessage(botText);

        const delay = botText.length * 20 + 500;
        setTimeout(() => {
          setShowPurposeOptions(true);
        }, delay);
      }}
      style={{
        width: isMobile ? "100%" : "auto",
        height: 44,
        padding: "0 18px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Xác nhận
    </button>
  </div>
)}

            {/* NÚT CHỌN MỤC ĐÍCH VAY */}
            {showPurposeOptions && (
              <div
                style={{
                  ...optionsContainer,
                  marginTop: 12,
                }}
              >
                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectPurpose("Mua nhà / mua bất động sản")
                  }
                >
                  Mua nhà / mua bất động sản
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectPurpose("Mở rộng, bổ sung vốn kinh doanh")
                  }
                >
                  Bổ sung vốn kinh doanh
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectPurpose(
                      "Tiêu dùng cá nhân (xe cộ, nội thất, học tập...)"
                    )
                  }
                >
                  Tiêu dùng cá nhân
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() => handleSelectPurpose("Mục đích khác")}
                >
                  Mục đích khác
                </LoanOptionButton>
              </div>
            )}

           {/* GIAO DIỆN NHẬP THU NHẬP HÀNG THÁNG */}
{showIncomeInput && (
  <div
    style={{
      marginTop: 14,
      display: "flex",
      justifyContent: "flex-start",
      width: "100%",
      maxWidth: isMobile ? "100%" : 520, // desktop giới hạn đẹp
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,

        // ✅ quan trọng: cho khung co giãn theo màn hình
        width: "100%",
        padding: "10px 12px",
        borderRadius: 999,
        background: "rgba(248,250,252,0.95)",
        boxShadow: "0 4px 12px rgba(148,163,184,0.25)",
        border: "1px solid rgba(148,163,184,0.35)",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="Tổng thu nhập hàng tháng (VNĐ)..."
        value={monthlyIncome}
        onChange={(e) => setMonthlyIncome(formatMoney(e.target.value))}
        style={{
          // ✅ mobile: full width, desktop: không quá dài
          flex: 1,
          width: "100%",
          maxWidth: isMobile ? "100%" : 320,

          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #c7d2fe",
          outline: "none",
          fontSize: 14,
          boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
          background: "#ffffff",
        }}
      />

      <button
        onClick={() => {
          const rawIncome = parseInt(monthlyIncome.replace(/,/g, ""), 10);
          if (!rawIncome) return;

          setMessages((prev) => [
            ...prev,
            { id: createId(), from: "user", text: monthlyIncome + " VNĐ/Tháng" },
          ]);

          setShowIncomeInput(false);

          const firstText =
            "✅ Kenta đã ghi nhận mức thu nhập của Quý khách. Hệ thống sẽ tiếp tục phân tích và đề xuất hạn mức vay phù hợp nhất.";

          typeBotMessage(firstText);
          const delay1 = firstText.length * 20 + 400;

          setTimeout(() => {
            const secondText =
              "✅ Tiếp theo, Quý khách vui lòng cho Kenta biết loại tài sản sử dụng để đảm bảo khoản vay nhé.";

            typeBotMessage(secondText);
            const delay2 = secondText.length * 20 + 300;

            setTimeout(() => {
              setShowCollateralOptions(true);
            }, delay2);
          }, delay1);
        }}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          whiteSpace: "nowrap", // ✅ không bị xuống dòng
          flexShrink: 0,        // ✅ nút không bị bóp méo
        }}
      >
        Xác nhận
      </button>
    </div>
  </div>
)}

            {/* NÚT CHỌN LOẠI TÀI SẢN BẢO ĐẢM */}
            {showCollateralOptions && (
              <div
                style={{
                  ...optionsContainer,
                  marginTop: 12,
                }}
              >
                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() => handleSelectCollateral("Nhà ở / Đất ở")}
                >
                  Nhà ở / Đất ở
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectCollateral("Đất ở + Đất nông nghiệp")
                  }
                >
                  Đất ở + Đất nông nghiệp
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() => handleSelectCollateral("Đất nông nghiệp")}
                >
                  Đất nông nghiệp
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectCollateral("Đất SXKD / Nhà xưởng")
                  }
                >
                  Đất SXKD / Nhà xưởng
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() => handleSelectCollateral("Khác")}
                >
                  Khác
                </LoanOptionButton>
              </div>
            )}

           {/* GIAO DIỆN NHẬP GIÁ TRỊ TÀI SẢN BẢO ĐẢM */}
{showCollateralValueInput && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      marginTop: 10,
      width: "100%",
      maxWidth: isMobile ? "100%" : 520, // desktop giới hạn đẹp
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,

        width: "100%",
        padding: "10px 12px",
        borderRadius: 999,
        background: "rgba(248,250,252,0.95)",
        boxShadow: "0 4px 12px rgba(148,163,184,0.25)",
        border: "1px solid rgba(148,163,184,0.35)",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="Nhập giá trị tài sản (VNĐ)..."
        value={collateralValue}
        onChange={(e) => {
          const formatted = formatNumber(e.target.value);
          setCollateralValue(formatted);
        }}
        style={{
          flex: 1,
          width: "100%",
          maxWidth: isMobile ? "100%" : 320, // ✅ desktop không quá dài
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #c7d2fe",
          outline: "none",
          fontSize: 14,
          boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
          background: "#ffffff",
        }}
      />

      <button
        onClick={() => {
          const rawValue = parseInt(collateralValue.replace(/[^\d]/g, ""), 10);

          if (!rawValue || isNaN(rawValue)) {
            typeBotMessage("Quý khách vui lòng nhập giá trị tài sản hợp lệ (số tiền VNĐ).");
            return;
          }

          if (rawValue < 1_000_000_000) {
            const warnText =
              "Kenta chỉ hỗ trợ đối với các món vay từ 1 tỷ trở lên nên tài sản bảo đảm cũng phải lớn hơn 1 tỷ đồng.";
            typeBotMessage(warnText);
            return;
          }

          setMessages((prev) => [
            ...prev,
            { id: createId(), from: "user", text: collateralValue + " VNĐ" },
          ]);

          setShowCollateralValueInput(false);

          const firstText =
            "✅ Kenta đã ghi nhận giá trị tài sản bảo đảm. Hệ thống sẽ dựa trên thông tin này để đề xuất hạn mức vay và phương án phù hợp nhất cho Quý khách.";

          typeBotMessage(firstText);
          const delay1 = firstText.length * 20 + 400;

          setTimeout(() => {
            const secondText = "📊 Tình trạng tín dụng hiện tại của Quý khách như thế nào?";
            typeBotMessage(secondText);
            const delay2 = secondText.length * 20 + 300;

            setTimeout(() => {
              setShowCreditOptions(true);
            }, delay2);
          }, delay1);
        }}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0, // ✅ nút không bị bóp
        }}
      >
        Xác nhận
      </button>
    </div>
  </div>
)}


            {/* NÚT CHỌN TÌNH TRẠNG TÍN DỤNG */}
            {showCreditOptions && (
              <div
                style={{
                  ...optionsContainer,
                  marginTop: 12,
                }}
              >
                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectCreditStatus("Chưa từng vay")
                  }
                >
                  Chưa từng vay
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectCreditStatus("Đã vay và thanh toán tốt")
                  }
                >
                  Đã vay và thanh toán tốt
                </LoanOptionButton>

                <LoanOptionButton
                  isMobile={isMobile}
                  onClick={() =>
                    handleSelectCreditStatus("Đang có nợ quá hạn")
                  }
                >
                  Đang có nợ quá hạn
                </LoanOptionButton>
              </div>
            )}

            {/* NÚT KẾT THÚC BUỔI TƯ VẤN */}
            {showFinishButton && (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  animation: "botFade 0.4s ease-out",
                }}
              >
                <button
                  onClick={handleOpenReport}
                  disabled={isCreatingReport}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 999,
                    border: "none",
                    background: isCreatingReport
                      ? "#cbd5e1"
                      : "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: isCreatingReport ? "default" : "pointer",
                    boxShadow: isCreatingReport
                      ? "none"
                      : "0 8px 20px rgba(22,163,74,0.35)",
                  }}
                >
                  {isCreatingReport
                    ? "Đang tạo báo cáo..."
                    : "✅ Hoàn tất hồ sơ"}
                </button>
              </div>
            )}
          </>
        )}

        {/* BƯỚC NHẬP SỐ ĐIỆN THOẠI TRƯỚC KHI SHOW REPORT */}
        {isPhoneStep && !showReport && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Nhập số điện thoại"
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 18,
              paddingBottom: 28,
            }}
          >
            <div
              style={{
                width: "min(520px, 92%)",
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                border: "1px solid rgba(15,23,42,0.04)",
                padding: 22,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {/* lock svg */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg,#eef2ff,#e6f0ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "inset 0 -4px 12px rgba(37,99,235,0.06)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M17 8V7a5 5 0 10-10 0v1"
                      stroke="#2563EB"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="3"
                      y="8"
                      width="18"
                      height="13"
                      rx="2"
                      stroke="#2563EB"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.1,
                    }}
                  >
                    Nhập số điện thoại để hoàn tất hồ sơ
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#475569",
                      marginTop: 6,
                      maxWidth: 420,
                    }}
                  >
                    Vui lòng cung cấp số điện thoại để chuyên viên
                    Kenta xác minh & liên hệ. Số này chỉ dùng để liên hệ
                    — <strong>hoàn toàn được bảo mật</strong>.
                  </div>
                </div>
              </div>

              {/* Security box */}
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background:
                    "linear-gradient(90deg, rgba(237,246,255,0.9), rgba(250,249,255,0.7))",
                  border:
                    "1px solid rgba(37,99,235,0.06)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 4px 12px rgba(37,99,235,0.06)",
                    flex: "0 0 36px",
                  }}
                >
                  🔒
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#334155",
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: "#0f172a" }}>
                    Thông tin được bảo mật tuyệt đối.
                  </strong>
                  <div
                    style={{
                      marginTop: 6,
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Số điện thoại chỉ dùng để xác minh hồ sơ và{" "}
                    <strong>không chia sẻ</strong> với bên thứ ba. Nếu
                    muốn, Quý khách có thể yêu cầu xóa thông tin sau
                    khi hoàn tất.
                  </div>
                </div>
              </div>

              {/* Input */}
              <div style={{ marginTop: 16 }}>
                <label
                  htmlFor="phone-input"
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#475569",
                    marginBottom: 8,
                  }}
                >
                  Số điện thoại
                </label>

                <input
                  id="phone-input"
                  type="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(
                      /[^\d\s+()-]/g,
                      ""
                    );
                    setPhoneNumber(v);
                  }}
                  placeholder="VD: 0909 123 456"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 10,
                    border:
                      "1px solid rgba(15,23,42,0.08)",
                    fontSize: 15,
                    outline: "none",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                  aria-label="Số điện thoại"
                />
              </div>

              {/* Buttons / hint */}
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleConfirmPhone}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#2563eb,#4f46e5)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 20px rgba(37,99,235,0.16)",
                  }}
                >
                  Xác nhận & Hoàn tất
                </button>

                <button
                  onClick={() => {
                    setPhoneNumber("");
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border:
                      "1px solid rgba(15,23,42,0.06)",
                    background: "#fff",
                    color: "#0f172a",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              </div>

              {/* small privacy note */}
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                Bạn có quyền từ chối cung cấp. Bằng cách xác nhận,
                bạn đồng ý Kenta được liên hệ để xác minh hồ sơ.
              </div>
            </div>
          </div>
        )}

       {/* GIAO DIỆN BÁO CÁO KẾT QUẢ CUỐI CÙNG */}
{showReport && report ? (
  isMobile ? (
    <MobileLoanReport
      report={report}
      fullName={fullName}
      onClose={() => {
        router.push("/"); // (1) Đóng -> Trang chủ
      }}
      onEdit={() => {
        router.replace("/chatbot");
        setTimeout(() => window.location.reload(), 10); // (2) Sửa -> quay lại chatbot từ đầu
      }}
      onFinish={() => {
        // (4) Hoàn tất -> show câu 5s rồi về trang chủ
        setShowFinalNotice(true);

        // ẩn report & chat
        setShowReport(false);
        setHideChatContent(true);

        setTimeout(() => {
          router.push("/");
        }, 5000);
      }}
      formatPhone={formatPhone}
      interestOnlyPayment={interestOnlyPayment}
  fullPayment={fullPayment}
  loanToValue={loanToValue}
  dsrPercent={dsrPercent}
    />
  ) : (
    /* ===== DESKTOP: GIỮ NGUYÊN REPORT CŨ (block bạn gửi) ===== */
    <div
      style={{
        marginTop: 36,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 12,
          background: "#ffffff",
          boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
          padding: "18px 20px",
          border: "1px solid rgba(15,23,42,0.04)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg,#2563eb,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
              }}
            >
              📄
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Tóm tắt hồ sơ vay Kenta
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Hồ sơ đã được lưu trên hệ thống Kenta
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => window.print()}
              style={{
                fontSize: 13,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(15,23,42,0.06)",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              In
            </button>

            <button
  onClick={() => {
    // 👉 SỬA: quay lại chatbot từ đầu
    router.replace("/chatbot");
    setTimeout(() => {
      window.location.reload();
    }, 10);
  }}
  style={{
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(37,99,235,0.12)",
    background: "linear-gradient(135deg,#eef2ff,#eef6ff)",
    cursor: "pointer",
    color: "#1e3a8a",
    fontWeight: 600,
  }}
>
  Sửa
</button>

<button
  onClick={() => {
    // 👉 ĐÓNG: về trang chủ
    router.push("/");
  }}
  style={{
    fontSize: 13,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(15,23,42,0.06)",
    background: "#fff",
    cursor: "pointer",
  }}
>
  Đóng
</button>
          </div>
        </div>

        {/* two-column summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Khách hàng</div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                marginTop: 6,
              }}
            >
              {fullName || report.fullName || "—"}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Số điện thoại</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                {report.phoneNumber ? formatPhone(report.phoneNumber) : "—"}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                Khu vực sinh sống
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                {report.livingArea || "—"}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Thu nhập</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                {report.monthlyIncome
                  ? report.monthlyIncome.toLocaleString("vi-VN") + " /tháng"
                  : "—"}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Tài sản bảo đảm</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                marginTop: 6,
              }}
            >
              {report.collateralType || "—"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#1d4ed8",
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              {report.collateralValue
                ? report.collateralValue.toLocaleString("vi-VN") + " VNĐ"
                : "—"}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Nhu cầu vay</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                {report.loanAmount
                  ? report.loanAmount.toLocaleString("vi-VN") + " VNĐ"
                  : "—"}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                Tình trạng tín dụng
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                {report.creditStatus || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* compact progress bar (monthly obligation) */}
        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 10,
            background: "#fff",
            border: "1px solid rgba(15,23,42,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              Khoảng nghĩa vụ trả nợ hàng tháng
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {interestOnlyPayment
                ? interestOnlyPayment.toLocaleString("vi-VN") + " VNĐ"
                : "—"}{" "}
              →{" "}
              {fullPayment ? fullPayment.toLocaleString("vi-VN") + " VNĐ" : "—"}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: "rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    fullPayment && interestOnlyPayment
                      ? `${Math.max(
                          6,
                          (interestOnlyPayment / fullPayment) * 100
                        )}%`
                      : "40%",
                  height: "100%",
                  background: "linear-gradient(90deg,#34d399,#86efac)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              <div>
                Chỉ lãi:{" "}
                <strong style={{ color: "#0f172a" }}>
                  {interestOnlyPayment
                    ? interestOnlyPayment.toLocaleString("vi-VN") +
                      " VNĐ / tháng"
                    : "—"}
                </strong>
              </div>
              <div>
                Gốc + lãi:{" "}
                <strong style={{ color: "#0f172a" }}>
                  {fullPayment
                    ? fullPayment.toLocaleString("vi-VN") + " VNĐ / tháng"
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            DSR ước tính:{" "}
            <strong>{dsrPercent != null ? dsrPercent + "%" : "—"}</strong> · LTV:{" "}
            <strong>
              {loanToValue != null ? Math.round(loanToValue * 100) + "%" : "—"}
            </strong>
          </div>
        </div>

        {/* condensed remarks */}
        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 10,
            background: "rgba(248,250,252,0.9)",
            border: "1px solid rgba(148,163,184,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#0f172a",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Nhận xét sơ bộ của Kenta
          </div>

          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>
              Độ tuổi: <strong>{report.age ? report.age + " tuổi" : "—"}</strong>.
            </div>
            <div style={{ marginBottom: 8 }}>
              Ước tính KH phải trả:{" "}
              <strong>
                {interestOnlyPayment
                  ? interestOnlyPayment.toLocaleString("vi-VN") +
                    " VNĐ (chỉ lãi)"
                  : "—"}
              </strong>{" "}
              →{" "}
              <strong>
                {fullPayment
                  ? fullPayment.toLocaleString("vi-VN") +
                    " VNĐ (gốc + lãi)"
                  : "—"}
              </strong>
              .
            </div>
            <div style={{ marginBottom: 6 }}>
              LTV ước tính:{" "}
              <strong>
                {loanToValue != null ? Math.round(loanToValue * 100) + "%" : "—"}
              </strong>
              . DSR ước tính:{" "}
              <strong>{dsrPercent != null ? dsrPercent + "%" : "—"}</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
): null}
        {/* ĐÁY KHUNG CHAT ĐỂ AUTO SCROLL */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
// ===== MOBILE REPORT COMPONENT =====
function MobileLoanReport({
  report,
  fullName,
  onClose,
  onEdit,
  onFinish,
  formatPhone,
  interestOnlyPayment,
  fullPayment,
  loanToValue,
  dsrPercent,
}: {
  report: any;
  fullName: string;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  formatPhone: (s?: string) => string;
  interestOnlyPayment: number | null;
  fullPayment: number | null;
  loanToValue: number | null;
  dsrPercent: number | null;
}) {
  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header nhẹ (giữ nút Đóng) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "linear-gradient(135deg,#2563eb,#4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 16,
            }}
          >
            📄
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Tóm tắt hồ sơ vay
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Hồ sơ đã được lưu trên hệ thống Kenta
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#fff",
            borderRadius: 12,
            padding: "8px 10px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đóng
        </button>
      </div>

      {/* Khách hàng */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 14,
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
          Khách hàng
        </div>

        <ReportRow label="Họ tên" value={fullName || report.fullName || "—"} />
        <ReportRow
          label="Số điện thoại"
          value={report.phoneNumber ? formatPhone(report.phoneNumber) : "—"}
        />
        <ReportRow label="Khu vực" value={report.livingArea || "—"} />
        <ReportRow
          label="Thu nhập"
          value={
            report.monthlyIncome ? report.monthlyIncome.toLocaleString("vi-VN") + " / tháng" : "—"
          }
          noBorder
        />
      </div>

      {/* Tài sản & khoản vay */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 14,
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
          Tài sản & khoản vay
        </div>

        <ReportRow label="Tài sản" value={report.collateralType || "—"} />
        <ReportRow
          label="Giá trị tài sản"
          value={
            report.collateralValue ? report.collateralValue.toLocaleString("vi-VN") + " VNĐ" : "—"
          }
        />
        <ReportRow
          label="Nhu cầu vay"
          value={report.loanAmount ? report.loanAmount.toLocaleString("vi-VN") + " VNĐ" : "—"}
        />
        <ReportRow label="Tín dụng" value={report.creditStatus || "—"} noBorder />
      </div>
      {/* Nhận xét sơ bộ */}
<div
  style={{
    background: "rgba(248,250,252,0.96)",
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
  }}
>
  <div
    style={{
      fontSize: 13,
      fontWeight: 800,
      color: "#0f172a",
      marginBottom: 10,
    }}
  >
    Nhận xét sơ bộ của Kenta
  </div>

  {/* Chips nhanh: LTV / DSR */}
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.06)",
        fontSize: 12,
        color: "#0f172a",
        fontWeight: 800,
      }}
    >
      LTV: {loanToValue != null ? Math.round(loanToValue * 100) + "%" : "—"}
    </div>

    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.06)",
        fontSize: 12,
        color: "#0f172a",
        fontWeight: 800,
      }}
    >
      DSR: {dsrPercent != null ? dsrPercent + "%" : "—"}
    </div>
  </div>

  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
      • Khoản phải trả ước tính hàng tháng:{" "}
      <strong style={{ color: "#0f172a" }}>
        {interestOnlyPayment != null
          ? interestOnlyPayment.toLocaleString("vi-VN") + " VNĐ"
          : "—"}
      </strong>{" "}
      <span style={{ color: "#64748b" }}>(chỉ lãi)</span>{" "}
      →{" "}
      <strong style={{ color: "#0f172a" }}>
        {fullPayment != null ? fullPayment.toLocaleString("vi-VN") + " VNĐ" : "—"}
      </strong>{" "}
      <span style={{ color: "#64748b" }}>(gốc + lãi)</span>.
    </div>

    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
      • Tỷ lệ vay / TSBĐ (LTV):{" "}
      <strong style={{ color: "#0f172a" }}>
        {loanToValue != null ? Math.round(loanToValue * 100) + "%" : "—"}
      </strong>
      {report?.loanAmount && report?.collateralValue ? (
        <span style={{ color: "#64748b" }}>
          {" "}
          (vay {report.loanAmount.toLocaleString("vi-VN")} / TSBĐ{" "}
          {report.collateralValue.toLocaleString("vi-VN")} VNĐ)
        </span>
      ) : null}
      .
    </div>

    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
      • Nghĩa vụ trả nợ / Thu nhập (DSR):{" "}
      <strong style={{ color: "#0f172a" }}>
        {dsrPercent != null ? dsrPercent + "%" : "—"}
      </strong>
      {report?.monthlyIncome ? (
  <span style={{ color: "#64748b" }}>
    {" "}
    (thu nhập {report.monthlyIncome.toLocaleString("vi-VN")} / tháng)
  </span>
) : null}
      .
    </div>

    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
      • Tín dụng:{" "}
      <strong style={{ color: "#0f172a" }}>{report.creditStatus || "—"}</strong>. Kenta sẽ
      chuyển hồ sơ đến chuyên viên để tư vấn phương án phù hợp.
    </div>

    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
      *Lưu ý: Các con số là ước tính tham khảo. Điều kiện duyệt vay phụ thuộc quy định và
      thẩm định thực tế của ngân hàng/đối tác.
    </div>
  </div>
</div>


      {/* Actions sticky */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          paddingTop: 10,
          paddingBottom: 10,
          background:
            "linear-gradient(180deg, rgba(245,249,255,0), rgba(245,249,255,0.92) 35%, rgba(245,249,255,1))",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onFinish}
            style={{
              height: 46,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✅ Hoàn tất
          </button>

          <button
            onClick={onEdit}
            style={{
              height: 46,
              borderRadius: 14,
              border: "1px solid rgba(37,99,235,0.18)",
              background: "#fff",
              color: "#1e3a8a",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✏️ Sửa thông tin
          </button>

          {/* (3) BỎ NÚT IN/XUẤT PDF => KHÔNG CÒN Ở ĐÂY */}
        </div>
      </div>
    </div>
  );
}

function ReportRow({
  label,
  value,
  noBorder,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        padding: "8px 0",
        borderBottom: noBorder ? "none" : "1px solid rgba(15,23,42,0.06)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>
      <strong style={{ color: "#0f172a", fontWeight: 700, textAlign: "right" }}>
        {value}
      </strong>
    </div>
  );
}