import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workout } from '../../workouts/entities/workout.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'int' })
  reps: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column('uuid')
  workoutId: string;

  @ManyToOne(() => Workout, (workout) => workout.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @CreateDateColumn()
  createdAt: Date;
}


