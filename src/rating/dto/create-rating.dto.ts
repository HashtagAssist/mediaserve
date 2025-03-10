import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Bewertung von 1-5 Sternen',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;

  @ApiProperty({
    description: 'Kommentar zur Bewertung',
    example: 'Ein sehr guter Film!',
    required: false
  })
  @IsString()
  @IsOptional()
  comment?: string;
} 