import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email }
    })
    if (existing) return { message: 'Email đã được đăng ký trước đó' }

    await this.prisma.newsletterSubscriber.create({ data: { email } })
    void this.mail.sendNewsletterWelcome({ to: email })

    return { message: 'Đăng ký nhận bản tin thành công' }
  }

  findAll() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async remove(id: number) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { id }
    })
    if (!existing) throw new NotFoundException('Không tìm thấy người đăng ký')

    await this.prisma.newsletterSubscriber.delete({ where: { id } })
    return { message: 'Đã xoá người đăng ký' }
  }

  async broadcast(subject: string, content: string, subscriberIds: number[]) {
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { id: { in: subscriberIds } },
      select: { email: true }
    })
    if (subscribers.length === 0) {
      throw new BadRequestException('Không tìm thấy người đăng ký nào đã chọn')
    }

    await this.mail.sendNewsletterBroadcast({
      recipients: subscribers.map((s) => s.email),
      subject,
      content
    })

    return {
      message: `Đã gửi bản tin đến ${subscribers.length} người đăng ký`
    }
  }
}
