import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  FeedbackRecommendation,
  type FeedbackRecommendation as FeedbackRecommendationValue,
} from '../feedback.constants';

export class CreateFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(10)
  overallScore!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  technicalScore!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  communicationScore!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  problemSolvingScore!: number;

  @IsString()
  @Length(1, 5000)
  strengths!: string;

  @IsString()
  @Length(1, 5000)
  improvementAreas!: string;

  @IsEnum(FeedbackRecommendation)
  recommendation!: FeedbackRecommendationValue;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  additionalNotes?: string;
}
