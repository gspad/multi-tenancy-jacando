import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        const response = await lastValueFrom(this.authService.login(body));
        return { message: response.data.message, qrCode: response.data.qrCode };
    }

    @Post('verify-totp')
    async verifyTotp(@Body() body: any) {
        const response = await lastValueFrom(this.authService.verifyTotp(body));
        return response.data;
    }
}

