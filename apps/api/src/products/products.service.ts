import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: {
        variants: {
          include: { inventory: { select: { quantity: true } } },
          orderBy: { price: 'asc' },
        },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        variants: {
          include: { inventory: { select: { quantity: true } } },
          orderBy: { price: 'asc' },
        },
      },
    });
  }
}
