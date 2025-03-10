import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Der Name der Kategorie',
    example: 'Action',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Eine optionale Beschreibung der Kategorie',
    example: 'Filme mit viel Action und Spannung',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
} 