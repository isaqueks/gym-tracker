import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workout } from '../../workouts/entities/workout.entity';

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  loggedDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  workoutId: string;

  @ManyToOne(() => User, (user) => user.workoutLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workout, (workout) => workout.logs)
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @CreateDateColumn()
  createdAt: Date;
}


