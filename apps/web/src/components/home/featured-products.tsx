import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const featuresData = [
  {
    imgSrc: "/images/Features/featureOne.svg",
    heading: "Đa dạng thực đơn",
    subheading: "Bơ lạc, hạt điều, khô sấy, mắm tép — đầy đủ khẩu vị",
  },
  {
    imgSrc: "/images/Features/featureTwo.svg",
    heading: "Nguyên liệu sạch",
    subheading: "100% tự nhiên, không chất bảo quản, không phụ gia",
  },
  {
    imgSrc: "/images/Features/featureThree.svg",
    heading: "Mẹ tự tay làm",
    subheading: "Từng mẻ nhỏ được chăm chút như nấu cho gia đình",
  },
  {
    imgSrc: "/images/Features/featureFour.svg",
    heading: "Giao hàng nhanh",
    subheading: "Đóng gói cẩn thận, giao tận tay toàn quốc 1–2 ngày",
  },
];

export function FeaturedProducts() {
  return (
    <section>
      <div
        className="container mx-auto max-w-7xl px-4"
        id="about-section"
      >
        <div className="text-center mb-14">
          <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
            Đặc điểm nổi bật
          </p>
          <h2 className="text-3xl lg:text-5xl font-semibold text-black max-w-lg mx-auto">
            Nhiều điều thú vị đang chờ bạn.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-5 mt-32">
          {featuresData.map((item, i) => (
            <div
              key={i}
              className="p-8 relative rounded-3xl bg-linear-to-b from-black/5 to-white"
            >
              <div className="rounded-full flex justify-center absolute top-[-45%] left-0 w-full">
                <Image
                  src={item.imgSrc}
                  alt={item.heading}
                  width={200}
                  height={200}
                />
              </div>
              <h3 className="text-2xl text-black font-semibold text-center mt-16">
                {item.heading}
              </h3>
              <p className="text-lg font-normal text-black/50 text-center mt-2">
                {item.subheading}
              </p>
              <div className="flex items-center justify-center">
                <Link
                  href="#cook-section"
                  className="text-center text-lg font-medium text-primary mt-2 flex items-center gap-1 hover:underline"
                >
                  Tìm hiểu thêm
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
