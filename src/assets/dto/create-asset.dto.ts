import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  name: string;
  type: string;
  description?: string;
  category?: string;
  value?: number;
  location?: string;
  status?: AssetStatus;
  assignedToId?: number;
}