import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createEmployeeDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    // Create user (employee)
    const user = await this.prisma.user.create({
      data: {
        username: createEmployeeDto.username,
        password: hashedPassword,
        name: createEmployeeDto.name,
        role: (createEmployeeDto.role as any) || 'user',
        department: createEmployeeDto.department,
      },
    });

    // Return user without password, formatted for frontend
    const { password, createdAt, updatedAt, ...result } = user;
    return {
      id: result.id,
      name: result.name,
      username: result.username,
      role: result.role,
      status: result.status,
      department: result.department,
      joined: createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        department: true,
        createdAt: true,
      },
    });

    // Format for frontend
    return users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status,
      department: user.department,
      joined: user.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
    }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        department: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status,
      department: user.department,
      joined: user.createdAt.toISOString().split('T')[0],
    };
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);
    
    const updateData: any = {};
    if (updateEmployeeDto.name) updateData.name = updateEmployeeDto.name;
    if (updateEmployeeDto.department) updateData.department = updateEmployeeDto.department;
    if (updateEmployeeDto.role) updateData.role = updateEmployeeDto.role;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        department: true,
        createdAt: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      status: user.status,
      department: user.department,
      joined: user.createdAt.toISOString().split('T')[0],
    };
  }

  async updateRole(id: number, role: string) {
    await this.findOne(id);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        role: true,
      },
    });

    return {
      id: user.id,
      role: user.role,
    };
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);
    
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        status: true,
      },
    });

    return {
      id: user.id,
      status: user.status,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'Employee deleted successfully' };
  }
}