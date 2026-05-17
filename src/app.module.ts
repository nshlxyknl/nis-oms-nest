import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { AssetsModule } from './assets/assets.module';
import { RoomsModule } from './rooms/rooms.module';
import { NoticesModule } from './notices/notices.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    EmployeesModule, 
    AssetsModule, 
    RoomsModule, 
    NoticesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
