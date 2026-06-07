import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAllPublic();
  }

  @Roles('ADMIN', 'STAFF')
  @Get('admin')
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }
}
