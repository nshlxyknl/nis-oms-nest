export class CreateNoticeDto {
  title: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isActive?: boolean;
}