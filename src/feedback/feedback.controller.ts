import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { RegisteredUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import type { FeedbackResponse } from './feedback.types';
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@ApiBearerAuth('access-token')
@Controller('api/interviews/:interviewId/feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(
    @CurrentUser() user: RegisteredUser,
    @Param('interviewId', ParseUUIDPipe) interviewId: string,
    @Body() input: CreateFeedbackDto,
  ): Promise<FeedbackResponse> {
    return this.feedbackService.create(user.id, interviewId, input);
  }

  @Get()
  findByInterviewId(
    @CurrentUser() user: RegisteredUser,
    @Param('interviewId', ParseUUIDPipe) interviewId: string,
  ): Promise<FeedbackResponse> {
    return this.feedbackService.findByInterviewId(user.id, interviewId);
  }

  @Put()
  update(
    @CurrentUser() user: RegisteredUser,
    @Param('interviewId', ParseUUIDPipe) interviewId: string,
    @Body() input: UpdateFeedbackDto,
  ): Promise<FeedbackResponse> {
    return this.feedbackService.update(user.id, interviewId, input);
  }
}
