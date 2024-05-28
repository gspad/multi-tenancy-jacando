import { Controller, Post, Body, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
        try {
            const result = await this.authService.login(body.email, body.password);
            if (result.jwt) {
                res.cookie('token', result.jwt, { httpOnly: true, secure: true });
                return res.status(200).json({ message: 'Login successful' });
            } else if (result.qrCode) {
                return res.status(200).json({ message: result.message, qrCode: result.qrCode });
            } else {
                return res.status(200).json({ message: result.message });
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('verify-totp')
    async verifyTotp(@Body() body: { email: string; token: string }, @Res() res: Response) {
        try {
            const result = await this.authService.verifyTOTP(body.email, body.token);
            res.cookie('token', result.jwt, { httpOnly: true, secure: true });
            return res.status(200).json({ message: '2FA successful' });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
