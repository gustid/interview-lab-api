import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RegisteredUser } from '../auth/auth.types';
import type {
  CandidateListResponse,
  CandidateResponse,
} from './candidate.types';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { ListCandidatesQueryDto } from './dto/list-candidates-query.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Controller('api/candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  create(
    @CurrentUser() user: RegisteredUser,
    @Body() input: CreateCandidateDto,
  ): Promise<CandidateResponse> {
    return this.candidatesService.create(user.id, input);
  }

  @Get()
  findAll(
    @CurrentUser() user: RegisteredUser,
    @Query() query: ListCandidatesQueryDto,
  ): Promise<CandidateListResponse> {
    return this.candidatesService.findAll(user.id, query.page, query.pageSize);
  }

  @Put(':id')
  update(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateCandidateDto,
  ): Promise<CandidateResponse> {
    return this.candidatesService.update(user.id, id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.candidatesService.delete(user.id, id);
  }
}
