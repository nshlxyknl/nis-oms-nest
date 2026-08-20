import { Test, TestingModule } from '@nestjs/testing';
import { RoomBookingsService } from './room-bookings.service';

describe('RoomBookingsService', () => {
  let service: RoomBookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomBookingsService],
    }).compile();

    service = module.get<RoomBookingsService>(RoomBookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
