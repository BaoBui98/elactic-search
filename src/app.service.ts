import { Injectable } from '@nestjs/common';
import { IUser } from './interface/user.interface.js';




@Injectable()
export class AppService {
  getHello(): IUser {

    return {
      id: 1,
      name: 'sss',
      role: 'admin'
    }
  }
}
