import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import type { IUser } from './interface/user.interface.js';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): IUser {
    return this.appService.getHello();
  }
}
