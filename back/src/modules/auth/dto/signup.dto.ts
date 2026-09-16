import {IsEmail,IsNotEmpty,IsString,Matches,MaxLength,MinLength} from 'class-validator';

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    name:string;

    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsString()
    @MinLength(6, {
        message: 'La contraseña debe tener al menos 6 caracteres',
    })
    @MaxLength(50, {
        message: 'La contraseña no puede superar los 50 caracteres',
    })
    @Matches(/[A-Z]/, {
        message: 'La contraseña debe contener al menos una mayúscula',
    })
    @Matches(/[a-z]/, {
        message: 'La contraseña debe contener al menos una minúscula',
    })
    @Matches(/[0-9]/, {
        message: 'La contraseña debe contener al menos un número',
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    address:string;
}