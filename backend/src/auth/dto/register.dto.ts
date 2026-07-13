import { IsEmail, IsString, IsOptional, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'cadet@studyai.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Cadet Miller' })
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Name can only contain letters, spaces, hyphens, and apostrophes' })
  name: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({ enum: ['STUDENT', 'INSTRUCTOR'], default: 'STUDENT' })
  @IsOptional()
  @IsEnum(['STUDENT', 'INSTRUCTOR'] as const)
  role?: 'STUDENT' | 'INSTRUCTOR';
}
