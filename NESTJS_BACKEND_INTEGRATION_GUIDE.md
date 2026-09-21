# NestJS Backend Integration Guide for NIS-OMS Frontend

This document provides a comprehensive guide for building a NestJS backend that seamlessly integrates with the existing Next.js frontend (Office Management System).

---

## Table of Contents

1. [Frontend Architecture Overview](#frontend-architecture-overview)
2. [API Requirements & Endpoints](#api-requirements--endpoints)
3. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
4. [Entity Models](#entity-models)
5. [Module Structure](#module-structure)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Schema](#database-schema)
8. [CORS & Environment Configuration](#cors--environment-configuration)
9. [Complete Implementation Checklist](#complete-implementation-checklist)

---

## Frontend Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **State Management**: TanStack Query (React Query) v5
- **HTTP Client**: Custom Fetch API wrapper (`api.ts`)
- **Authentication**: JWT Bearer Token (stored in localStorage)
- **UI**: Shadcn UI + Tailwind CSS

### API Client Configuration
```typescript
// Base URL from environment variable
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// All requests include:
// - Authorization: Bearer <token> (when authenticated)
// - Content-Type: application/json
// - credentials: 'include' (for cookies)
```

### Frontend Routes Structure
```
/auth                          → Authentication page
/dashboard/overview            → Dashboard overview (both roles)
/dashboard/notices             → Notices page (both roles)

# User Routes (role: 'user')
/dashboard/attendance          → Check-in/Check-out & history
/dashboard/leave              → Apply & view leave requests
/dashboard/book-rooms         → Book meeting rooms
/dashboard/book-assets        → Request assets

# Admin Routes (role: 'admin')
/dashboard/employees          → Employee management
/dashboard/total-rooms        → Room inventory
/dashboard/total-assets       → Asset inventory
/dashboard/approvals          → Approval dashboard
/dashboard/approvals/leave    → Leave approvals
/dashboard/approvals/rooms    → Room booking approvals
/dashboard/approvals/assets   → Asset request approvals
```

---

## API Requirements & Endpoints

### 1. Authentication Module

#### POST `/auth/register`
**Request Body:**
```json
{
  "username": "string",
  "password": "string (min 6 chars)",
  "name": "string"
}
```
**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### POST `/auth/login`
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "access_token": "string (JWT)",
  "user": {
    "id": "number",
    "username": "string",
    "name": "string",
    "role": "ADMIN | USER"
  }
}
```

#### GET `/auth/me`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "id": "number",
  "username": "string",
  "name": "string",
  "role": "ADMIN | USER"
}
```

#### POST `/auth/logout`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2. Employee Module (Admin Only)

#### GET `/employees`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "username": "string",
    "role": "admin | user",
    "status": "active | inactive | on-leave",
    "department": "string",
    "joined": "YYYY-MM-DD"
  }
]
```

#### POST `/employees`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "role": "ADMIN | USER",
  "department": "string (optional)"
}
```
**Response:**
```json
{
  "id": "number",
  "name": "string",
  "username": "string",
  "role": "admin | user",
  "status": "active",
  "department": "string",
  "joined": "YYYY-MM-DD"
}
```

#### PATCH `/employees/:id/role`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "role": "ADMIN | USER"
}
```
**Response:**
```json
{
  "id": "number",
  "role": "admin | user"
}
```

#### PATCH `/employees/:id/status`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "status": "ACTIVE | INACTIVE | ON_LEAVE"
}
```
**Response:**
```json
{
  "id": "number",
  "status": "active | inactive | on-leave"
}
```

---

### 3. Leave Module

#### GET `/leaves`
**Headers:** `Authorization: Bearer <token>`  
**Behavior:**
- For **users**: Return only their own leave requests
- For **admins**: Return all leave requests from all users

**Response:**
```json
[
  {
    "id": "number",
    "userId": "number",
    "userName": "string",
    "type": "annual | sick | emergency | unpaid",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "days": "number",
    "reason": "string | null",
    "status": "pending | approved | rejected",
    "appliedOn": "YYYY-MM-DD",
    "approvedBy": "string | null"
  }
]
```

#### POST `/leaves`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "type": "ANNUAL | SICK | EMERGENCY | UNPAID",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "days": "number",
  "reason": "string (optional)"
}
```
**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "type": "annual",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "days": "number",
  "status": "pending",
  "appliedOn": "YYYY-MM-DD"
}
```

#### PATCH `/leaves/:id/approve`
**Headers:** `Authorization: Bearer <token>` (Admin only)  
**Response:**
```json
{
  "id": "number",
  "status": "approved",
  "approvedBy": "string"
}
```

#### PATCH `/leaves/:id/reject`
**Headers:** `Authorization: Bearer <token>` (Admin only)  
**Response:**
```json
{
  "id": "number",
  "status": "rejected",
  "approvedBy": "string"
}
```

---

### 4. Room Module

#### GET `/rooms`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "capacity": "number",
    "status": "available | occupied | maintenance"
  }
]
```

#### POST `/rooms` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "name": "string",
  "capacity": "number",
  "status": "AVAILABLE | OCCUPIED | MAINTENANCE"
}
```

