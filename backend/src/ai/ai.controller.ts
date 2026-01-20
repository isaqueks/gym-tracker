import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService, GeneratedWorkout } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-workout')
  generateWorkout(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: GenerateWorkoutDto,
  ): Promise<GeneratedWorkout[]> {
    return this.aiService.generateWorkout(user.id, dto);
  }
}
