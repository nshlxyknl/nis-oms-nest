import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createNoticeDto: CreateNoticeDto) {
    return this.prisma.notice.create({
      data: createNoticeDto,
    });
  }

  findAll() {
    return this.prisma.notice.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
    });
    
    if (!notice) {
      throw new NotFoundException(`Notice #${id} not found`);
    }
    
    return notice;
  }

  async update(id: number, updateNoticeDto: UpdateNoticeDto) {
    await this.findOne(id);
    return this.prisma.notice.update({
      where: { id },
      data: updateNoticeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.notice.delete({
      where: { id },
    });
  }
}