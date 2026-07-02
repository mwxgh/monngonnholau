import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { ProductStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { UpdateVariantDto } from './dto/update-variant.dto'

const productAdminInclude = {
  category: { select: { name: true } },
  variants: {
    include: { inventory: { select: { quantity: true } } },
    orderBy: { price: 'asc' as const }
  }
}

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
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

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name)
    let slug = base
    let suffix = 1
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      suffix += 1
      slug = `${base}-${suffix}`
    }
    return slug
  }

  async createProduct(dto: CreateProductDto) {
    const skus = dto.variants.map((v) => v.sku)
    if (new Set(skus).size !== skus.length) {
      throw new ConflictException('SKU bị trùng lặp giữa các biến thể')
    }

    const existing = await this.prisma.productVariant.findFirst({
      where: { sku: { in: skus } },
      select: { sku: true }
    })
    if (existing) {
      throw new ConflictException(`SKU "${existing.sku}" đã tồn tại`)
    }

    const slug = await this.generateUniqueSlug(dto.name)

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        status: dto.status ?? ProductStatus.DRAFT,
        images: dto.images ?? [],
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: v.price,
            comparePrice: v.comparePrice,
            weight: v.weight,
            length: v.length,
            width: v.width,
            height: v.height,
            thumbnail: v.thumbnail,
            attributes: v.attributes ?? { type: 'Mặc định' },
            inventory: {
              create: { quantity: v.quantity ?? 0 }
            }
          }))
        }
      },
      include: productAdminInclude
    })
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: { select: { id: true } } }
    })
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại')

    const variantIds = product.variants.map((v) => v.id)

    const [orderItemCount, transactionCount] = await Promise.all([
      this.prisma.orderItem.count({ where: { variantId: { in: variantIds } } }),
      this.prisma.inventoryTransaction.count({
        where: { variantId: { in: variantIds } }
      })
    ])

    if (orderItemCount > 0 || transactionCount > 0) {
      throw new ConflictException(
        'Không thể xóa sản phẩm đã có đơn hàng hoặc lịch sử kho. Hãy chuyển trạng thái sang "Tạm dừng" thay vì xóa.'
      )
    }

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({
        where: { variantId: { in: variantIds } }
      }),
      this.prisma.product.delete({ where: { id } })
    ])

    return { success: true }
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const { variants, ...productData } = dto

    if (!variants) {
      return this.prisma.product.update({
        where: { id },
        data: productData,
        include: productAdminInclude
      })
    }

    const skus = variants.map((v) => v.sku)
    if (new Set(skus).size !== skus.length) {
      throw new ConflictException('SKU bị trùng lặp giữa các biến thể')
    }

    const current = await this.prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true }
    })
    const currentIds = new Set(current.map((v) => v.id))

    for (const v of variants) {
      if (v.id !== undefined && !currentIds.has(v.id)) {
        throw new NotFoundException(
          `Biến thể #${v.id} không thuộc sản phẩm này`
        )
      }
    }

    const keptIds = new Set(
      variants.filter((v) => v.id !== undefined).map((v) => v.id as number)
    )
    const removedIds = [...currentIds].filter((vid) => !keptIds.has(vid))

    if (removedIds.length > 0) {
      const [orderItemCount, transactionCount] = await Promise.all([
        this.prisma.orderItem.count({
          where: { variantId: { in: removedIds } }
        }),
        this.prisma.inventoryTransaction.count({
          where: { variantId: { in: removedIds } }
        })
      ])
      if (orderItemCount > 0 || transactionCount > 0) {
        throw new ConflictException(
          'Không thể xóa biến thể đã có đơn hàng hoặc lịch sử kho. Hãy chuyển trạng thái sản phẩm thay vì xóa biến thể.'
        )
      }
    }

    const skuConflict = await this.prisma.productVariant.findFirst({
      where: { sku: { in: skus }, productId: { not: id } },
      select: { sku: true }
    })
    if (skuConflict) {
      throw new ConflictException(`SKU "${skuConflict.sku}" đã tồn tại`)
    }

    await this.prisma.$transaction([
      ...(removedIds.length > 0
        ? [
            this.prisma.cartItem.deleteMany({
              where: { variantId: { in: removedIds } }
            }),
            this.prisma.productVariant.deleteMany({
              where: { id: { in: removedIds } }
            })
          ]
        : []),
      this.prisma.product.update({
        where: { id },
        data: {
          ...productData,
          variants: {
            update: variants
              .filter((v) => v.id !== undefined)
              .map((v) => ({
                where: { id: v.id },
                data: {
                  sku: v.sku,
                  name: v.name,
                  price: v.price,
                  comparePrice: v.comparePrice,
                  weight: v.weight,
                  length: v.length,
                  width: v.width,
                  height: v.height,
                  thumbnail: v.thumbnail,
                  attributes: v.attributes ?? { type: 'Mặc định' },
                  inventory: {
                    upsert: {
                      update: { quantity: v.quantity ?? 0 },
                      create: { quantity: v.quantity ?? 0 }
                    }
                  }
                }
              })),
            create: variants
              .filter((v) => v.id === undefined)
              .map((v) => ({
                sku: v.sku,
                name: v.name,
                price: v.price,
                comparePrice: v.comparePrice,
                weight: v.weight,
                length: v.length,
                width: v.width,
                height: v.height,
                thumbnail: v.thumbnail,
                attributes: v.attributes ?? { type: 'Mặc định' },
                inventory: { create: { quantity: v.quantity ?? 0 } }
              }))
          }
        }
      })
    ])

    return this.prisma.product.findUniqueOrThrow({
      where: { id },
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
