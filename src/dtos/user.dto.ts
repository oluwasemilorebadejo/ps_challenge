import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Length,
  IsEnum,
} from "class-validator";
import { UserRole } from "../enums/User";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password!: string;

  @IsInt()
  @Min(1)
  age!: number;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
