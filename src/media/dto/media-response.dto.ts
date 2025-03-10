import { ApiProperty } from '@nestjs/swagger';
import { Media } from '../entities/media.entity';

export class MediaResponseDto {
  @ApiProperty({
    type: [Media],
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Beispielvideo',
        path: '/pfad/zum/video.mp4',
        type: 'movie',
        duration: 7200,
        processed: true,
        createdAt: '2025-03-10T12:00:00Z'
      }
    ]
  })
  data: Media[];
} 