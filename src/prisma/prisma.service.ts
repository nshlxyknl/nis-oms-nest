import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    console.log('PrismaService constructor called');
    
    // Parse the DATABASE_URL to extract connection details
    const databaseUrl = process.env.DATABASE_URL;
    console.log('Database URL:', databaseUrl ? 'Present' : 'Missing');
    
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: databaseUrl?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
    });
    const adapter = new PrismaPg(pool);
    
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaService constructor completed');
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}