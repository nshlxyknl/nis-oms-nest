export class CreateRoomDto {
  name: string;
  capacity: number;
  location: string;
  equipment?: string;
  status?: 'available' | 'occupied' | 'maintenance';
}