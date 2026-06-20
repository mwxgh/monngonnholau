import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProductDto } from './dto/update-product.dto'
import { UpdateVariantDto } from './dto/update-variant.dto'

const productAdminInclude = {
  category: { select: { name: true } },
  variants: {
    include: { inventory: { select: { quantity: true } } },
    orderBy: { price: 'asc' as const }
  }
}

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
          orderBy: { price: 'asc' }
        }
      }
    })
  }

  findAllAdmin() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: productAdminInclude
    })
  }

  updateProduct(id: number, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: productAdminInclude
    })
  }

  async updateVariant(id: number, dto: UpdateVariantDto) {
    const { quantity, ...variantData } = dto

    await this.prisma.productVariant.update({
      where: { id },
      data: variantData
    })

    if (quantity !== undefined) {
      await this.prisma.inventory.upsert({
        where: { variantId: id },
        update: { quantity },
        create: { variantId: id, quantity, lowStock: 5 }
      })
    }

    return this.prisma.productVariant.findUnique({
      where: { id },
      include: { inventory: { select: { quantity: true } } }
    })
  }
}
