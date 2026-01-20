import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from './entities/workout-log.entity';
import { TrackerService } from './tracker.service';
import { TrackerController } from './tracker.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLog])],
  controllers: [TrackerController],
  providers: [TrackerService],
  exports: [TrackerService],
})
export class TrackerModule {}


