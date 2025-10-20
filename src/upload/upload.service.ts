import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }

  validateImage(file: Express.Multer.File): boolean {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    return allowedMimes.includes(file.mimetype);
  }

  validateVideo(file: Express.Multer.File): boolean {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/avi'];
    return allowedMimes.includes(file.mimetype);
  }
}

