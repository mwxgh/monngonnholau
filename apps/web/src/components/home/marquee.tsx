const items = [
  "Không chất bảo quản",
  "Thủ công từng mẻ",
  "Nguyên liệu tươi sạch",
  "Made with love",
  "100% tự nhiên",
  "Mẹ tự tay làm",
  "Rõ nguồn gốc",
  "Không phụ gia",
];

export function Marquee() {
  return (
    <div className="bg-orange-500 py-3 overflow-hidden select-none">
      <div className="flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-5 shrink-0 px-3">
            <span className="text-white text-sm font-medium tracking-wide whitespace-nowrap">
              {item}
            </span>
            <span className="text-orange-300 text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
