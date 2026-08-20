import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetRequestDto } from './create-asset-request.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AssetRequestStatus } from '@prisma/client';

export class UpdateAssetRequestDto extends PartialType(CreateAssetRequestDto) {
  @IsEnum(AssetRequestStatus)
  @IsOptional()
  status?: AssetRequestStatus;
}
