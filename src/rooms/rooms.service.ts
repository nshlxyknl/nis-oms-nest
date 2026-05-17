import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: createRoomDto,
    });
  }

  findAll() {
    return this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });
    
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.room.delete({
      where: { id },
    });
  }
}