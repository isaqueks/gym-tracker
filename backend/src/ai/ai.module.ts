import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { WorkoutsModule } from '../workouts/workouts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [WorkoutsModule, UsersModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}


