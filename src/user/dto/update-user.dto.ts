import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ 
    description: 'Neuer Benutzername', 
    example: 'neuer_benutzername',
    required: false 
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ 
    description: 'Neue E-Mail-Adresse', 
    example: 'neue_email@beispiel.de',
    required: false 
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'Neues Passwort', 
    example: 'neues_sicheres_passwort123',
    required: false,
    minLength: 8 
  })
  @IsString()
  @IsOptional()
  password?: string;
} 