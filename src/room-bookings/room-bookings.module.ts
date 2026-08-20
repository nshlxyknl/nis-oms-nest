import { Module } from '@nestjs/common';
import { RoomBookingsService } from './room-bookings.service';
import { RoomBookingsController } from './room-bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RoomBookingsService],
  controllers: [RoomBookingsController],
  exports: [RoomBookingsService],
})
export class RoomBookingsModule {}
