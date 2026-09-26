import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetRequestDto } from './dto/create-asset-request.dto';
import { UpdateAssetRequestDto } from './dto/update-asset-request.dto';
import { AssetRequestStatus, AssetStatus, UserRole } from '@prisma/client';

@Injectable()
export class AssetRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createAssetRequestDto: CreateAssetRequestDto) {
    const { assetId, reason } = createAssetRequestDto;

    // Check if asset exists
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Check if asset is available
    if (asset.status !== AssetStatus.available) {
      throw new BadRequestException(
        `Asset is not available. Current status: ${asset.status}`,
      );
    }

    // Check if user already has a pending request for this asset
    const existingRequest = await this.prisma.assetRequest.findFirst({
      where: {
        assetId,
        userId,
        status: AssetRequestStatus.pending,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending request for this asset',
      );
    }

    return this.prisma.assetRequest.create({
      data: {
        assetId,
        userId,
        reason,
      },
      include: {
        asset: true,
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
    // Admins can see all requests, users can see only their own
    if (userRole === UserRole.admin) {
      return this.prisma.assetRequest.findMany({
        include: {
          asset: true,
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

    return this.prisma.assetRequest.findMany({
      where: { userId },
      include: {
        asset: true,
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
    const request = await this.prisma.assetRequest.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            assignedTo: {
              select: {
                id: true,
                username: true,
                name: true,
                department: true,
              },
            },
          },
        },
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

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    // Users can only view their own requests unless they're admin
    if (userRole !== UserRole.admin && request.userId !== userId) {
      throw new ForbiddenException('You can only view your own asset requests');
    }

    return request;
  }

  async findPending() {
    return this.prisma.assetRequest.findMany({
      where: { status: AssetRequestStatus.pending },
      include: {
        asset: true,
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

  async findByAsset(assetId: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    return this.prisma.assetRequest.findMany({
      where: { assetId },
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

  async update(
    id: number,
    userId: number,
    userRole: string,
    updateAssetRequestDto: UpdateAssetRequestDto,
  ) {
    const request = await this.prisma.assetRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    // Only the owner can update their request (and only if it's pending)
    if (request.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own asset requests',
      );
    }

    if (request.status !== AssetRequestStatus.pending) {
      throw new BadRequestException(
        'Cannot update asset request that has been processed',
      );
    }

    const { assetId, ...rest } = updateAssetRequestDto;

    // If changing asset, check if new asset is available
    if (assetId && assetId !== request.assetId) {
      const newAsset = await this.prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!newAsset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (newAsset.status !== AssetStatus.available) {
        throw new BadRequestException(
          `Asset is not available. Current status: ${newAsset.status}`,
        );
      }
    }

    return this.prisma.assetRequest.update({
      where: { id },
      data: {
        ...(assetId && { assetId }),
        ...rest,
      },
      include: {
        asset: true,
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

  async approve(id: number, approverId: number, status: AssetRequestStatus) {
    const request = await this.prisma.assetRequest.findUnique({
      where: { id },
      include: { asset: true, user: { omit: { password: true } } },
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    if (request.status !== AssetRequestStatus.pending) {
      throw new BadRequestException('Asset request has already been processed');
    }

    if (
      status !== AssetRequestStatus.approved &&
      status !== AssetRequestStatus.rejected
    ) {
      throw new BadRequestException(
        'Invalid status. Must be approved or rejected',
      );
    }

    // If approving, assign the asset to the user
    if (status === AssetRequestStatus.approved) {
      // Check if asset is still available
      const asset = await this.prisma.asset.findUnique({
        where: { id: request.assetId },
      });

      if (!asset) {
        throw new NotFoundException('Asset no longer exists');
      }

      if (asset.status !== AssetStatus.available) {
        throw new BadRequestException(
          `Asset is no longer available. Current status: ${asset.status}`,
        );
      }

      // Update both the request and the asset in a transaction
      return this.prisma.$transaction(async (tx) => {
        // Update the asset
        await tx.asset.update({
          where: { id: request.assetId },
          data: {
            status: AssetStatus.assigned,
            assignedToId: request.userId,
          },
        });

        // Update the request
        return tx.assetRequest.update({
          where: { id },
          data: {
            status,
            approvedBy: approverId,
            approvedAt: new Date(),
          },
          include: {
            asset: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    username: true,
                    name: true,
                    department: true,
                  },
                },
              },
            },
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
      });
    }

    // If rejecting, just update the request status
    return this.prisma.assetRequest.update({
      where: { id },
      data: {
        status,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        asset: true,
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

  async returnAsset(id: number, userId: number, userRole: string) {
    const request = await this.prisma.assetRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    if (request.status !== AssetRequestStatus.approved) {
      throw new BadRequestException('Only approved requests can be returned');
    }

    // Only the user who has the asset or admin can return it
    if (userRole !== UserRole.admin && request.userId !== userId) {
      throw new ForbiddenException('You can only return your own assets');
    }

    // Update both the request and the asset in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Update the asset to make it available again
      await tx.asset.update({
        where: { id: request.assetId },
        data: {
          status: AssetStatus.available,
          assignedToId: null,
        },
      });

      // Update the request status to returned
      return tx.assetRequest.update({
        where: { id },
        data: {
          status: AssetRequestStatus.returned,
        },
        include: {
          asset: true,
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
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const request = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Asset request with ID ${id} not found`);
    }

    // Only owner or admin can delete
    if (userRole !== UserRole.admin && request.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own asset requests',
      );
    }

    // Can only delete pending or rejected requests
    if (
      request.status !== AssetRequestStatus.pending &&
      request.status !== AssetRequestStatus.rejected
    ) {
      throw new BadRequestException(
        'Cannot delete approved or returned asset requests',
      );
    }

    await this.prisma.assetRequest.delete({ where: { id } });

    return { message: 'Asset request deleted successfully' };
  }

  async getMyAssets(userId: number) {
    // Get all approved requests (currently assigned assets)
    return this.prisma.assetRequest.findMany({
      where: {
        userId,
        status: AssetRequestStatus.approved,
      },
      include: {
        asset: true,
      },
      orderBy: {
        approvedAt: 'desc',
      },
    });
  }

  async getMyRequestStats(userId: number) {
    const requests = await this.prisma.assetRequest.findMany({
      where: { userId },
    });

    const stats = {
      total: requests.length,
      approved: requests.filter((r) => r.status === AssetRequestStatus.approved)
        .length,
      pending: requests.filter((r) => r.status === AssetRequestStatus.pending)
        .length,
      rejected: requests.filter((r) => r.status === AssetRequestStatus.rejected)
        .length,
      returned: requests.filter((r) => r.status === AssetRequestStatus.returned)
        .length,
      currentlyAssigned: requests.filter(
        (r) => r.status === AssetRequestStatus.approved,
      ).length,
    };

    return stats;
  }

  async getAvailableAssets() {
    return this.prisma.asset.findMany({
      where: {
        status: AssetStatus.available,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
