import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { RoomStatus } from '@prisma/client';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  equipment?: string;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;
}
