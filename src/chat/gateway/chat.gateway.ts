import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('on ws connection');
    this.server.emit('message', 'test on connection');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    return payload;
  }

  handleDisconnect(client: Socket) {
    console.log('on ws disconnect');
  }
}
