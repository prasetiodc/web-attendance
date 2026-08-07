import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AttendanceMicroserviceModule } from './attendance-microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AttendanceMicroserviceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.ATTENDANCE_SERVICE_PORT) || 3003,
      },
    },
  );
  await app.listen();
  console.log('[Attendance Microservice] Running on TCP port', process.env.ATTENDANCE_SERVICE_PORT || 3003);
}
bootstrap();
