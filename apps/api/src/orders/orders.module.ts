import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { MailModule } from '../mail/mail.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [ConfigModule, MailModule, UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
