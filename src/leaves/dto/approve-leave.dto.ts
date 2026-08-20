import { IsEnum, IsNotEmpty } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class ApproveLeaveDto {
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;
}
