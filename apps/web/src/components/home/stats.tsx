import { staticUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const galleryImages = [
  {
    src: staticUrl("images/foodone.jpg"),
    name: "Caesar Salad (187 Kcal)",
    price: "35.000đ",
  },
  {
    src: staticUrl("images/foodtwo.jpg"),
    name: "Salad Giáng Sinh (118 Kcal)",
    price: "17.000đ",
  },
  {
    src: staticUrl("images/foodthree.jpg"),
    name: "Nấm xào bí đao ớt ngọt (238 kcal)",
    price: "45.000đ",
  },
  {
    src: staticUrl("images/foodfour.jpg"),
    name: "BBQ Chicken Pizza (272 kcal)",
    price: "27.000đ",
  },
];

export function Stats() {
  return (
    <section>
      <div className="container mx-auto max-w-7xl px-4" id="gallery-section">
        <div className="text-center">
          <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
            Thư viện ảnh
          </p>
          <h2 className="text-3xl lg:text-5xl font-semibold text-black">
            Những món ăn do chúng tôi chế biến.
          </h2>
        </div>
        <div className="my-16 px-6">
          <div className="columns-1 sm:columns-2 gap-6">
            {galleryImages.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl mb-6 relative group break-inside-avoid"
              >
                <Image
                  src={item.src}
                  alt={item.name}
                  width={600}
                  height={500}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div className="w-full h-full absolute bg-black/40 top-full group-hover:top-0 duration-500 p-12 flex flex-col items-start gap-8 justify-end">
                  <p className="text-white text-2xl">
                    <span className="font-semibold">Tên:</span> {item.name}
                  </p>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-white text-2xl">
                      <span className="font-semibold">Giá:</span> {item.price}
                    </p>
                    <Button size="pill" render={<Link href="#" />}>
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
