import { Controller, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CustomRequest } from '../interfaces/custom-request.interface';

@Controller('/api/users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getUsers(@Req() req: CustomRequest) {
        if (!req.user) {
            throw new Error('User not found. Likely a JWT issue.');
        }
        const tenant = req.user?.tenant;
        const users = await this.userService.getAllUsersFor(tenant);
        return { users };
    }
}
