export class CreateEmployeeDto {
  name: string;
  email: string;
  position: string;
  department: string;
  salary?: number;
  hireDate?: Date;
}