import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomBookingDto } from './create-room-booking.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { RoomBookingStatus } from '@prisma/client';

export class UpdateRoomBookingDto extends PartialType(CreateRoomBookingDto) {
  @IsEnum(RoomBookingStatus)
  @IsOptional()
  status?: RoomBookingStatus;
}
