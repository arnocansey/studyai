import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollaborativeGateway } from './collaborative.gateway';
import { CollaborativeService } from './collaborative.service';

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
  providers: [CollaborativeGateway, CollaborativeService],
  exports: [CollaborativeGateway, CollaborativeService],
})
export class CollaborativeModule {}
