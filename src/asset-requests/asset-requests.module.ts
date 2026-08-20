import { Module } from '@nestjs/common';
import { AssetRequestsService } from './asset-requests.service';
import { AssetRequestsController } from './asset-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AssetRequestsService],
  controllers: [AssetRequestsController],
  exports: [AssetRequestsService],
})
export class AssetRequestsModule {}
