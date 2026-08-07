import {
  Controller, Post, Body, HttpCode, HttpStatus,
  Inject, OnModuleInit
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class GatewayAuthController implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) { }

  async onModuleInit() {
    await this.authClient.connect();
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return firstValueFrom(this.authClient.send('auth.login', body));
  }
}
