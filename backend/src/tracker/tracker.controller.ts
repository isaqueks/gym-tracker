import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateLogDto } from './dto/create-log.dto';

@Controller('tracker')
@UseGuards(JwtAuthGuard)
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Post('log')
  createLog(
    @CurrentUser() user: CurrentUserData,
    @Body() createLogDto: CreateLogDto,
  ) {
    return this.trackerService.createLog(user.id, createLogDto);
  }

  @Get('calendar/:year/:month')
  getCalendarLogs(
    @CurrentUser() user: CurrentUserData,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.trackerService.getCalendarLogs(user.id, year, month);
  }

  @Get('stats')
  getStats(@CurrentUser() user: CurrentUserData) {
    return this.trackerService.getStats(user.id);
  }

  @Delete('log/:id')
  deleteLog(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.trackerService.deleteLog(user.id, id);
  }
}


