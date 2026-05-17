import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: createAssetDto,
    });
  }

  findAll() {
    return this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    
    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }
    
    return asset;
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    await this.findOne(id);
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}