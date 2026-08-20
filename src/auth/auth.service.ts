import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../types/enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {
    console.log('AuthService constructor - prisma:', !!this.prisma);
    console.log('AuthService constructor - jwtService:', !!this.jwtService);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('AuthService.login called with:', loginDto);
    
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate real JWT token
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    console.log('AuthService.register called with:', registerDto);
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user with default role 'user'
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        password: hashedPassword,
        name: registerDto.name || registerDto.username,
        role: registerDto.role || UserRole.user, // Default to 'user' role
      },
    });

    const { password: _, ...result } = user;

    // Generate real JWT token
    const payload = { username: result.username, sub: result.id, role: result.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: result.id,
        username: result.username,
        name: result.name || result.username,
        role: result.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      role: user.role,
    };
  }
}