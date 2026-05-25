import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrderShippingEmailProps {
  customerName: string;
  orderId: number;
  trackingCode: string;
  carrier: string;
  address: string;
}

export function OrderShippingEmail({
  customerName = "Khách hàng",
  orderId = 1,
  trackingCode = "",
  carrier = "SPX",
  address = "",
}: OrderShippingEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>Đơn hàng #{orderId} đã được giao cho đơn vị vận chuyển</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Đơn hàng đang trên đường giao!</Heading>
          <Text style={text}>Xin chào {customerName},</Text>
          <Text style={text}>
            Đơn hàng <strong>#{orderId}</strong> của bạn đã được bàn giao cho đơn vị vận chuyển.
          </Text>

          <Section style={section}>
            <Heading as="h2" style={subheading}>Thông tin vận chuyển</Heading>
            <Text style={text}>Đơn vị vận chuyển: <strong>{carrier}</strong></Text>
            <Text style={text}>Mã vận đơn: <strong>{trackingCode}</strong></Text>
            <Text style={text}>Địa chỉ nhận hàng: {address}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Mon Ngon Nho Lau — monngonnholau.online</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f6f6", fontFamily: "sans-serif" };
const container = { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "24px" };
const heading = { fontSize: "24px", color: "#111" };
const subheading = { fontSize: "16px", color: "#333", marginBottom: "8px" };
const text = { fontSize: "14px", color: "#444", margin: "4px 0" };
const section = { margin: "24px 0" };
const hr = { borderColor: "#eee", margin: "16px 0" };
const footer = { fontSize: "12px", color: "#aaa", textAlign: "center" as const };

export default OrderShippingEmail;
