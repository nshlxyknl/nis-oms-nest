import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RoomBookingsService } from './room-bookings.service';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';
import { UpdateRoomBookingDto } from './dto/update-room-booking.dto';
import { ApproveRoomBookingDto } from './dto/approve-room-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('room-bookings')
@UseGuards(JwtAuthGuard)
export class RoomBookingsController {
  constructor(private readonly roomBookingsService: RoomBookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createRoomBookingDto: CreateRoomBookingDto) {
    return this.roomBookingsService.create(req.user.userId, createRoomBookingDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.roomBookingsService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  findPending(@Request() req) {
    // Only admins can view all pending bookings
    if (req.user.role !== UserRole.admin) {
      return this.roomBookingsService.findAll(req.user.userId, req.user.role);
    }
    return this.roomBookingsService.findPending();
  }

  @Get('my-stats')
  getMyStats(@Request() req) {
    return this.roomBookingsService.getMyBookingStats(req.user.userId);
  }

  @Get('available-rooms')
  getAvailableRooms(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.roomBookingsService.getAvailableRooms(startTime, endTime);
  }

  @Get('room/:roomId')
  findByRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.roomBookingsService.findByRoom(roomId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomBookingsService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateRoomBookingDto: UpdateRoomBookingDto
  ) {
    return this.roomBookingsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateRoomBookingDto
    );
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() approveRoomBookingDto: ApproveRoomBookingDto
  ) {
    // Only admins can approve/reject bookings
    if (req.user.role !== UserRole.admin) {
      throw new Error('Only admins can approve or reject room bookings');
    }
    return this.roomBookingsService.approve(
      id,
      req.user.userId,
      approveRoomBookingDto.status
    );
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomBookingsService.complete(id, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomBookingsService.remove(id, req.user.userId, req.user.role);
  }
}
