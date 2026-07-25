import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CandidatesRepository } from './candidates.repository';

@Module({
  imports: [AuthModule],
  providers: [CandidatesRepository, CandidatesService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
