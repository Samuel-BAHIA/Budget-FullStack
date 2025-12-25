import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DoubleController } from "./double.controller";

@Module({
  imports: [],
  controllers: [AppController, DoubleController],
  providers: [AppService],
})
export class AppModule {}
