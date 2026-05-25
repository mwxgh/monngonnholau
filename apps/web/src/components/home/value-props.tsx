import { FlameKindling, Leaf, Heart } from "lucide-react";

const props = [
  {
    icon: FlameKindling,
    title: "Thủ công từng mẻ",
    description:
      "Mỗi lọ, mỗi gói đều được làm tỉ mỉ theo từng mẻ nhỏ — không dây chuyền công nghiệp, không đại trà.",
  },
  {
    icon: Leaf,
    title: "Không chất bảo quản",
    description:
      "Hoàn toàn tự nhiên, không phụ gia, không chất tạo màu. Bạn biết rõ mình đang ăn gì.",
  },
  {
    icon: Heart,
    title: "Làm bằng cái tâm",
    description:
      "Từng sản phẩm được chăm chút như nấu cho chính gia đình — không pha chế lấy số lượng.",
  },
];

export function ValueProps() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Tại sao chọn chúng tôi
          </p>
          <h2
            className="text-4xl sm:text-5xl font-black text-gray-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Khác biệt ở từng chi tiết
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-500 flex items-center justify-center mb-5 transition-colors duration-300">
                <Icon className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
