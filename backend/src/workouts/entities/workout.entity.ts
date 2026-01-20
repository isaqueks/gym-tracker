import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { WorkoutLog } from '../../tracker/entities/workout-log.entity';

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  aiGenerated: boolean;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.workouts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Exercise, (exercise) => exercise.workout, { cascade: true })
  exercises: Exercise[];

  @OneToMany(() => WorkoutLog, (log) => log.workout)
  logs: WorkoutLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