#### PATCH `/rooms/:id` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "name": "string (optional)",
  "capacity": "number (optional)",
  "status": "AVAILABLE | OCCUPIED | MAINTENANCE (optional)"
}
```

#### DELETE `/rooms/:id` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

---

### 5. Room Booking Module

#### GET `/room-bookings`
**Headers:** `Authorization: Bearer <token>`  
**Behavior:**
- For **users**: Return only their own bookings
- For **admins**: Return all bookings

**Response:**
```json
[
  {
    "id": "number",
    "roomId": "number",
    "roomName": "string",
    "userId": "number",
    "userName": "string",
    "startTime": "ISO 8601 DateTime",
    "endTime": "ISO 8601 DateTime",
    "purpose": "string | null",
    "status": "pending | approved | rejected"
  }
]
```

#### POST `/room-bookings`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "roomId": "number",
  "startTime": "ISO 8601 DateTime",
  "endTime": "ISO 8601 DateTime",
  "purpose": "string (optional)"
}
```
**Response:**
```json
{
  "id": "number",
  "roomId": "number",
  "userId": "number",
  "startTime": "ISO 8601 DateTime",
  "endTime": "ISO 8601 DateTime",
  "status": "pending"
}
```

#### PATCH `/room-bookings/:id/approve` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

#### PATCH `/room-bookings/:id/reject` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

---

### 6. Asset Module

#### GET `/assets`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "type": "string",
    "status": "available | assigned | maintenance",
    "assignedTo": "string | null",
    "assignedToId": "number | null"
  }
]
```

#### POST `/assets` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "name": "string",
  "type": "string",
  "status": "AVAILABLE | ASSIGNED | MAINTENANCE"
}
```

#### PATCH `/assets/:id` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "name": "string (optional)",
  "type": "string (optional)",
  "status": "AVAILABLE | ASSIGNED | MAINTENANCE (optional)"
}
```

#### DELETE `/assets/:id` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

---

### 7. Asset Request Module

#### GET `/asset-requests`
**Headers:** `Authorization: Bearer <token>`  
**Behavior:**
- For **users**: Return only their own requests
- For **admins**: Return all requests

**Response:**
```json
[
  {
    "id": "number",
    "assetId": "number",
    "assetName": "string",
    "assetType": "string",
    "userId": "number",
    "userName": "string",
    "reason": "string | null",
    "status": "pending | approved | rejected",
    "requestedOn": "YYYY-MM-DD"
  }
]
```

#### POST `/asset-requests`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "assetId": "number",
  "reason": "string (optional)"
}
```

#### PATCH `/asset-requests/:id/approve` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Note:** Should also update the asset's `assignedTo` and `assignedToId` fields

#### PATCH `/asset-requests/:id/reject` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

---

### 8. Notices Module

#### GET `/notices`
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "content": "string",
    "priority": "high | medium | low",
    "category": "general | urgent | info",
    "postedBy": "string",
    "postedOn": "YYYY-MM-DD"
  }
]
```

#### POST `/notices` (Admin only)
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "priority": "HIGH | MEDIUM | LOW",
  "category": "GENERAL | URGENT | INFO"
}
```

#### DELETE `/notices/:id` (Admin only)
**Headers:** `Authorization: Bearer <token>`  

---

## DTOs (Data Transfer Objects)

### Auth DTOs

```typescript
// auth/dto/register.dto.ts
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

// auth/dto/login.dto.ts
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Employee DTOs

```typescript
// employees/dto/create-employee.dto.ts
export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['ADMIN', 'USER'])
  role: string;

  @IsString()
  @IsOptional()
  department?: string;
}

// employees/dto/update-role.dto.ts
export class UpdateRoleDto {
  @IsEnum(['ADMIN', 'USER'])
  role: string;
}

// employees/dto/update-status.dto.ts
export class UpdateStatusDto {
  @IsEnum(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
  status: string;
}
```

### Leave DTOs

```typescript
// leaves/dto/create-leave.dto.ts
export class CreateLeaveDto {
  @IsEnum(['ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID'])
  type: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(1)
  days: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
```

### Room Booking DTOs

```typescript
// room-bookings/dto/create-room-booking.dto.ts
export class CreateRoomBookingDto {
  @IsNumber()
  roomId: number;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;

