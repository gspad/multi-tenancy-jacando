import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login-step1')
    async loginStep1(@Body() body: any) {
        return this.authService.loginStep1(body);
    }

    @Post('login-step2')
    async loginStep2(@Body() body: any) {
        return this.authService.loginStep2(body);
    }
}
