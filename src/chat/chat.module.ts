import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
import { ChatGateway } from './gateway/chat.gateway';
import { RoomService } from './service/room.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('SECRET'),
          signOptions: { expiresIn: configService.get('EXPIRATION') },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Room, Message]),
  ],
  providers: [ChatGateway, RoomService],
})
export class ChatModule {}
