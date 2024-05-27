import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login-step1')
    async loginStep1(@Body() body: { email: string; password: string }) {
        try {
            const result = await this.authService.loginStep1(body.email, body.password);
            return result;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('login-step2')
    async loginStep2(@Body() body: { email: string; twoFactorCode: string }) {
        try {
            const result = await this.authService.loginStep2(body.email, body.twoFactorCode);
            return result;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}

