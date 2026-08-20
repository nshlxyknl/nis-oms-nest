import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetRequestDto {
  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
