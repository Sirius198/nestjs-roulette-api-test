import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouletteController } from './modules/roulette.controller';
import { RouletteService } from './modules/roulette.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, RouletteController],
  providers: [AppService, RouletteService],
})
export class AppModule { }
