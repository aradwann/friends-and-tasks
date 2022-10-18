import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { Room } from '../entities/room.entity';
import { RoomService } from '../service/room.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private roomService: RoomService,
  ) {}
  @WebSocketServer()
  server;

  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      const token = socket.handshake.headers.authorization.split(' ')[1];
      const decodedToken = this.jwtService.verify<{
        username: string;
        sub: number;
      }>(token);
      const user = await this.usersService.findOne(decodedToken.sub);
      if (!user) {
        // disconnect
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id);

        // only emit rooms to the specific connected socket
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch (error) {
      // disconnect
      return this.disconnect(socket);
    }
  }

  @SubscribeMessage('message')
  handleMessage(socket: Socket, payload: string) {
    return payload + 'server';
  }

  handleDisconnect(socket: Socket) {
    console.log('on ws disconnect');
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async createRoom(socket: Socket, room: Room) {
    return this.roomService.create(room, socket.data.user);
  }
}
