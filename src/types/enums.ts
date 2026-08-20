export enum UserRole {
  user = 'user',
  admin = 'admin'
}

export enum EmployeeStatus {
  active = 'active',
  inactive = 'inactive',
  onLeave = 'onLeave',
}

export enum LeaveType {
  sick = 'sick',
  casual = 'casual',
  annual = 'annual',
  unpaid = 'unpaid',
  emergency = 'emergency',
}

export enum LeaveStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export enum AssetStatus {
  available = 'available',
  assigned = 'assigned',
  maintenance = 'maintenance',
  disposed = 'disposed'
}

export enum RoomStatus {
  available = 'available',
  occupied = 'occupied',
  maintenance = 'maintenance'
}

export enum RoomBookingStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  completed = 'completed',
}

export enum AssetRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  returned = 'returned',
}

export enum NoticePriority {
  low = 'low',
  normal = 'normal',
  high = 'high',
  urgent = 'urgent'
}