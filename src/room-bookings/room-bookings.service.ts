import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';
import { UpdateRoomBookingDto } from './dto/update-room-booking.dto';
import { RoomBookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class RoomBookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createRoomBookingDto: CreateRoomBookingDto) {
    const { roomId, startTime, endTime, purpose } = createRoomBookingDto;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (start < now) {
      throw new BadRequestException('Cannot book room in the past');
    }

    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    if (room.status === 'maintenance') {
      throw new BadRequestException('Room is under maintenance and cannot be booked');
    }

    // Check for conflicts with existing bookings
    const conflict = await this.checkBookingConflict(roomId, start, end);
    if (conflict) {
      throw new ConflictException(
        `Room is already booked during this time. Conflicting booking: ${conflict.id}`
      );
    }

    return this.prisma.roomBooking.create({
      data: {
        roomId,
        userId,
        startTime: start,
        endTime: end,
        purpose,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
      },
    });
  }

  async checkBookingConflict(
    roomId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number
  ) {
    const conflictingBooking = await this.prisma.roomBooking.findFirst({
      where: {
        roomId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: {
          in: [RoomBookingStatus.pending, RoomBookingStatus.approved],
        },
        OR: [
          // New booking starts during existing booking
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          // New booking ends during existing booking
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          // New booking completely contains existing booking
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return conflictingBooking;
  }

  async findAll(userId?: number, userRole?: string) {
    // Admins can see all bookings, users can see only their own
    if (userRole === UserRole.admin) {
      return this.prisma.roomBooking.findMany({
        include: {
          room: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              department: true,
            },
          },
          approver: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      });
    }

    return this.prisma.roomBooking.findMany({
      where: { userId },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
        approver: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const booking = await this.prisma.roomBooking.findUnique({
      where: { id },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
        approver: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    // Users can only view their own bookings unless they're admin
    if (userRole !== UserRole.admin && booking.userId !== userId) {
      throw new ForbiddenException('You can only view your own room bookings');
    }

    return booking;
  }

  async findPending() {
    return this.prisma.roomBooking.findMany({
      where: { status: RoomBookingStatus.pending },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findByRoom(roomId: number, startDate?: string, endDate?: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    const whereClause: any = {
      roomId,
      status: {
        in: [RoomBookingStatus.approved, RoomBookingStatus.pending],
      },
    };

    if (startDate && endDate) {
      whereClause.AND = [
        { startTime: { gte: new Date(startDate) } },
        { endTime: { lte: new Date(endDate) } },
      ];
    }

    return this.prisma.roomBooking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async update(
    id: number,
    userId: number,
    userRole: string,
    updateRoomBookingDto: UpdateRoomBookingDto
  ) {
    const booking = await this.prisma.roomBooking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    // Only the owner can update their booking (and only if it's pending)
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only update your own room bookings');
    }

    if (booking.status !== RoomBookingStatus.pending) {
      throw new BadRequestException('Cannot update room booking that has been processed');
    }

    const { startTime, endTime, roomId, ...rest } = updateRoomBookingDto;

    // If changing time or room, check for conflicts
    if (startTime || endTime || roomId) {
      const newStart = startTime ? new Date(startTime) : booking.startTime;
      const newEnd = endTime ? new Date(endTime) : booking.endTime;
      const newRoomId = roomId || booking.roomId;

      if (newStart >= newEnd) {
        throw new BadRequestException('Start time must be before end time');
      }

      const conflict = await this.checkBookingConflict(
        newRoomId,
        newStart,
        newEnd,
        id
      );

      if (conflict) {
        throw new ConflictException(
          `Room is already booked during this time. Conflicting booking: ${conflict.id}`
        );
      }
    }

    return this.prisma.roomBooking.update({
      where: { id },
      data: {
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(roomId && { roomId }),
        ...rest,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
      },
    });
  }

  async approve(id: number, approverId: number, status: RoomBookingStatus) {
    const booking = await this.prisma.roomBooking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    if (booking.status !== RoomBookingStatus.pending) {
      throw new BadRequestException('Room booking has already been processed');
    }

    if (
      status !== RoomBookingStatus.approved &&
      status !== RoomBookingStatus.rejected
    ) {
      throw new BadRequestException('Invalid status. Must be approved or rejected');
    }

    // If approving, check for conflicts one more time
    if (status === RoomBookingStatus.approved) {
      const conflict = await this.checkBookingConflict(
        booking.roomId,
        booking.startTime,
        booking.endTime,
        id
      );

      if (conflict) {
        throw new ConflictException(
          `Room is already booked during this time. Conflicting booking: ${conflict.id}`
        );
      }
    }

    return this.prisma.roomBooking.update({
      where: { id },
      data: {
        status,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
        approver: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  async complete(id: number, userId: number, userRole: string) {
    const booking = await this.prisma.roomBooking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    if (booking.status !== RoomBookingStatus.approved) {
      throw new BadRequestException('Only approved bookings can be marked as completed');
    }

    // Only admin or the booking owner can mark as completed
    if (userRole !== UserRole.admin && booking.userId !== userId) {
      throw new ForbiddenException('You can only complete your own bookings');
    }

    return this.prisma.roomBooking.update({
      where: { id },
      data: {
        status: RoomBookingStatus.completed,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const booking = await this.prisma.roomBooking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Room booking with ID ${id} not found`);
    }

    // Only owner or admin can delete
    if (userRole !== UserRole.admin && booking.userId !== userId) {
      throw new ForbiddenException('You can only delete your own room bookings');
    }

    // Can only delete pending or rejected bookings
    if (
      booking.status !== RoomBookingStatus.pending &&
      booking.status !== RoomBookingStatus.rejected
    ) {
      throw new BadRequestException(
        'Cannot delete approved or completed room bookings'
      );
    }

    await this.prisma.roomBooking.delete({ where: { id } });

    return { message: 'Room booking deleted successfully' };
  }

  async getAvailableRooms(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    const allRooms = await this.prisma.room.findMany({
      where: {
        status: {
          not: 'maintenance',
        },
      },
    });

    const availableRooms: typeof allRooms = [];

    for (const room of allRooms) {
      const conflict = await this.checkBookingConflict(room.id, start, end);
      if (!conflict) {
        availableRooms.push(room);
      }
    }

    return availableRooms;
  }

  async getMyBookingStats(userId: number) {
    const bookings = await this.prisma.roomBooking.findMany({
      where: { userId },
    });

    const stats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status === RoomBookingStatus.approved).length,
      pending: bookings.filter(b => b.status === RoomBookingStatus.pending).length,
      rejected: bookings.filter(b => b.status === RoomBookingStatus.rejected).length,
      completed: bookings.filter(b => b.status === RoomBookingStatus.completed).length,
      upcoming: bookings.filter(
        b =>
          b.status === RoomBookingStatus.approved &&
          b.startTime > new Date()
      ).length,
    };

    return stats;
  }
}
