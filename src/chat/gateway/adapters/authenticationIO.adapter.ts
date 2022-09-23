import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class AuthenticationIOAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
  }
  createIOServer(port: number, options?: ServerOptions) {
    options.allowRequest = async (request, allowFunction) => {
      const token = request.headers.authorization.split(' ')[1];

      let verified;
      try {
        verified = token && this.jwtService.verify(token);
      } catch (error) {
        return allowFunction('error verifiying token', false);
      }

      if (verified) {
        return allowFunction(null, true);
      }
      return allowFunction('unauthorized', false);
    };

    return super.createIOServer(port, options);
  }
}
