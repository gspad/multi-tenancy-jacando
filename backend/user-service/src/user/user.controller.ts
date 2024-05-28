import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller(':tenant/users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getUsers(@Query('tenant') tenant: string) {
        if (!tenant) {
            throw new Error('Tenant parameter is required');
        }
        const users = await this.userService.getUsersByTenant(tenant);
        return { users };
    }
}
