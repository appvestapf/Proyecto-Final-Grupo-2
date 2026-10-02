import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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

  async updatePhoto(userId: string, file: Express.Multer.File) {
    const user = await this.findOnePublic(userId);
    const result = await this.cloudinaryService.uploadImage(file, 'users');
    // update() solo toca la columna pfp, sin pasar por los hooks de la entidad
    await this.usersRepository.update(user.id, { pfp: result.secure_url });
    return {
      url: result.secure_url,
      user: await this.findProfileById(user.id),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll(includeInactive = false) {
    return this.usersRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
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

  async registerFailedLogin(user: User) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    return this.usersRepository.save(user);
  }

  async resetFailedLogins(user: User) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (user.isSuperAdmin) {
      throw new ForbiddenException(
        'Un superAdmin no se puede dar de baja. Primero otro superAdmin tiene que quitarle el rol',
      );
    }
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async assertCanManage(requesterId: string, targetId: string) {
    if (requesterId === targetId) return;

    const [requester, target] = await Promise.all([
      this.findOne(requesterId),
      this.findOne(targetId),
    ]);

    if (target.isSuperAdmin) {
      throw new ForbiddenException('No podés modificar a un superAdmin');
    }
    if (target.isAdmin && !requester.isSuperAdmin) {
      throw new ForbiddenException(
        'Solo un superAdmin puede modificar a otro admin',
      );
    }
  }

  private async assertRequesterIsSuperAdmin(requesterId: string) {
    const requester = await this.findOne(requesterId);
    if (!requester.isActive || !requester.isSuperAdmin) {
      throw new ForbiddenException(
        'Solo un superAdmin puede realizar esta acción',
      );
    }
  }

  async updateRole(id: string, isAdmin: boolean, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException('No podés cambiar tu propio rol');
    }
    await this.assertRequesterIsSuperAdmin(requesterId);

    const user = await this.findOne(id);
    if (!isAdmin && user.isSuperAdmin) {
      throw new ConflictException(
        'Es superAdmin: primero quitale el rol de superAdmin',
      );
    }
    if (user.isAdmin === isAdmin) {
      throw new ConflictException(
        isAdmin ? 'El usuario ya es admin' : 'El usuario no es admin',
      );
    }

    await this.usersRepository.update(id, { isAdmin });
    return this.findProfileById(id);
  }

  async updateSuperAdmin(
    id: string,
    isSuperAdmin: boolean,
    requesterId: string,
  ) {
    if (id === requesterId) {
      throw new BadRequestException('No podés cambiar tu propio rol');
    }
    await this.assertRequesterIsSuperAdmin(requesterId);

    const user = await this.findOne(id);
    if (user.isSuperAdmin === isSuperAdmin) {
      throw new ConflictException(
        isSuperAdmin
          ? 'El usuario ya es superAdmin'
          : 'El usuario no es superAdmin',
      );
    }
    if (isSuperAdmin && !user.isActive) {
      throw new ConflictException(
        'No podés dar el rol a un usuario dado de baja',
      );
    }

    await this.usersRepository.update(
      id,
      isSuperAdmin
        ? { isSuperAdmin: true, isAdmin: true }
        : { isSuperAdmin: false },
    );
    return this.findProfileById(id);
  }

  async findProfileById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      pfp: user.pfp,
    };
  }
}
