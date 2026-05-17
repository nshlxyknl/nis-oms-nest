import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  findAll() {
    return this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    
    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}