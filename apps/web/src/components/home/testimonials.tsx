import { Star, CheckCircle2 } from "lucide-react";

const reviews = [
  {
    name: "Nguyễn Thị Lan",
    location: "Hà Nội",
    rating: 5,
    text: "Bơ lạc ngon hơn hẳn mấy loại mua ngoài siêu thị. Thơm, béo ngậy mà không ngấy. Cả nhà đều mê!",
    product: "Bơ Lạc Thủ Công",
    avatar: "L",
  },
  {
    name: "Trần Văn Minh",
    location: "TP. Hồ Chí Minh",
    rating: 5,
    text: "Thịt lợn khô vừa miệng, không quá mặn, không quá ngọt. Đúng kiểu mẹ làm ngày xưa. Sẽ order thêm.",
    product: "Thịt Lợn Khô",
    avatar: "M",
  },
  {
    name: "Phạm Thu Hương",
    location: "Đà Nẵng",
    rating: 5,
    text: "Chuối sấy mộc ăn rất ngon, cảm nhận được vị ngọt tự nhiên. Con bé nhà mình khoái lắm!",
    product: "Chuối Sấy Mộc",
    avatar: "H",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Đánh giá từ khách hàng
          </p>
          <h2
            className="text-4xl sm:text-5xl font-black text-gray-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Khách hàng nói gì
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map(({ name, location, rating, text, product, avatar }) => (
            <div key={name} className="bg-gray-50 rounded-2xl p-7 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">
                &ldquo;{text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                  {avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 text-sm">{name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-gray-400 text-xs">{location} · {product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
