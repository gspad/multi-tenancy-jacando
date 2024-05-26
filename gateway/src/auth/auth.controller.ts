import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login-step1')
    async loginStep1(@Body() body: any) {
        const response = await lastValueFrom(this.authService.loginStep1(body));
        return response.data;
    }

    @Post('login-step2')
    async loginStep2(@Body() body: any) {
        const response = await lastValueFrom(this.authService.loginStep2(body));
        return response.data;
    }
}

