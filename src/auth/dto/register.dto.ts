import { UserRole } from '../../types/enums';

export class RegisterDto {
  username: string;
  password: string;
  role?: UserRole;
}