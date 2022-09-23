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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  @WebSocketServer()
  server;

  title: string[] = [];
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = client.handshake.headers.authorization.split(' ')[1];
      const decodedToken = this.jwtService.verify<{
        username: string;
        sub: number;
      }>(token);
      const user = await this.usersService.findOne(decodedToken.sub);
      if (!user) {
        // disconnect
        return this.disconnect(client);
      } else {
        this.title.push('Value' + Math.random().toString());
        this.server.emit('message', this.title);
      }
    } catch (error) {
      // disconnect
      return this.disconnect(client);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string) {
    return payload + 'server';
  }

  handleDisconnect(client: Socket) {
    console.log('on ws disconnect');
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
