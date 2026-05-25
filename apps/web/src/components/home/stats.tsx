const stats = [
  { value: "200+", label: "Khách hàng hài lòng" },
  { value: "4.9★", label: "Đánh giá trung bình" },
  { value: "7+", label: "Sản phẩm thủ công" },
  { value: "100%", label: "Không chất bảo quản" },
];

export function Stats() {
  return (
    <section className="py-14 bg-orange-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`text-center ${i < stats.length - 1 ? "lg:border-r lg:border-orange-400/40" : ""}`}
            >
              <div className="text-4xl font-black text-white mb-1">{value}</div>
              <div className="text-orange-100 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
