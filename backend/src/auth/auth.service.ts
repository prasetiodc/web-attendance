import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // We treat the DTO's username field as the email for the database User model
    const user = await this.userModel.findOne({
      where: { email: username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    const payload = { email: user.email, sub: user.id, role: user.role, employeeId: user.employeeId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    };
  }
}
