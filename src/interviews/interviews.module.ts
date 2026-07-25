import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { InterviewsController } from './interviews.controller';
import { InterviewsRepository } from './interviews.repository';
import { InterviewsService } from './interviews.service';

@Module({
  imports: [AuthModule, CandidatesModule],
  controllers: [InterviewsController],
  providers: [InterviewsRepository, InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
