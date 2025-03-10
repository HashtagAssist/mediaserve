import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateLibraryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsBoolean()
  @IsOptional()
  autoScan?: boolean;
} 