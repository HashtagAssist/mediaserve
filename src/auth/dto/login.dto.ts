import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'E-Mail-Adresse des Benutzers', 
    example: 'benutzer@beispiel.de',
    required: true 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Passwort des Benutzers', 
    example: 'sicheres_passwort123',
    required: true,
    minLength: 8 
  })
  @IsString()
  @MinLength(6)
  password: string;
} 