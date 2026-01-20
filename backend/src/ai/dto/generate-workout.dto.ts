import { IsString, MinLength, MaxLength } from 'class-validator';

export class GenerateWorkoutDto {
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  prompt: string;
}


