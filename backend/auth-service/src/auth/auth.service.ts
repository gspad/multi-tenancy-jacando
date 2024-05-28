import { Model, Schema, Connection, createConnection } from 'mongoose';
import { tenantConfig } from '../config/tenants.config';
import { User } from './interfaces/user.interface';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as OTPAuth from 'otpauth';
import * as jwt from 'jsonwebtoken';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
    private readonly tenantConnections: { [key: string]: Connection } = {};

    constructor(private configService: ConfigService) { }

    private getUserModel(tenant: string): Model<User> {
        if (!this.tenantConnections[tenant]) {
            this.tenantConnections[tenant] = createConnection(`mongodb://mongodb:27017/${tenant}`);
        }

        if (this.tenantConnections[tenant].models['User']) {
            return this.tenantConnections[tenant].models['User'];
        }

        const userSchema = new Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            tenant: { type: String, required: true },
            twoFactorSecret: { type: String, required: false },
            twoFactorEnabled: { type: Boolean, default: false },
        });

        return this.tenantConnections[tenant].model<User>('User', userSchema);
    }

    private getTenantFromEmail(email: string): string {
        const domain = email.split('@')[1];
        const tenantConfigEntry = tenantConfig.find(config => config.emailDomain === domain);

        if (!tenantConfigEntry) {
            throw new Error('Tenant not found');
        }

        return tenantConfigEntry.tenant;
    }


    async login(email: string, password: string) {
        const user = await this.getUser(email);

        if (!user || !(await this.comparePasswords(password, user.password))) {
            throw new Error('Invalid credentials');
        }

        if (user.twoFactorEnabled) {
            return { message: '2FA required' };
        }

        const { qrCode } = await this.generateTOTPSecret(email);
        return { message: '2FA not set up', qrCode, tenant: user.tenant };
    }

    async comparePasswords(password: string, storedPasswordHash: string): Promise<boolean> {
        return bcrypt.compare(password, storedPasswordHash);
    }

    async generateTOTPSecret(email: string) {
        const user = await this.getUser(email);

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.twoFactorSecret) {
            user.twoFactorSecret = this.generateSecret();
            await user.save();
        }

        const qrCode = await this.generateQRCode(user.email, user.twoFactorSecret);

        return { qrCode };
    }

    private generateSecret() {
        return new OTPAuth.Secret().base32;
    }

    private async generateQRCode(email: string, secret: string) {
        const totp = this.createTOTP(email, secret);
        const otpauth = totp.toString();

        try {
            return await toDataURL(otpauth);
        } catch (err) {
            throw err;
        }
    }

    async verifyTOTP(email: string, token: string) {
        const user = await this.getUser(email);

        if (!user) {
            throw new Error('Invalid email');
        }

        const totp = this.createTOTP(user.email, user.twoFactorSecret);

        if (!totp.validate({ token, window: 2 })) {
            throw new Error('Invalid 2FA token');
        }

        user.twoFactorEnabled = true;
        await user.save();

        return { jwt: this.generateJwt(user) };
    }

    private async getUser(email: string) {
        const tenant = this.getTenantFromEmail(email);
        const userModel = this.getUserModel(tenant);
        return userModel.findOne({ email });
    }

    private createTOTP(email: string, secret: string) {
        return new OTPAuth.TOTP({
            issuer: 'Demo',
            label: email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret,
        });
    }


    private generateJwt(user: User): string {
        const payload = { email: user.email, tenant: user.tenant };
        return jwt.sign(payload, this.configService.get<string>('JWT_SECRET'), { expiresIn: '1h' });
    }
}
