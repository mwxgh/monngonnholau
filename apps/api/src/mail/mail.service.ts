import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    this.from = this.config.get(
      'MAIL_FROM',
      'Món Ngon Nhớ Lâu <xinchao@monngonnholau.online>',
    );
  }

  async sendOrderCreated(params: {
    to: string;
    customerName: string;
    orderId: number;
    items: { name: string; sku: string; quantity: number; price: number }[];
    subtotal: number;
    shippingFee: number;
    total: number;
    address: string;
  }) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: `Đặt hàng thành công #${params.orderId}`,
      html: buildOrderCreatedHtml(params),
    });

    if (error) this.logger.error(`sendOrderCreated failed: ${error.message}`);
  }

  async sendOrderShipping(params: {
    to: string;
    customerName: string;
    orderId: number;
    trackingCode: string;
    carrier: string;
    address: string;
  }) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: `Đơn hàng #${params.orderId} đang được giao`,
      html: buildOrderShippingHtml(params),
    });

    if (error) this.logger.error(`sendOrderShipping failed: ${error.message}`);
  }
}

const styles = `
  body { background:#f6f6f6; font-family:sans-serif; margin:0; padding:0; }
  .container { max-width:600px; margin:0 auto; background:#fff; padding:24px; }
  h1 { font-size:24px; color:#111; }
  h2 { font-size:16px; color:#333; }
  p { font-size:14px; color:#444; margin:4px 0; }
  .row { display:flex; justify-content:space-between; margin-bottom:8px; }
  .total { font-size:16px; font-weight:bold; color:#111; }
  hr { border:none; border-top:1px solid #eee; margin:16px 0; }
  .footer { font-size:12px; color:#aaa; text-align:center; }
`;

function vnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function buildOrderCreatedHtml(p: {
  customerName: string;
  orderId: number;
  items: { name: string; sku: string; quantity: number; price: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: string;
}) {
  const itemRows = p.items
    .map(
      (i) => `
      <div class="row">
        <div><p style="margin:0">${i.name}</p><p style="font-size:12px;color:#888;margin:0">SKU: ${i.sku} × ${i.quantity}</p></div>
        <p style="margin:0">${vnd(i.price * i.quantity)}</p>
      </div>`,
    )
    .join('');

  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>${styles}</style></head>
  <body><div class="container">
    <h1>Đặt hàng thành công!</h1>
    <p>Xin chào ${p.customerName},</p>
    <p>Cảm ơn bạn đã đặt hàng. Đơn hàng <strong>#${p.orderId}</strong> của bạn đã được xác nhận.</p>
    <h2>Chi tiết đơn hàng</h2>
    ${itemRows}
    <hr>
    <div class="row"><p>Tạm tính</p><p>${vnd(p.subtotal)}</p></div>
    <div class="row"><p>Phí vận chuyển</p><p>${vnd(p.shippingFee)}</p></div>
    <div class="row"><p class="total">Tổng cộng</p><p class="total">${vnd(p.total)}</p></div>
    <h2>Địa chỉ giao hàng</h2>
    <p>${p.address}</p>
    <hr>
    <p class="footer">Món Ngon Nhớ Lâu — monngonnholau.online</p>
  </div></body></html>`;
}

function buildOrderShippingHtml(p: {
  customerName: string;
  orderId: number;
  trackingCode: string;
  carrier: string;
  address: string;
}) {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><style>${styles}</style></head>
  <body><div class="container">
    <h1>Đơn hàng đang trên đường giao!</h1>
    <p>Xin chào ${p.customerName},</p>
    <p>Đơn hàng <strong>#${p.orderId}</strong> của bạn đã được bàn giao cho đơn vị vận chuyển.</p>
    <h2>Thông tin vận chuyển</h2>
    <p>Đơn vị vận chuyển: <strong>${p.carrier}</strong></p>
    <p>Mã vận đơn: <strong>${p.trackingCode}</strong></p>
    <p>Địa chỉ nhận hàng: ${p.address}</p>
    <hr>
    <p class="footer">Món Ngon Nhớ Lâu — monngonnholau.online</p>
  </div></body></html>`;
}
