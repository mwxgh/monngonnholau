import Image from "next/image";
import Link from "next/link";

export function HowItWorks() {
  return (
    <section className="relative" id="cook-section">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="absolute right-0 bottom-[-18%] hidden lg:block">
          <Image
            src="/images/cook/burger.png"
            alt="burger"
            width={463}
            height={622}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 my-16 space-x-5">
          <div className="col-span-6 flex justify-start">
            <Image
              src="/images/cook/cook.png"
              alt="cook"
              width={636}
              height={808}
            />
          </div>
          <div className="col-span-6 flex flex-col justify-center">
            <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase text-start">
              nấu cùng chúng tôi
            </p>
            <h2 className="text-3xl lg:text-5xl font-semibold text-black text-start">
              Nấu ngon cùng những người thợ lành nghề.
            </h2>
            <p className="text-black/50 md:text-lg font-normal mb-10 text-start mt-2">
              Mỗi sản phẩm là cả một hành trình — từ chọn nguyên liệu, rang tay,
              xay thủ công đến đóng gói cẩn thận. Không dây chuyền, không đại
              trà, chỉ là tình yêu và sự tỉ mỉ.
            </p>
            <p className="text-black/50 md:text-lg font-normal mb-10 text-start mt-1">
              Chúng tôi tin rằng đồ ăn ngon nhất là đồ được làm bằng tâm — như
              mẹ vẫn làm cho cả gia đình mỗi ngày....
            </p>
            <Link
              href="#gallery-section"
              className="text-xl font-medium rounded-full text-white py-5 px-6 bg-primary lg:px-10 mr-6 w-fit border border-primary hover:bg-transparent hover:text-primary"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
