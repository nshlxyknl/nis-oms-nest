import { IsEnum, IsNotEmpty } from 'class-validator';
import { AssetRequestStatus } from '@prisma/client';

export class ApproveAssetRequestDto {
  @IsEnum(AssetRequestStatus)
  @IsNotEmpty()
  status: AssetRequestStatus;
}
