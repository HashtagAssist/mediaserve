import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { MediaType } from '../enums/media-type.enum';

export class CreateMediaDto {
  @IsString()
  title: string;

  @IsString()
  path: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  genres?: string[];

  @IsNumber()
  @IsOptional()
  year?: number;
} 