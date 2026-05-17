import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notices')
@UseGuards(JwtAuthGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticesService.create(createNoticeDto);
  }

  @Get()
  findAll() {
    return this.noticesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticesService.update(id, updateNoticeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticesService.remove(id);
  }
}