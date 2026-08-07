import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GatewayAuthController } from './controllers/gateway-auth.controller';
import { GatewayEmployeeController } from './controllers/gateway-employee.controller';
import { GatewayAttendanceController } from './controllers/gateway-attendance.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST', '127.0.0.1'),
            port: configService.get<number>('AUTH_SERVICE_PORT', 3001),
          },
        }),
      },
      {
        name: 'EMPLOYEE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('EMPLOYEE_SERVICE_HOST', '127.0.0.1'),
            port: configService.get<number>('EMPLOYEE_SERVICE_PORT', 3002),
          },
        }),
      },
      {
        name: 'ATTENDANCE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('ATTENDANCE_SERVICE_HOST', '127.0.0.1'),
            port: configService.get<number>('ATTENDANCE_SERVICE_PORT', 3003),
          },
        }),
      },
    ]),
  ],
  controllers: [
    GatewayAuthController,
    GatewayEmployeeController,
    GatewayAttendanceController,
  ],
  providers: [JwtAuthGuard, RolesGuard],
})
export class GatewayModule { }
