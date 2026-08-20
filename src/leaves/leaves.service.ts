import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveStatus, UserRole } from '@prisma/client';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createLeaveDto: CreateLeaveDto) {
    const { startDate, endDate, days, ...rest } = createLeaveDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.leave.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        days,
        ...rest,
      },
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
    });
  }

  async findAll(userId?: number, userRole?: string) {
    // Admins can see all leaves, users can see only their own
    if (userRole === UserRole.admin) {
      return this.prisma.leave.findMany({
        include: {
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
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.leave.findMany({
      where: { userId },
      include: {
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
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
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

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Users can only view their own leaves unless they're admin
    if (userRole !== UserRole.admin && leave.userId !== userId) {
      throw new ForbiddenException('You can only view your own leave requests');
    }

    return leave;
  }

  async findPending() {
    return this.prisma.leave.findMany({
      where: { status: LeaveStatus.pending },
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
        createdAt: 'asc',
      },
    });
  }

  async update(id: number, userId: number, userRole: string, updateLeaveDto: UpdateLeaveDto) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Only the owner can update their leave (and only if it's pending)
    if (leave.userId !== userId) {
      throw new ForbiddenException('You can only update your own leave requests');
    }

    if (leave.status !== LeaveStatus.pending) {
      throw new BadRequestException('Cannot update leave request that has been processed');
    }

    const { startDate, endDate, ...rest } = updateLeaveDto;

    return this.prisma.leave.update({
      where: { id },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...rest,
      },
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
    });
  }

  async approve(id: number, approverId: number, status: LeaveStatus) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    if (leave.status !== LeaveStatus.pending) {
      throw new BadRequestException('Leave request has already been processed');
    }

    if (status !== LeaveStatus.approved && status !== LeaveStatus.rejected) {
      throw new BadRequestException('Invalid status. Must be approved or rejected');
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
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

  async remove(id: number, userId: number, userRole: string) {
    const leave = await this.prisma.leave.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Only owner or admin can delete
    if (userRole !== UserRole.admin && leave.userId !== userId) {
      throw new ForbiddenException('You can only delete your own leave requests');
    }

    // Can only delete pending leaves
    if (leave.status !== LeaveStatus.pending) {
      throw new BadRequestException('Cannot delete leave request that has been processed');
    }

    await this.prisma.leave.delete({ where: { id } });

    return { message: 'Leave request deleted successfully' };
  }

  async getMyLeaveStats(userId: number) {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const leaves = await this.prisma.leave.findMany({
      where: {
        userId,
        startDate: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });

    const stats = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === LeaveStatus.approved).length,
      pending: leaves.filter(l => l.status === LeaveStatus.pending).length,
      rejected: leaves.filter(l => l.status === LeaveStatus.rejected).length,
      totalDaysApproved: leaves
        .filter(l => l.status === LeaveStatus.approved)
        .reduce((sum, l) => sum + l.days, 0),
      byType: {
        sick: leaves.filter(l => l.leaveType === 'sick').length,
        casual: leaves.filter(l => l.leaveType === 'casual').length,
        annual: leaves.filter(l => l.leaveType === 'annual').length,
        unpaid: leaves.filter(l => l.leaveType === 'unpaid').length,
        emergency: leaves.filter(l => l.leaveType === 'emergency').length,
      },
    };

    return stats;
  }
}
