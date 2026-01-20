import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from './entities/workout.entity';
import { ExercisesService } from '../exercises/exercises.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout)
    private workoutsRepository: Repository<Workout>,
    private exercisesService: ExercisesService,
  ) {}

  async create(userId: string, createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
    const workout = this.workoutsRepository.create({
      name: createWorkoutDto.name,
      description: createWorkoutDto.description,
      aiGenerated: createWorkoutDto.aiGenerated || false,
      userId,
    });

    const savedWorkout = await this.workoutsRepository.save(workout);

    if (createWorkoutDto.exercises && createWorkoutDto.exercises.length > 0) {
      const exercises = createWorkoutDto.exercises.map((e, index) => ({
        ...e,
        workoutId: savedWorkout.id,
        order: e.order ?? index,
      }));
      await this.exercisesService.createMany(exercises);
    }

    return this.findOne(userId, savedWorkout.id);
  }

  async findAll(
    userId: string,
    options?: { active?: boolean },
  ): Promise<Workout[]> {
    const queryBuilder = this.workoutsRepository
      .createQueryBuilder('workout')
      .leftJoinAndSelect('workout.exercises', 'exercise')
      .where('workout.userId = :userId', { userId })
      .andWhere('workout.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('workout.createdAt', 'DESC')
      .addOrderBy('exercise.order', 'ASC');

    if (options?.active !== undefined) {
      queryBuilder.andWhere('workout.isActive = :isActive', {
        isActive: options.active,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(userId: string, id: string): Promise<Workout> {
    const workout = await this.workoutsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['exercises'],
      order: { exercises: { order: 'ASC' } },
    });

    if (!workout) {
      throw new NotFoundException('Treino não encontrado');
    }

    if (workout.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return workout;
  }

  async update(
    userId: string,
    id: string,
    updateWorkoutDto: UpdateWorkoutDto,
  ): Promise<Workout> {
    const workout = await this.findOne(userId, id);

    if (updateWorkoutDto.name !== undefined) {
      workout.name = updateWorkoutDto.name;
    }
    if (updateWorkoutDto.description !== undefined) {
      workout.description = updateWorkoutDto.description;
    }

    await this.workoutsRepository.save(workout);

    if (updateWorkoutDto.exercises) {
      await this.exercisesService.deleteByWorkoutId(id);
      const exercises = updateWorkoutDto.exercises.map((e, index) => ({
        ...e,
        workoutId: id,
        order: e.order ?? index,
      }));
      await this.exercisesService.createMany(exercises);
    }

    return this.findOne(userId, id);
  }

  async toggle(userId: string, id: string): Promise<Workout> {
    const workout = await this.findOne(userId, id);
    workout.isActive = !workout.isActive;
    return this.workoutsRepository.save(workout);
  }

  async softDelete(userId: string, id: string): Promise<void> {
    const workout = await this.findOne(userId, id);
    workout.isDeleted = true;
    workout.isActive = false;
    await this.workoutsRepository.save(workout);
  }
}


