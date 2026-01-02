import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,              // permet @Type(() => Number)
      whitelist: true,              // retire les champs inconnus
      forbidNonWhitelisted: true,
    }),
  );

  // CORS pour que le front puisse appeler l’API
  app.enableCors({
    origin: true,
  });
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
