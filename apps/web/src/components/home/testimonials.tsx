"use client";

import Image from "next/image";

const expertData = [
  { profession: "Bếp trưởng", name: "Nguyễn Văn An", imgSrc: "/images/Expert/boyone.svg" },
  { profession: "Bếp phó", name: "Trần Thị Lan", imgSrc: "/images/Expert/girl.png" },
  { profession: "Bếp phó", name: "Lê Minh Tuấn", imgSrc: "/images/Expert/boytwo.svg" },
  { profession: "Bếp phó", name: "Phạm Thu Hà", imgSrc: "/images/Expert/girl.png" },
  { profession: "Bếp trưởng", name: "Hoàng Đức Nam", imgSrc: "/images/Expert/boyone.svg" },
  { profession: "Bếp phó", name: "Vũ Quang Huy", imgSrc: "/images/Expert/boytwo.svg" },
];

export function Testimonials() {
  return (
    <section className="bg-primary/15">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
            ĐẦU BẾP CHUYÊN NGHIỆP
          </p>
          <h2 className="text-3xl lg:text-5xl font-semibold text-black">
            Gặp gỡ các chuyên gia của chúng tôi.
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-marquee">
            {[...expertData, ...expertData].map((item, i) => (
              <div key={i} className="shrink-0 w-1/3 min-w-70 px-3">
                <div className="py-14 my-10 text-center">
                  <div className="relative">
                    <Image
                      src={item.imgSrc}
                      alt={item.name}
                      width={362}
                      height={262}
                      className="inline-block m-auto"
                    />
                    <div className="absolute top-1/2 right-[2%]">
                      <Image
                        src="/images/Expert/Linkedin.svg"
                        alt="linkedin"
                        width={220}
                        height={120}
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-black">{item.name}</h3>
                  <h4 className="text-lg font-normal text-black/50 pt-4 pb-2">
                    {item.profession}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
