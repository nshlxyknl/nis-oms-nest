import { IsEnum, IsNotEmpty, IsString, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { LeaveType } from '@prisma/client';

export class CreateLeaveDto {
  @IsEnum(LeaveType)
  @IsNotEmpty()
  leaveType: LeaveType;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  days: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
