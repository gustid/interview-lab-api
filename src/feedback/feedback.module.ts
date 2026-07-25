import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackRepository } from './feedback.repository';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [AuthModule, InterviewsModule],
  controllers: [FeedbackController],
  providers: [FeedbackRepository, FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
