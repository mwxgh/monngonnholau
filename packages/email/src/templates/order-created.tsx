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
  Row,
  Column,
} from "@react-email/components";

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface OrderCreatedEmailProps {
  customerName: string;
  orderId: number;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: string;
}

export function OrderCreatedEmail({
  customerName = "Khách hàng",
  orderId = 1,
  items = [],
  subtotal = 0,
  shippingFee = 0,
  total = 0,
  address = "",
}: OrderCreatedEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>Đặt hàng thành công #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Đặt hàng thành công!</Heading>
          <Text style={text}>Xin chào {customerName},</Text>
          <Text style={text}>
            Cảm ơn bạn đã đặt hàng. Đơn hàng <strong>#{orderId}</strong> của bạn đã được xác nhận.
          </Text>

          <Section style={section}>
            <Heading as="h2" style={subheading}>Chi tiết đơn hàng</Heading>
            {items.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemSku}>SKU: {item.sku} × {item.quantity}</Text>
                </Column>
                <Column style={priceCol}>
                  <Text style={itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row style={itemRow}>
              <Column><Text style={text}>Tạm tính</Text></Column>
              <Column style={priceCol}><Text style={text}>{formatCurrency(subtotal)}</Text></Column>
            </Row>
            <Row style={itemRow}>
              <Column><Text style={text}>Phí vận chuyển</Text></Column>
              <Column style={priceCol}><Text style={text}>{formatCurrency(shippingFee)}</Text></Column>
            </Row>
            <Row style={itemRow}>
              <Column><Text style={totalText}>Tổng cộng</Text></Column>
              <Column style={priceCol}><Text style={totalText}>{formatCurrency(total)}</Text></Column>
            </Row>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={subheading}>Địa chỉ giao hàng</Heading>
            <Text style={text}>{address}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Mon Ngon Nho Lau — monngonnholau.online</Text>
        </Container>
      </Body>
    </Html>
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const main = { backgroundColor: "#f6f6f6", fontFamily: "sans-serif" };
const container = { maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", padding: "24px" };
const heading = { fontSize: "24px", color: "#111" };
const subheading = { fontSize: "16px", color: "#333", marginBottom: "8px" };
const text = { fontSize: "14px", color: "#444", margin: "4px 0" };
const section = { margin: "24px 0" };
const itemRow = { marginBottom: "8px" };
const itemName = { fontSize: "14px", color: "#111", margin: 0 };
const itemSku = { fontSize: "12px", color: "#888", margin: 0 };
const priceCol = { textAlign: "right" as const };
const itemPrice = { fontSize: "14px", color: "#111", margin: 0 };
const totalText = { fontSize: "16px", fontWeight: "bold", color: "#111", margin: "4px 0" };
const hr = { borderColor: "#eee", margin: "16px 0" };
const footer = { fontSize: "12px", color: "#aaa", textAlign: "center" as const };

export default OrderCreatedEmail;
