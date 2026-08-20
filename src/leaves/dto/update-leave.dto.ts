import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { LeaveStatus } from '@prisma/client';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;
}
