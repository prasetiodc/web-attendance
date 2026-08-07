import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthMicroserviceModule } from './auth-microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthMicroserviceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
      },
    },
  );
  await app.listen();
  console.log('[Auth Microservice] Running on TCP port', process.env.AUTH_SERVICE_PORT || 3001);
}
bootstrap();
