import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Sản phẩm của Món Ngon Nhớ Lâu có gì đặc biệt?",
    answer:
      "Tất cả sản phẩm đều được chế biến thủ công theo từng mẻ nhỏ, không dây chuyền công nghiệp. Chúng tôi chọn nguyên liệu tươi ngon, không dùng chất bảo quản hay phụ gia — đảm bảo mỗi hũ, mỗi gói đến tay bạn đều giữ đúng hương vị thuần tự nhiên.",
  },
  {
    question: "Sản phẩm có sử dụng chất bảo quản không?",
    answer:
      "Hoàn toàn không. Chúng tôi cam kết sản phẩm 100% tự nhiên, không chất bảo quản, không phẩm màu, không chất tạo ngọt nhân tạo. Chính vì vậy, hạn sử dụng của sản phẩm ngắn hơn hàng công nghiệp — đó là dấu hiệu của sự chân thật.",
  },
  {
    question: "Làm thế nào để đặt hàng?",
    answer:
      "Bạn có thể đặt hàng trực tiếp trên website, chọn sản phẩm và điền thông tin giao hàng. Chúng tôi xác nhận đơn trong vòng 2–4 tiếng trong giờ hành chính và giao hàng toàn quốc qua đơn vị vận chuyển uy tín.",
  },
  {
    question: "Thời gian giao hàng là bao lâu?",
    answer:
      "Với khu vực nội thành TP.HCM và Hà Nội: 1–2 ngày làm việc. Các tỉnh thành khác: 3–5 ngày làm việc. Chúng tôi gửi mã vận đơn qua email/SMS ngay khi hàng được giao cho đơn vị vận chuyển.",
  },
  {
    question: "Tôi có thể đổi trả sản phẩm không?",
    answer:
      "Chúng tôi nhận đổi/hoàn trả trong vòng 48 giờ kể từ khi nhận hàng nếu sản phẩm bị hư hỏng hoặc sai so với đơn. Vui lòng chụp ảnh sản phẩm và liên hệ hỗ trợ — chúng tôi sẽ xử lý nhanh nhất có thể.",
  },
  {
    question: "Sản phẩm có phù hợp làm quà tặng không?",
    answer:
      "Rất phù hợp! Chúng tôi có hộp quà được đóng gói đẹp, kèm thiệp tay viết theo yêu cầu. Lý tưởng cho những dịp lễ, Tết, sinh nhật hay chỉ đơn giản là muốn gửi tặng người thân một chút yêu thương thuần Việt.",
  },
];

export function Faqs() {
  return (
    <section id="faqs-section">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <p className="text-primary text-lg font-normal mb-3 tracking-widest uppercase">
              Giải đáp thắc mắc
            </p>
            <h2 className="text-3xl lg:text-5xl font-semibold text-black leading-tight">
              Câu hỏi thường gặp.
            </h2>
            <p className="text-black/50 md:text-lg font-normal mt-4">
              Chưa tìm thấy câu trả lời bạn cần? Liên hệ chúng tôi — chúng tôi
              luôn sẵn sàng hỗ trợ.
            </p>
          </div>

          <div className="lg:col-span-8">
            <Accordion className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-black/10"
                >
                  <AccordionTrigger className="text-base lg:text-lg font-semibold text-black text-left hover:no-underline hover:text-primary py-5 cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-black/60 text-base leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