  @IsString()
  @IsOptional()
  purpose?: string;
}
```

### Asset Request DTOs

```typescript
// asset-requests/dto/create-asset-request.dto.ts
export class CreateAssetRequestDto {
  @IsNumber()
  assetId: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
```

### Room DTOs

```typescript
// rooms/dto/create-room.dto.ts
export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsEnum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
  @IsOptional()
  status?: string;
}

// rooms/dto/update-room.dto.ts
export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsEnum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
  @IsOptional()
  status?: string;
}
```

### Asset DTOs

```typescript
// assets/dto/create-asset.dto.ts
export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'])
  @IsOptional()
  status?: string;
}

// assets/dto/update-asset.dto.ts
export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsEnum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'])
  @IsOptional()
  status?: string;
}
```

### Notice DTOs

```typescript
// notices/dto/create-notice.dto.ts
export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['HIGH', 'MEDIUM', 'LOW'])
  priority: string;

  @IsEnum(['GENERAL', 'URGENT', 'INFO'])
  category: string;
}
```

---

## Entity Models

### User Entity

```typescript
// users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on-leave'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ nullable: true })
  department: string;

  @CreateDateColumn()
  joined: Date;

  // Relations
  @OneToMany(() => Leave, leave => leave.user)
  leaves: Leave[];

  @OneToMany(() => RoomBooking, booking => booking.user)
  roomBookings: RoomBooking[];

  @OneToMany(() => AssetRequest, request => request.user)
  assetRequests: AssetRequest[];
}
```

### Leave Entity

```typescript
// leaves/entities/leave.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  EMERGENCY = 'emergency',
  UNPAID = 'unpaid'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LeaveType
  })
  type: LeaveType;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  days: number;

  @Column({ nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING
  })
  status: LeaveStatus;

  @Column({ nullable: true })
  approvedBy: string;

  @CreateDateColumn({ type: 'date' })
  appliedOn: Date;

  @ManyToOne(() => User, user => user.leaves)
  user: User;

  @Column()
  userId: number;
}
```

### Room Entity

```typescript
// rooms/entities/room.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoomBooking } from '../../room-bookings/entities/room-booking.entity';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance'
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE
  })
  status: RoomStatus;

  @OneToMany(() => RoomBooking, booking => booking.room)
  bookings: RoomBooking[];
}
```

### RoomBooking Entity

```typescript
// room-bookings/entities/room-booking.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('room_bookings')
export class RoomBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ nullable: true })
  purpose: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.roomBookings)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Room, room => room.bookings)
  room: Room;

  @Column()
  roomId: number;
}
```

### Asset Entity

```typescript
// assets/entities/asset.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AssetRequest } from '../../asset-requests/entities/asset-request.entity';

export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance'
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.AVAILABLE
  })
  status: AssetStatus;

  @ManyToOne(() => User, { nullable: true })
  assignedToUser: User;

  @Column({ nullable: true })
  assignedToId: number;

  @OneToMany(() => AssetRequest, request => request.asset)
  requests: AssetRequest[];
}
```

### AssetRequest Entity

```typescript
// asset-requests/entities/asset-request.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Asset } from '../../assets/entities/asset.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('asset_requests')
export class AssetRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  status: RequestStatus;

  @CreateDateColumn({ type: 'date' })
  requestedOn: Date;

  @ManyToOne(() => User, user => user.assetRequests)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Asset, asset => asset.requests)
  asset: Asset;

  @Column()
  assetId: number;
}
```

### Notice Entity

```typescript
// notices/entities/notice.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum NoticePriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum NoticeCategory {
  GENERAL = 'general',
  URGENT = 'urgent',
  INFO = 'info'
}

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: NoticePriority
  })
  priority: NoticePriority;

  @Column({
    type: 'enum',
    enum: NoticeCategory
  })
  category: NoticeCategory;

  @Column()
  postedBy: string;

  @CreateDateColumn({ type: 'date' })
  postedOn: Date;
}
```

---

## Module Structure

### Recommended NestJS Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
│   └── database.config.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   └── filters/
│       └── http-exception.filter.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/
│       └── user.entity.ts
├── employees/
│   ├── employees.module.ts
│   ├── employees.controller.ts
│   ├── employees.service.ts
│   └── dto/
│       ├── create-employee.dto.ts
│       ├── update-role.dto.ts
│       └── update-status.dto.ts
├── leaves/
│   ├── leaves.module.ts
│   ├── leaves.controller.ts
│   ├── leaves.service.ts
│   ├── entities/
│   │   └── leave.entity.ts
│   └── dto/
│       └── create-leave.dto.ts
├── rooms/
│   ├── rooms.module.ts
│   ├── rooms.controller.ts
│   ├── rooms.service.ts
│   ├── entities/
│   │   └── room.entity.ts
│   └── dto/
│       ├── create-room.dto.ts
│       └── update-room.dto.ts
├── room-bookings/
│   ├── room-bookings.module.ts
│   ├── room-bookings.controller.ts
│   ├── room-bookings.service.ts
│   ├── entities/
│   │   └── room-booking.entity.ts
│   └── dto/
│       └── create-room-booking.dto.ts
├── assets/
│   ├── assets.module.ts
│   ├── assets.controller.ts
│   ├── assets.service.ts
│   ├── entities/
│   │   └── asset.entity.ts
│   └── dto/
│       ├── create-asset.dto.ts
│       └── update-asset.dto.ts
├── asset-requests/
│   ├── asset-requests.module.ts
│   ├── asset-requests.controller.ts
│   ├── asset-requests.service.ts
│   ├── entities/
│   │   └── asset-request.entity.ts
│   └── dto/
│       └── create-asset-request.dto.ts
└── notices/
    ├── notices.module.ts
    ├── notices.controller.ts
    ├── notices.service.ts
    ├── entities/
    │   └── notice.entity.ts
    └── dto/
        └── create-notice.dto.ts
```

