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
} from '@nestjs/common';
import { AssetRequestsService } from './asset-requests.service';
import { CreateAssetRequestDto } from './dto/create-asset-request.dto';
import { UpdateAssetRequestDto } from './dto/update-asset-request.dto';
import { ApproveAssetRequestDto } from './dto/approve-asset-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('asset-requests')
@UseGuards(JwtAuthGuard)
export class AssetRequestsController {
  constructor(private readonly assetRequestsService: AssetRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createAssetRequestDto: CreateAssetRequestDto) {
    return this.assetRequestsService.create(req.user.userId, createAssetRequestDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.assetRequestsService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  findPending(@Request() req) {
    // Only admins can view all pending requests
    if (req.user.role !== UserRole.admin) {
      return this.assetRequestsService.findAll(req.user.userId, req.user.role);
    }
    return this.assetRequestsService.findPending();
  }

  @Get('my-assets')
  getMyAssets(@Request() req) {
    return this.assetRequestsService.getMyAssets(req.user.userId);
  }

  @Get('my-stats')
  getMyStats(@Request() req) {
    return this.assetRequestsService.getMyRequestStats(req.user.userId);
  }

  @Get('available-assets')
  getAvailableAssets() {
    return this.assetRequestsService.getAvailableAssets();
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId', ParseIntPipe) assetId: number) {
    return this.assetRequestsService.findByAsset(assetId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.assetRequestsService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateAssetRequestDto: UpdateAssetRequestDto
  ) {
    return this.assetRequestsService.update(
      id,
      req.user.userId,
      req.user.role,
      updateAssetRequestDto
    );
  }

  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() approveAssetRequestDto: ApproveAssetRequestDto
  ) {
    // Only admins can approve/reject requests
    if (req.user.role !== UserRole.admin) {
      throw new Error('Only admins can approve or reject asset requests');
    }
    return this.assetRequestsService.approve(
      id,
      req.user.userId,
      approveAssetRequestDto.status
    );
  }

  @Patch(':id/return')
  returnAsset(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.assetRequestsService.returnAsset(
      id,
      req.user.userId,
      req.user.role
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.assetRequestsService.remove(id, req.user.userId, req.user.role);
  }
}
