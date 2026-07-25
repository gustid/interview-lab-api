import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @Length(1, 120)
  firstName!: string;

  @IsString()
  @Length(1, 120)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
