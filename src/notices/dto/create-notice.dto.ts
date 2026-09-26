import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { NoticePriority } from '@prisma/client';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(NoticePriority)
  @IsOptional()
  priority?: NoticePriority;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
