import Image from "next/image";
import Link from "next/link";
import get_start from "/public/images/get-start.png";

const Ready = () => {
  return (
    <section className="get-start wow fadeInUp">
      <div className="overlay">
        <div className="container">
          <div className="col-12">
            <div className="get-content">
              <div className="section-text">
                <h3 className="title">Bạn đã sẵn sàng?</h3>
                <p>
                  Hãy liên hệ trực tiếp đến các Broker của Kenta.
                </p>
              </div>
              <Link href="/brokers" className="cmn-btn">
                Chọn Broker
              </Link>
              <Image src={get_start} alt="get start" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ready;
