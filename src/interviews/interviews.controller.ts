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
import type { RegisteredUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { ListInterviewsQueryDto } from './dto/list-interviews-query.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import type {
  InterviewListResponse,
  InterviewResponse,
} from './interview.types';
import { InterviewsService } from './interviews.service';

@Controller('api/interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  create(
    @CurrentUser() user: RegisteredUser,
    @Body() input: CreateInterviewDto,
  ): Promise<InterviewResponse> {
    return this.interviewsService.create(user.id, input);
  }

  @Get()
  findAll(
    @CurrentUser() user: RegisteredUser,
    @Query() query: ListInterviewsQueryDto,
  ): Promise<InterviewListResponse> {
    return this.interviewsService.findAll(user.id, query);
  }

  @Get(':id')
  findById(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InterviewResponse> {
    return this.interviewsService.findById(user.id, id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InterviewResponse> {
    return this.interviewsService.complete(user.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateInterviewDto,
  ): Promise<InterviewResponse> {
    return this.interviewsService.update(user.id, id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: RegisteredUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.interviewsService.delete(user.id, id);
  }
}
