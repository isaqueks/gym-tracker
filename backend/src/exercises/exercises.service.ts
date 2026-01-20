import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exercisesRepository: Repository<Exercise>,
  ) {}

  async createMany(exercises: Partial<Exercise>[]): Promise<Exercise[]> {
    const created = this.exercisesRepository.create(exercises);
    return this.exercisesRepository.save(created);
  }

  async findByWorkoutId(workoutId: string): Promise<Exercise[]> {
    return this.exercisesRepository.find({
      where: { workoutId },
      order: { order: 'ASC' },
    });
  }

  async deleteByWorkoutId(workoutId: string): Promise<void> {
    await this.exercisesRepository.delete({ workoutId });
  }

  async update(id: string, data: Partial<Exercise>): Promise<Exercise> {
    await this.exercisesRepository.update(id, data);
    return this.exercisesRepository.findOneOrFail({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.exercisesRepository.delete(id);
  }
}


