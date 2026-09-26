import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
} from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsInt()
  @IsOptional()
  assignedToId?: number;
}
