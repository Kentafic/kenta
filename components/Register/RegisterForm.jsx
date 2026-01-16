import Link from "next/link";

const handleSubmit = (e) => {
  e.preventDefault();

  const fullname = e.target.fullname.value.trim();
  const position = e.target.position.value.trim();
  const bank = e.target.bank.value.trim();
  const phone = e.target.phone.value.trim();

  if (!fullname || !position || !bank || !phone) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    return;
  }

  const phoneRegex = /^(0[0-9]{9})$/; 
  if (!phoneRegex.test(phone)) {
    alert("Số điện thoại không hợp lệ! Ví dụ: 0988123456");
    return;
  }

  console.log("Dữ liệu hợp lệ — ready send!", { fullname, position, bank, phone });
  alert("Thông tin đã được ghi nhận. Đội ngũ Kenta sẽ liên hệ sớm!");
};

const RegisterForm = () => {
  // 👇 Thêm đoạn này vào
  const handleSubmit = (e) => {
    e.preventDefault(); // chặn reload trang

    // TODO: sau này gửi dữ liệu lên API / Zalo / Google Sheet ở đây
    console.log("Submit form đối tác Kenta");
  };

  return (
    <section className="sign-in-up register partner-register">
      <div className="overlay pt-120 pb-120">
        <div className="container">
          <div className="row justify-content-between align-items-start gy-5">
            {/* Cột trái: nội dung giới thiệu & lợi ích */}
            <div className="col-lg-6">
              <div className="form-content partner-content">
                <div className="section-header mb-4">
                  <h5 className="sub-title">
                    Dành riêng cho cán bộ ngân hàng &amp; quản lý tín dụng.
                  </h5>
                  <h2 className="title">Trở thành đối tác liên kết với Kenta!</h2>
                  <p className="desc">
                    Bạn là quản lý tín dụng hoặc cán bộ ngân hàng có kinh nghiệm? Hãy
                    cùng Kenta mở rộng mạng lưới tư vấn vay vốn, hỗ trợ khách hàng
                    tiếp cận giải pháp tài chính tối ưu với tốc độ nhanh hơn – hiệu
                    quả hơn.
                  </p>
                </div>

                {/* 3 “chip” nhỏ cho vibe fintech */}
                <div className="partner-chips mb-4">
                  <span className="chip">Bảo mật Thông tin</span>
                  <span className="chip">Minh bạch Hồ sơ vay</span>
                  <span className="chip">Đồng hành cùng Đối tác</span>
                </div>

                {/* Card 1 – Lợi ích */}
                <div className="partner-card mb-3">
                  <h6 className="partner-subtitle">
                    1. Lợi ích khi trở thành đối tác liên kết của Kenta
                  </h6>
                  <p className="desc mb-1">
                    • Nguồn khách hàng ổn định từ hệ sinh thái Kenta
                  </p>
                  <p className="desc mb-1">
                    • Tăng thu nhập minh bạch theo từng hồ sơ giải ngân
                  </p>
                  <p className="desc mb-1">
                    • Được hỗ trợ phân tích hồ sơ, tối ưu phương án vay cho khách hàng
                  </p>
                  <p className="desc mb-0">
                    • Quy trình làm việc rõ ràng, ưu tiên tốc độ và hiệu quả
                  </p>
                </div>

                {/* Card 2 – Điều kiện */}
                <div className="partner-card mb-3">
                  <h6 className="partner-subtitle">
                    2. Điều kiện đăng ký trở thành đối tác
                  </h6>
                  <p className="desc mb-1">
                    • Đang công tác tại ngân hàng hoặc tổ chức tín dụng hợp pháp
                  </p>
                  <p className="desc mb-1">
                    • Vị trí tối thiểu: Trưởng phòng / Quản lý tín dụng / RM Senior
                    trở lên
                  </p>
                  <p className="desc mb-1">
                    • Tối thiểu 05 năm kinh nghiệm trong mảng cho vay hoặc tư vấn tài
                    chính
                  </p>
                  <p className="desc mb-1">
                    • Tinh thần hợp tác, đặt lợi ích khách hàng làm trọng tâm
                  </p>
                  <p className="desc mb-0">
                    • Cam kết tuân thủ quy định nội bộ và quy định pháp luật hiện
                    hành
                  </p>
                </div>

                {/* Card 3 – Quy trình */}
                <div className="partner-card mb-3">
                  <h6 className="partner-subtitle">
                    3. Quy trình hợp tác với Kenta
                  </h6>
                  <p className="desc mb-1">
                    1. Gửi thông tin đăng ký trên form trực tuyến của Kenta
                  </p>
                  <p className="desc mb-1">
                    2. Kenta liên hệ xác minh &amp; trao đổi sơ bộ về mô hình hợp tác
                  </p>
                  <p className="desc mb-1">
                    3. Ký thỏa thuận hợp tác &amp; thiết lập kênh làm việc
                  </p>
                  <p className="desc mb-0">
                    4. Nhận khách hàng từ Kenta và bắt đầu phối hợp xử lý hồ sơ KH
                  </p>
                </div>

                {/* Card 4 – Thông điệp */}
                <div className="partner-card">
                  <h6 className="partner-subtitle">Thông điệp của Kenta!</h6>
                  <p className="desc mb-1">Cùng nhau tạo giá trị cho khách hàng</p>
                  <p className="desc mb-1">Mỗi hồ sơ vay vốn là một câu chuyện phía sau.</p>
                  <p className="desc mb-0">
                    Kenta mong muốn đồng hành cùng anh/chị – những người trực tiếp làm
                    việc và tiếp xúc với khách hàng.
                  </p>
                </div>
              </div>
            </div>

           {/* Cột phải: Form đăng ký (card trắng, shadow) */}
<div className="col-lg-5">
  <div className="form-content partner-form">
    <form onSubmit={handleSubmit}>
      <div className="row">

        {/* Họ và tên */}
        <div className="col-12 mb-3">
          <div className="single-input">
            <label htmlFor="fullName">Họ và tên*</label>
            <input
              id="fname"
              name="fullname"
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </div>
        </div>

        {/* Chức danh/Vị trí hiện tại */}
        <div className="col-12 mb-3">
          <div className="single-input">
            <label htmlFor="position">Chức danh/ Vị trí làm việc*</label>
            <input
              id="lname"
              name="position"
              placeholder="VD: GĐ CN/PGD - Trưởng phòng KHCN/DN"
              required
            />
          </div>
        </div>

        {/* Nơi công tác */}
        <div className="col-12 mb-3">
          <div className="single-input">
            <label htmlFor="bank">Tổ chức tín dụng đang công tác*</label>
            <input
              id="bank"
              name="place"
              placeholder="Nhập tên Ngân hàng / Tổ chức tín dụng"
              required
            />
          </div>
        </div>

        {/* Số điện thoại (validation số) */}
        <div className="col-12 mb-3">
          <div className="single-input">
            <label htmlFor="phone">Số điện thoại liên hệ*</label>
            <input
              id="phone"
              name="dienthoai"
              placeholder="098x xxx xxx"
              required
              pattern="(0[3|5|7|8|9])+([0-9]{8})\b"
              title="Số điện thoại phải gồm 10 số hợp lệ tại Việt Nam"
            />
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div className="col-12 mb-3">
          <div className="single-input">
            <p className="desc small-text">
              Hãy để lại thông tin, đội ngũ Kenta sẽ liên hệ xác minh và trao đổi hợp tác trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </div>

      <div className="btn-area mt-2">
        <button type="submit" className="cmn-btn w-100">
          Connect to Kenta
        </button>
      </div>
    </form>
  </div>
</div>
{/* hết col form */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
