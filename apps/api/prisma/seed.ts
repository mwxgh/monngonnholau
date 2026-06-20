import 'dotenv/config'
import { PrismaClient, ProductStatus, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Admins ──────────────────────────────────────────────────────────────

  const password = 'password123'
  const hashed = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email: 'novamei173@gmail.com' },
    update: {},
    create: {
      email: 'novamei173@gmail.com',
      phone: '0869888960',
      password: hashed,
      name: 'Nova Mei',
      role: Role.ADMIN,
      isActive: true
    }
  })
  console.log(`Superadmin seeded: ${admin.email} (id=${admin.id})`)

  const admin2 = await prisma.user.upsert({
    where: { email: 'nguyenhanh251099@gmail.com' },
    update: {},
    create: {
      email: 'nguyenhanh251099@gmail.com',
      phone: '0338273543',
      password: hashed,
      name: 'Nguyen Hanh',
      role: Role.ADMIN,
      isActive: true
    }
  })
  console.log(`Superadmin seeded: ${admin2.email} (id=${admin2.id})`)

  // ── Categories ──────────────────────────────────────────────────────────
  const catBo = await prisma.category.upsert({
    where: { slug: 'bo-hat' },
    update: {},
    create: { name: 'Bơ hạt', slug: 'bo-hat' }
  })

  const catKho = await prisma.category.upsert({
    where: { slug: 'do-kho' },
    update: {},
    create: { name: 'Đồ khô', slug: 'do-kho' }
  })

  console.log(`Categories seeded: ${catBo.name}, ${catKho.name}`)

  // ── Products ────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Bơ Mè Đen 200g - Loại Mịn',
      slug: 'bo-me-den-200g-loai-min',
      description:
        'Bơ mè đen 200g, loại mịn, làm từ mè đen rang thơm xay nhuyễn. Có 2 loại: Origin (muối + mật ong) và Raw (nguyên mè), không thêm dầu hay chất bảo quản.',
      categoryId: catBo.id,
      images: [] as string[],
      variants: [
        {
          sku: 'SO',
          name: 'Origin (muối + mật ong)',
          weight: 200,
          attributes: { weight: '200g', type: 'Origin (muối + mật ong)' },
          price: 84600,
          comparePrice: 90000,
          qty: 854
        },
        {
          sku: 'SR',
          name: 'Raw (nguyên mè)',
          weight: 200,
          attributes: { weight: '200g', type: 'Raw (nguyên mè)' },
          price: 84600,
          comparePrice: 90000,
          qty: 925
        }
      ]
    },
    {
      name: 'Thịt Heo Khô Xé Sợi - Đậm Vị',
      slug: 'thit-heo-kho-xe-soi-dam-vi',
      description:
        'Thịt heo khô xé sợi đậm vị, tẩm gia vị theo công thức gia truyền, sấy ở nhiệt độ thấp để giữ độ ngọt và dai đặc trưng.',
      categoryId: catKho.id,
      images: [] as string[],
      variants: [
        {
          sku: 'TLKXS',
          name: 'Đậm vị',
          weight: undefined as number | undefined,
          attributes: { type: 'Đậm vị' },
          price: 155000,
          comparePrice: undefined as number | undefined,
          qty: 106
        }
      ]
    },
    {
      name: 'Bơ Hạt Điều 200g - Loại Mịn',
      slug: 'bo-hat-dieu-200g-loai-min',
      description:
        'Bơ hạt điều 200g, loại mịn, làm từ hạt điều chất lượng cao xay nhuyễn, béo ngậy, không thêm dầu hay đường.',
      categoryId: catBo.id,
      images: [] as string[],
      variants: [
        {
          sku: 'CA',
          name: 'Loại mịn',
          weight: 200,
          attributes: { weight: '200g', type: 'Loại mịn' },
          price: 85500,
          comparePrice: 90000,
          qty: 80
        }
      ]
    },
    {
      name: 'Bơ Macca 200g - Loại Mịn',
      slug: 'bo-macca-200g-loai-min',
      description:
        'Bơ hạt macca 200g, loại mịn, làm từ hạt macca cao cấp xay nhuyễn, béo ngậy, không thêm dầu hay đường.',
      categoryId: catBo.id,
      images: [] as string[],
      variants: [
        {
          sku: 'MA',
          name: 'Loại mịn',
          weight: 200,
          attributes: { weight: '200g', type: 'Loại mịn' },
          price: 153000,
          comparePrice: 170000,
          qty: 0
        }
      ]
    },
    {
      name: 'Bơ Đậu Phộng 200g - Loại Mịn',
      slug: 'bo-dau-phong-200g-loai-min',
      description:
        'Bơ đậu phộng 200g, loại mịn, làm từ đậu phộng rang thơm xay nhuyễn. Có 2 loại: Origin (muối + mật ong) và Raw (nguyên lạc), không thêm dầu hay chất bảo quản.',
      categoryId: catBo.id,
      images: [] as string[],
      variants: [
        {
          sku: 'PO',
          name: 'Origin (muối + mật ong)',
          weight: 200,
          attributes: { weight: '200g', type: 'Origin (muối + mật ong)' },
          price: 70500,
          comparePrice: 75000,
          qty: 35
        },
        {
          sku: 'PR',
          name: 'Raw (nguyên lạc)',
          weight: 200,
          attributes: { weight: '200g', type: 'Raw (nguyên lạc)' },
          price: 70500,
          comparePrice: 75000,
          qty: 35
        }
      ]
    },
    {
      name: 'Chuối Sấy Mộc Gia Lai 500g',
      slug: 'chuoi-say-moc-gia-lai-500g',
      description:
        'Chuối sấy mộc Gia Lai 500g, không đường, không chất bảo quản, sấy ở nhiệt độ thấp giữ trọn vị ngọt thanh và hương thơm tự nhiên.',
      categoryId: catKho.id,
      images: [] as string[],
      variants: [
        {
          sku: 'BA',
          name: '500g',
          weight: 500,
          attributes: { weight: '500g' },
          price: 112800,
          comparePrice: 120000,
          qty: 0
        }
      ]
    }
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        images: p.images,
        status: ProductStatus.ACTIVE
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        images: p.images,
        categoryId: p.categoryId,
        status: ProductStatus.ACTIVE
      }
    })

    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { price: v.price, comparePrice: v.comparePrice },
        create: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          attributes: v.attributes,
          price: v.price,
          comparePrice: v.comparePrice,
          weight: v.weight
        }
      })

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: { variantId: variant.id, quantity: v.qty, lowStock: 5 }
      })
    }

    console.log(
      `Product seeded: ${product.name} (${p.variants.length} variants)`
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
