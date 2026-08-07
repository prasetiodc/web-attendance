import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../../auth/auth.service';
import { LoginDto } from '../../auth/dto/auth.dto';

@Controller()
export class AuthMicroserviceController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }
}
