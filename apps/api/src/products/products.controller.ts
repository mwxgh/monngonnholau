import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { ProductsService } from './products.service'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { UpdateProductDto } from './dto/update-product.dto'
import { UpdateVariantDto } from './dto/update-variant.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAllPublic()
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin')
  findAllAdmin() {
    return this.productsService.findAllAdmin()
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Patch('admin/variants/:id')
  updateVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVariantDto
  ) {
    return this.productsService.updateVariant(id, dto)
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Patch('admin/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(id, dto)
  }
}
