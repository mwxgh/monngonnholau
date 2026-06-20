import { Body, Controller, Get, Patch } from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { Public } from '../auth/decorators/public.decorator'
import { DashboardService } from './dashboard.service'

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('ADMIN', 'STAFF')
  @Get()
  getStats() {
    return this.dashboardService.getStats()
  }

  @Roles('ADMIN', 'STAFF')
  @Get('customers')
  getCustomers() {
    return this.dashboardService.getCustomers()
  }

  @Roles('ADMIN', 'STAFF')
  @Get('analytics')
  getAnalytics() {
    return this.dashboardService.getAnalytics()
  }

  @Roles('ADMIN', 'STAFF')
  @Get('settings')
  getSettings() {
    return this.dashboardService.getSettings()
  }

  @Roles('ADMIN', 'STAFF')
  @Patch('settings')
  updateSettings(@Body() body: Record<string, string>) {
    return this.dashboardService.updateSettings(body)
  }

  @Public()
  @Get('public-settings')
  getPublicSettings() {
    return this.dashboardService.getPublicSettings()
  }
}
