import { Controller, Post, Body, Get, UseGuards, Request, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
    console.log('AuthController constructor - authService:', !!this.authService);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('AuthController.login called with:', loginDto);
    
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      console.error('Login error:', error);
      if (error.status === 401) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log('AuthController.register called with:', registerDto);
    
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.status === 409) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      return await this.authService.getProfile(req.user.id);
    } catch (error) {
      console.error('Profile error:', error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}