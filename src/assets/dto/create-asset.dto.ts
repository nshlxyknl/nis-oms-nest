export class CreateAssetDto {
  name: string;
  description?: string;
  category: string;
  value?: number;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'disposed';
}