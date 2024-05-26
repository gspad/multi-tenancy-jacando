import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, createConnection } from 'mongoose';
import { User } from './interfaces/user.interface';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { tenantConfig } from '../config/tenants.config';
import * as twilio from 'twilio';

@Injectable()
export class AuthService {
    private readonly tenantConnections: { [key: string]: Connection } = {};
    private readonly twilioClient: twilio.Twilio;

    constructor(
        private configService: ConfigService,
        @InjectModel('User') private userModel: Model<User>
    ) {
        this.twilioClient = twilio(
            this.configService.get<string>('TWILIO_ACCOUNT_SID'),
            this.configService.get<string>('TWILIO_AUTH_TOKEN')
        );
    }

    async loginStep1(email: string, password: string, phoneNumber: string) {
        const tenant = this.getTenantFromEmail(email);
        if (!tenant) {
            throw new Error('No tenant found for this email domain');
        }

        const userModel = this.getUserModel(tenant);
        const user = await userModel.findOne({ email, password });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // store the provided phone number if it doesn't exist (for testing purposes since we don't offer registration yet)
        if (!user.phoneNumber) {
            user.phoneNumber = phoneNumber;
        }

        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.twoFactorCode = twoFactorCode;
        await user.save();

        const message = `Your 2FA code is ${twoFactorCode}`;

        await this.twilioClient.messages.create({
            body: message,
            from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
            to: user.phoneNumber
        });

        return { message: '2FA code sent', tenant };
    }

    async loginStep2(email: string, twoFactorCode: string) {
        const tenant = this.getTenantFromEmail(email);

        if (!tenant) {
            throw new Error('No tenant found for this email domain');
        }

        const userModel = this.getUserModel(tenant);
        const user = await userModel.findOne({ email, twoFactorCode });

        if (!user) {
            throw new Error('Invalid 2FA code');
        }

        user.twoFactorCode = '';

        await user.save();

        const jwtToken = this.generateJwt(user);
        return { jwt: jwtToken };
    }

    private generateJwt(user: User): string {
        const payload = { email: user.email, tenant: user.tenant };
        const secret = this.configService.get<string>('JWT_SECRET');
        return jwt.sign(payload, secret, { expiresIn: '1h' });
    }

    private getTenantFromEmail(email: string): string | null {
        const domain = email.split('@')[1];
        const tenantConfigEntry = tenantConfig.find(config => config.emailDomain === domain);
        return tenantConfigEntry ? tenantConfigEntry.tenant : null;
    }

    private getUserModel(tenant: string): Model<User> {
        if (!this.tenantConnections[tenant]) {
            this.tenantConnections[tenant] = createConnection(`mongodb://mongodb:27017/${tenant}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        return this.tenantConnections[tenant].model<User>('User', new Schema({
            email: String,
            password: String,
            tenant: String,
            twoFactorCode: String,
            phoneNumber: String,
        }));
    }
}
