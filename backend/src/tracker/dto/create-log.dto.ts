import { IsUUID, IsDateString, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateLogDto {
  @IsUUID()
  workoutId: string;

  @IsDateString()
  loggedDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}


