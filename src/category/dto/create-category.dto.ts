import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name der Kategorie',
    example: 'Action'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Beschreibung der Kategorie',
    example: 'Actionfilme und -serien',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
} 