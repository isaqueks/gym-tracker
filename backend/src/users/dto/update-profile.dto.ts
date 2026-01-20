import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(250)
  height?: number; // em cm

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(300)
  weight?: number; // em kg
}

