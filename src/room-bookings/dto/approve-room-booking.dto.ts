import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoomBookingStatus } from '@prisma/client';

export class ApproveRoomBookingDto {
  @IsEnum(RoomBookingStatus)
  @IsNotEmpty()
  status: RoomBookingStatus;
}