---

## Authentication & Authorization

### JWT Strategy Implementation

```typescript
// auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // This gets attached to req.user
  }
}
```

### JWT Auth Guard

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Roles Guard

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Roles Decorator

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### Current User Decorator

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Example Controller with Guards

```typescript
// employees/employees.controller.ts
import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.employeesService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.employeesService.updateRole(+id, updateRoleDto);
  }
}
```

---

## Database Schema

### PostgreSQL Schema (Recommended)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  department VARCHAR(255),
  joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaves table
CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('annual', 'sick', 'emergency', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by VARCHAR(255),
  applied_on DATE DEFAULT CURRENT_DATE
);

-- Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance'))
);

-- Room bookings table
CREATE TABLE room_bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  purpose TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance')),
  assigned_to_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Asset requests table
CREATE TABLE asset_requests (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_on DATE DEFAULT CURRENT_DATE
);

-- Notices table
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'urgent', 'info')),
  posted_by VARCHAR(255) NOT NULL,
  posted_on DATE DEFAULT CURRENT_DATE
);

-- Indexes for performance
CREATE INDEX idx_leaves_user_id ON leaves(user_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_room_bookings_user_id ON room_bookings(user_id);
CREATE INDEX idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX idx_asset_requests_user_id ON asset_requests(user_id);
CREATE INDEX idx_asset_requests_asset_id ON asset_requests(asset_id);
```

---

## CORS & Environment Configuration

### Environment Variables (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nis_oms

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Main.ts Configuration

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

### App Module Configuration

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { LeavesModule } from './leaves/leaves.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomBookingsModule } from './room-bookings/room-bookings.module';
import { AssetsModule } from './assets/assets.module';
import { AssetRequestsModule } from './asset-requests/asset-requests.module';
import { NoticesModule } from './notices/notices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // Disable in production!
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    LeavesModule,
    RoomsModule,
    RoomBookingsModule,
    AssetsModule,
    AssetRequestsModule,
    NoticesModule,
  ],
})
export class AppModule {}
```

---

## Complete Implementation Checklist

### Phase 1: Project Setup
- [ ] Initialize NestJS project: `nest new backend`
- [ ] Install dependencies:
  ```bash
  npm install @nestjs/typeorm typeorm pg
  npm install @nestjs/passport passport passport-jwt @nestjs/jwt
  npm install bcrypt class-validator class-transformer
  npm install @nestjs/config
  npm install --save-dev @types/passport-jwt @types/bcrypt
  ```
- [ ] Configure `.env` file with database credentials
- [ ] Set up TypeORM configuration in `app.module.ts`

### Phase 2: Authentication & User Management
- [ ] Create User entity with role and status enums
- [ ] Implement UsersModule, UsersService
- [ ] Create AuthModule with JWT strategy
- [ ] Implement register, login, logout, and `/me` endpoints
- [ ] Create JwtAuthGuard and RolesGuard
- [ ] Test authentication flow with Postman/Insomnia

### Phase 3: Core Modules
- [ ] **Employees Module**: CRUD operations (admin only)
- [ ] **Leaves Module**: Create, list, approve/reject
- [ ] **Rooms Module**: CRUD operations
- [ ] **Room Bookings Module**: Create, list, approve/reject
- [ ] **Assets Module**: CRUD operations
- [ ] **Asset Requests Module**: Create, list, approve/reject
- [ ] **Notices Module**: CRUD operations (admin create/delete)

### Phase 4: Business Logic
- [ ] Implement role-based filtering (users see only their data, admins see all)
- [ ] Add validation for date ranges (leave dates, booking times)
- [ ] Implement status updates (when asset is approved, update `assignedTo`)
- [ ] Add proper error handling and HTTP status codes

### Phase 5: Testing & Integration
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Update frontend `.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] Test frontend-backend integration
- [ ] Handle edge cases (overlapping bookings, invalid dates, etc.)

### Phase 6: Production Readiness
- [ ] Disable TypeORM `synchronize` in production
- [ ] Add database migrations
- [ ] Implement proper logging
- [ ] Add rate limiting
- [ ] Set up environment-specific configurations
- [ ] Write API documentation (Swagger)

---

## Important Notes

### Enum Case Handling
The frontend sends enums in **UPPERCASE** (e.g., `"ANNUAL"`, `"ADMIN"`), but the database stores them in **lowercase** (e.g., `"annual"`, `"admin"`). Make sure your DTOs and services handle this conversion:

```typescript
// In your service
const leave = this.leaveRepository.create({
  ...createLeaveDto,
  type: createLeaveDto.type.toLowerCase() as LeaveType,
});
```

### Date Format
- Frontend sends dates as: `YYYY-MM-DD` for dates
- Frontend sends timestamps as: `ISO 8601` for datetime (e.g., room bookings)
- Use TypeORM's `@Column({ type: 'date' })` for date-only fields
- Use `@Column({ type: 'timestamp' })` for datetime fields

### Response Formatting
When returning entities, include related data:
```typescript
// For leaves, include user name
return this.leaveRepository.find({
  relations: ['user'],
  select: {
    user: { id: true, name: true }
  }
});
```

### Frontend Expectations
- Token is stored in `localStorage` as `'token'`
- User object is stored in `localStorage` as `'user'`
- All API responses should be JSON
- Errors should return appropriate HTTP status codes (400, 401, 403, 404, 500)

---

## Quick Start Commands

```bash
# Create NestJS project
npx @nestjs/cli new backend

# Navigate to project
cd backend

# Install dependencies
npm install @nestjs/typeorm typeorm pg @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt class-validator class-transformer @nestjs/config
npm install --save-dev @types/passport-jwt @types/bcrypt

# Generate modules
nest g module auth
nest g module users
nest g module employees
nest g module leaves
nest g module rooms
nest g module room-bookings
nest g module assets
nest g module asset-requests
nest g module notices

# Generate services and controllers
nest g service auth
nest g controller auth
nest g service users
nest g service employees
nest g controller employees
# ... repeat for all modules

# Run development server
npm run start:dev
```

---

## Testing the Integration

### 1. Start both servers
```bash
# Backend (default port 3001)
cd backend
npm run start:dev

# Frontend (default port 3000)
cd nis-oms
npm run dev
```

### 2. Set Frontend Environment Variable
Create `.env.local` in frontend root:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Test Authentication Flow
1. Navigate to `http://localhost:3000/auth`
2. Register a new user
3. Login and verify token storage
4. Check if redirect to dashboard works

### 4. Verify API Calls
- Open browser DevTools → Network tab
- Perform actions (create leave request, book room, etc.)
- Verify API calls are made to `http://localhost:3001`
- Check request/response payloads match the specifications

---

## Support & Troubleshooting

### Common Issues

**CORS Error:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check `main.ts` CORS configuration

**401 Unauthorized:**
- Verify JWT token is being sent in `Authorization: Bearer <token>` header
- Check JWT_SECRET matches between auth service and strategy
- Ensure token is not expired

**TypeORM Sync Issues:**
- Delete database and restart (development only)
- Check entity decorators are correct
- Verify all entities are imported in `app.module.ts`

**Validation Errors:**
- Check DTOs have proper decorators from `class-validator`
- Ensure ValidationPipe is enabled globally in `main.ts`

---

## Conclusion

This guide provides everything needed to build a NestJS backend that seamlessly integrates with your existing Next.js frontend. Follow the implementation checklist, use the provided DTOs and entities, and ensure proper authentication/authorization guards are in place.

The frontend is already configured to work with this backend structure—you just need to implement the API endpoints as specified!
