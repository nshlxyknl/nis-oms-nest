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
  HttpStatus
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createLeaveDto: CreateLeaveDto) {
    return this.leavesService.create(req.user.userId, createLeaveDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.leavesService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  findPending(@Request() req) {
    // Only admins can view all pending leaves
    if (req.user.role !== UserRole.admin) {
      return this.leavesService.findAll(req.user.userId, req.user.role);
    }
    return this.leavesService.findPending();
  }

  @Get('my-stats')
  getMyStats(@Request() req) {
    return this.leavesService.getMyLeaveStats(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.leavesService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateLeaveDto: UpdateLeaveDto
  ) {
    return this.leavesService.update(id, req.user.userId, req.user.role, updateLeaveDto);
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() approveLeaveDto: ApproveLeaveDto
  ) {
    // Only admins can approve/reject leaves
    if (req.user.role !== UserRole.admin) {
      throw new Error('Only admins can approve or reject leave requests');
    }
    return this.leavesService.approve(id, req.user.userId, approveLeaveDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.leavesService.remove(id, req.user.userId, req.user.role);
  }
}
