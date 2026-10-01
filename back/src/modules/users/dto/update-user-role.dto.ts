import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: true,
    description: 'true = dar rol admin, false = quitarlo',
  })
  @IsBoolean()
  isAdmin: boolean;
}

export class UpdateUserSuperAdminDto {
  @ApiProperty({
    example: true,
    description:
      'true = dar rol superAdmin (también lo hace admin), false = quitarlo (queda como admin)',
  })
  @IsBoolean()
  isSuperAdmin: boolean;
}
