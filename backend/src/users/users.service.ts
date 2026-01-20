import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    await this.usersRepository.update(id, dto);
    return this.usersRepository.findOneOrFail({ where: { id } });
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.findOneOrFail({ where: { id } });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      createdAt: user.createdAt,
    };
  }
}


