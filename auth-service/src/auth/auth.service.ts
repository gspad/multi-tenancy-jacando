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

    async generateTOTPSecret(email: string) {
        const tenant = this.getTenantFromEmail(email);
        const userModel = this.getUserModel(tenant);

        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.twoFactorSecret) {
            const secret = new OTPAuth.Secret();
            user.twoFactorSecret = secret.base32;
            await user.save();
        }

        let qrCode;

        try {
            const totp = new OTPAuth.TOTP({
                issuer: 'Demo',
                label: user.email,
                algorithm: 'SHA1',
                digits: 6,
                period: 60,
                secret: user.twoFactorSecret,
            });

            const otpauth = totp.toString();

            qrCode = await toDataURL(otpauth);

        } catch (err) {
            throw err;
        }

        return { qrCode };
    }



    async comparePasswords(password: string, storedPasswordHash: string): Promise<boolean> {
        return bcrypt.compare(password, storedPasswordHash);
    }

    async login(email: string, password: string) {
        const tenant = this.getTenantFromEmail(email);
        const userModel = this.getUserModel(tenant);
        const user = await userModel.findOne({ email });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await this.comparePasswords(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        if (user.twoFactorEnabled) {
            return { message: '2FA required' };
        }

        if (!user.twoFactorEnabled) {
            const { qrCode } = await this.generateTOTPSecret(email);
            return { message: '2FA not set up', qrCode };
        }

        const jwtToken = this.generateJwt(user);
        return { message: 'Login successful', jwt: jwtToken };
    }

    async verifyTOTP(email: string, token: string) {
        const tenant = this.getTenantFromEmail(email);
        const userModel = this.getUserModel(tenant);
        const user = await userModel.findOne({ email });

        if (!user) {
            throw new Error('Invalid email');
        }

        try {
            const totp = new OTPAuth.TOTP({
                issuer: 'Demo',
                label: user.email,
                algorithm: 'SHA1',
                digits: 6,
                period: 60,
                secret: user.twoFactorSecret,
            });

            const verified = totp.validate({ token, window: 2 });

            if (!verified) {
                throw new Error('Invalid 2FA token');
            }

            user.twoFactorEnabled = true;
            await user.save();

            const jwtToken = this.generateJwt(user);
            return { jwt: jwtToken };
        } catch (err) {
            console.error(err);
            throw new Error('Invalid 2FA token');
        }
    }


    private generateJwt(user: User): string {
        const payload = { email: user.email, tenant: user.tenant };
        return jwt.sign(payload, this.configService.get<string>('JWT_SECRET'), { expiresIn: '1h' });
    }
}
