import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadPhoto(file: Express.Multer.File): Promise<string> {
    const result = await this.cloudinaryService.uploadImage(file, 'users');
    return result.secure_url;
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  async findOnePublic(id: string) {
    const user = await this.findOne(id);
    if (!user.isActive) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }
  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  findByResetToken(token: string) {
    return this.usersRepository.findOneBy({ resetPasswordToken: token });
  }

  async setResetPasswordToken(email: string, token: string, expires: Date) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    return this.usersRepository.save(user);
  }

  async resetPassword(user: User, newPassword: string) {
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async findProfileById(id:string){
    const user = await this.usersRepository.findOne({where: {id}})
    if(!user) throw new NotFoundException('Usuario no encontrado')
    return {
      id:user.id,
      name:user.name,
      email:user.email,
      address: user.address,
      isAdmin: user.isAdmin,
      pfp: user.pfp
    }
  }
}
