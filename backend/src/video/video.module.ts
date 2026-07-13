import { Module } from '@nestjs/common';
import { VideoGateway } from './video.gateway';
import { VideoService } from './video.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return { secret, signOptions: { expiresIn: '1h' } };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [VideoGateway, VideoService],
  exports: [VideoGateway, VideoService],
})
export class VideoModule {}
