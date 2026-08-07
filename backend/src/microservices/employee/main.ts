import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { EmployeeMicroserviceModule } from './employee-microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmployeeMicroserviceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.EMPLOYEE_SERVICE_PORT) || 3002,
      },
    },
  );
  await app.listen();
  console.log('[Employee Microservice] Running on TCP port', process.env.EMPLOYEE_SERVICE_PORT || 3002);
}
bootstrap();
