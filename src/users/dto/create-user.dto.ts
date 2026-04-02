import { UserRole } from "src/generated/prisma/enums";

export class CreateUserDto {
  username: string;
  password: string;
  role?: UserRole;
}
