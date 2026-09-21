import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  department?: string;
}