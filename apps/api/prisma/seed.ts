import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Admins ──────────────────────────────────────────────────────────────
  const email = process.env.SUPERADMIN_EMAIL ?? 'xinchao@monngonnholau.online';
  const phone = process.env.SUPERADMIN_PHONE ?? '0000000000';
  const password = process.env.SUPERADMIN_PASSWORD ?? 'Admin@123456';
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, phone, password: hashed, name: 'Nova Mei', role: 'ADMIN', isActive: true },
  });
  console.log(`Superadmin seeded: ${admin.email} (id=${admin.id})`);

  const admin2 = await prisma.user.upsert({
    where: { phone: '0338273543' },
    update: {},
    create: {
      email: 'admin2@monngonnholau.online',
      phone: '0338273543',
      password: hashed,
      name: 'Nguyen Hanh',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Admin seeded: ${admin2.email} (id=${admin2.id})`);

  // ── Categories ──────────────────────────────────────────────────────────
  const catBo = await prisma.category.upsert({
    where: { slug: 'bo-hat' },
    update: {},
    create: { name: 'Bơ hạt', slug: 'bo-hat' },
  });

  const catKho = await prisma.category.upsert({
    where: { slug: 'do-kho' },
    update: {},
    create: { name: 'Đồ khô', slug: 'do-kho' },
  });

  console.log(`Categories seeded: ${catBo.name}, ${catKho.name}`);

  // ── Products ────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Bơ lạc nguyên chất',
      slug: 'bo-lac-nguyen-chat',
      description:
        'Bơ lạc 100% tự nhiên, không đường, không muối, không chất bảo quản. Lạc rang thơm được xay mịn bằng máy lạnh, giữ nguyên dưỡng chất và hương vị đặc trưng của lạc.',
      categoryId: catBo.id,
      images: ['products/bo-lac/bo-lac-1.jpg', 'products/bo-lac/bo-lac-2.jpg'],
      variants: [
        { sku: 'BL-200', name: '200g', weight: 200, price: 65000, comparePrice: 75000, qty: 50 },
        { sku: 'BL-350', name: '350g', weight: 350, price: 105000, comparePrice: 120000, qty: 40 },
        { sku: 'BL-500', name: '500g', weight: 500, price: 145000, comparePrice: 165000, qty: 30 },
      ],
    },
    {
      name: 'Bơ hạt điều',
      slug: 'bo-hat-dieu',
      description:
        'Bơ hạt điều thủ công từ hạt điều Bình Phước chất lượng cao. Mịn mượt, béo ngậy, không thêm dầu hay đường. Thích hợp ăn kèm bánh mì, trái cây hoặc pha sinh tố.',
      categoryId: catBo.id,
      images: ['products/bo-dieu/bo-dieu-1.jpg', 'products/bo-dieu/bo-dieu-2.jpg'],
      variants: [
        { sku: 'BD-200', name: '200g', weight: 200, price: 85000, comparePrice: 100000, qty: 45 },
        { sku: 'BD-350', name: '350g', weight: 350, price: 140000, comparePrice: 160000, qty: 35 },
        { sku: 'BD-500', name: '500g', weight: 500, price: 190000, comparePrice: 220000, qty: 25 },
      ],
    },
    {
      name: 'Thịt lợn khô',
      slug: 'thit-lon-kho',
      description:
        'Thịt lợn khô tẩm gia vị theo công thức gia truyền. Thịt nạc vai tươi, ướp sả gừng và các loại gia vị tự nhiên, sấy ở nhiệt độ thấp để giữ độ ngọt và dai đặc trưng.',
      categoryId: catKho.id,
      images: ['products/thit-lon-kho/tlk-1.jpg', 'products/thit-lon-kho/tlk-2.jpg'],
      variants: [
        { sku: 'TLK-100', name: '100g', weight: 100, price: 95000, comparePrice: 110000, qty: 60 },
        { sku: 'TLK-200', name: '200g', weight: 200, price: 180000, comparePrice: 210000, qty: 40 },
        { sku: 'TLK-300', name: '300g', weight: 300, price: 260000, comparePrice: 300000, qty: 20 },
      ],
    },
    {
      name: 'Chuối sấy mộc',
      slug: 'chuoi-say-moc',
      description:
        'Chuối sấy không đường, không chất bảo quản. Chuối tây chín tự nhiên được sấy khô ở nhiệt độ thấp, giữ trọn vị ngọt thanh và hương thơm tự nhiên. Snack lành mạnh cho cả gia đình.',
      categoryId: catKho.id,
      images: ['products/chuoi-say/cs-1.jpg', 'products/chuoi-say/cs-2.jpg'],
      variants: [
        { sku: 'CS-150', name: '150g', weight: 150, price: 45000, comparePrice: 55000, qty: 70 },
        { sku: 'CS-300', name: '300g', weight: 300, price: 80000, comparePrice: 95000, qty: 50 },
        { sku: 'CS-500', name: '500g', weight: 500, price: 125000, comparePrice: 145000, qty: 30 },
      ],
    },
    {
      name: 'Combo Bơ Đôi',
      slug: 'combo-bo-doi',
      description:
        'Combo tiết kiệm gồm 1 hũ Bơ lạc 350g + 1 hũ Bơ hạt điều 350g. Lý tưởng để trải nghiệm cả hai loại bơ hạt thủ công của nhà mình.',
      categoryId: catBo.id,
      images: ['products/combo/combo-bo-doi-1.jpg'],
      variants: [
        {
          sku: 'CB-BOI-350',
          name: 'Bơ lạc 350g + Bơ hạt điều 350g',
          weight: 700,
          price: 220000,
          comparePrice: 245000,
          qty: 20,
        },
      ],
    },
    {
      name: 'Combo Khô Ngon',
      slug: 'combo-kho-ngon',
      description:
        'Combo đặc biệt gồm thịt lợn khô 200g + chuối sấy mộc 300g. Kết hợp giữa vị mặn ngọt của thịt khô và độ ngọt thanh của chuối sấy — snack lý tưởng cho cả nhà.',
      categoryId: catKho.id,
      images: ['products/combo/combo-kho-ngon-1.jpg'],
      variants: [
        {
          sku: 'CB-KHO',
          name: 'Thịt lợn khô 200g + Chuối sấy 300g',
          weight: 500,
          price: 235000,
          comparePrice: 260000,
          qty: 15,
        },
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, images: p.images, status: 'ACTIVE' },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        images: p.images,
        categoryId: p.categoryId,
        status: 'ACTIVE',
      },
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { price: v.price, comparePrice: v.comparePrice },
        create: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          attributes: { weight: `${v.weight}g` },
          price: v.price,
          comparePrice: v.comparePrice,
          weight: v.weight,
        },
      });

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: { variantId: variant.id, quantity: v.qty, lowStock: 5 },
      });
    }

    console.log(`Product seeded: ${product.name} (${p.variants.length} variants)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
