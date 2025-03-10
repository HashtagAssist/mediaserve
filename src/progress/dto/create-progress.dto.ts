import { IsUUID, IsNumber, IsOptional, IsBoolean, IsDate, Min } from 'class-validator';

export class CreateProgressDto {
  @IsUUID()
  mediaId: string;

  @IsNumber()
  position: number;

  @IsNumber()
  duration: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  playCount?: number;

  @IsOptional()
  @IsDate()
  lastPlayedAt?: Date;
} 