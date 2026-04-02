import { UserRole } from "src/generated/prisma/enums";

export class User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}
