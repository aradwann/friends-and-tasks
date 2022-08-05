import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // this decorator envokes (glues up) the local strategy code to authenticate the user credentials
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
