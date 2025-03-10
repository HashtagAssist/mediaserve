import { IsNumber, IsOptional, IsBoolean, Min, IsDate } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressDto } from './create-progress.dto';

export class UpdateProgressDto extends PartialType(CreateProgressDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
} 