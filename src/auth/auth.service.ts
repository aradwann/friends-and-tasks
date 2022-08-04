import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneByUsername(username);

    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      const { password, ...restOfUser } = user;
      return restOfUser;
    }
    return null;
  }
}
