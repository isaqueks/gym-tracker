import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { TrackerModule } from './tracker/tracker.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: (console.log('DBPORT', configService.get<number>('DATABASE_PORT', 5432)), configService.get<number>('DATABASE_PORT', 5432)),
        username: configService.get('DATABASE_USER', 'gymtracker'),
        password: configService.get('DATABASE_PASSWORD', 'gymtracker123'),
        database: configService.get('DATABASE_NAME', 'gymtracker'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WorkoutsModule,
    ExercisesModule,
    TrackerModule,
    AiModule,
  ],
})
export class AppModule {}


