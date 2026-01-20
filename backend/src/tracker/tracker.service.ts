import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkoutLog } from './entities/workout-log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(WorkoutLog)
    private logsRepository: Repository<WorkoutLog>,
  ) {}

  async createLog(userId: string, createLogDto: CreateLogDto): Promise<WorkoutLog> {
    const log = this.logsRepository.create({
      userId,
      workoutId: createLogDto.workoutId,
      loggedDate: createLogDto.loggedDate,
      notes: createLogDto.notes,
    });

    return this.logsRepository.save(log);
  }

  async getCalendarLogs(
    userId: string,
    year: number,
    month: number,
  ): Promise<WorkoutLog[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    return this.logsRepository.find({
      where: {
        userId,
        loggedDate: Between(startStr, endStr),
      },
      relations: ['workout'],
      order: { loggedDate: 'ASC', createdAt: 'ASC' },
    });
  }

  async getStats(userId: string) {
    const logs = await this.logsRepository.find({
      where: { userId },
      order: { loggedDate: 'DESC' },
    });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    const uniqueDates = [...new Set(logs.map((l) => l.loggedDate))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );

    if (uniqueDates.length > 0) {
      const checkDate = new Date(todayStr);
      let lastDate = uniqueDates[0];

      // Check if worked out today or yesterday
      const diffFromToday = Math.floor(
        (checkDate.getTime() - new Date(lastDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diffFromToday <= 1) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currDate = new Date(uniqueDates[i]);
          const diff = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diff = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Total this month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const totalThisMonth = logs.filter((log) => {
      const logDate = new Date(log.loggedDate);
      return (
        logDate.getMonth() === currentMonth &&
        logDate.getFullYear() === currentYear
      );
    }).length;

    // Weekly frequency (average per week over last 4 weeks)
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentLogs = logs.filter(
      (log) => new Date(log.loggedDate) >= fourWeeksAgo,
    );
    const weeklyFrequency = recentLogs.length / 4;

    return {
      currentStreak,
      longestStreak: uniqueDates.length > 0 ? longestStreak : 0,
      totalThisMonth,
      weeklyFrequency: Math.round(weeklyFrequency * 10) / 10,
      totalWorkouts: logs.length,
    };
  }

  async deleteLog(userId: string, id: string): Promise<void> {
    const log = await this.logsRepository.findOne({
      where: { id, userId },
    });

    if (!log) {
      throw new NotFoundException('Log não encontrado');
    }

    await this.logsRepository.remove(log);
  }
}


