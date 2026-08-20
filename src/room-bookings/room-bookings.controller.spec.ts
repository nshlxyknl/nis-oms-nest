import { Test, TestingModule } from '@nestjs/testing';
import { RoomBookingsController } from './room-bookings.controller';

describe('RoomBookingsController', () => {
  let controller: RoomBookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomBookingsController],
    }).compile();

    controller = module.get<RoomBookingsController>(RoomBookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
