import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  InterviewStatus,
  InterviewType,
  type InterviewStatus as InterviewStatusValue,
  type InterviewType as InterviewTypeValue,
} from '../interview.constants';

export class ListInterviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatusValue;

  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewTypeValue;

  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
