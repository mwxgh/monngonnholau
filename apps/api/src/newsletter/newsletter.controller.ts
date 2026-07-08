import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { NewsletterService } from './newsletter.service'
import { SubscribeDto } from './dto/subscribe.dto'
import { BroadcastDto } from './dto/broadcast.dto'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto.email)
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  findAll() {
    return this.newsletterService.findAll()
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.remove(id)
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Post('broadcast')
  broadcast(@Body() dto: BroadcastDto) {
    return this.newsletterService.broadcast(
      dto.subject,
      dto.content,
      dto.subscriberIds
    )
  }
}
