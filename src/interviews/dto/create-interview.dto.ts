import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  InterviewDifficulty,
  InterviewType,
  type InterviewDifficulty as InterviewDifficultyValue,
  type InterviewType as InterviewTypeValue,
} from '../interview.constants';

export class CreateInterviewDto {
  @IsUUID()
  candidateId!: string;

  @IsString()
  @Length(3, 150)
  title!: string;

  @IsISO8601()
  scheduledAt!: string;

  @IsInt()
  @Min(15)
  @Max(240)
  durationMinutes!: number;

  @IsEnum(InterviewType)
  type!: InterviewTypeValue;

  @IsOptional()
  @IsEnum(InterviewDifficulty)
  difficulty?: InterviewDifficultyValue;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  technologies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
