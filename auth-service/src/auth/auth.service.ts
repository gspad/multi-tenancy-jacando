import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model, Schema, Connection, createConnection } from 'mongoose';
import { User } from './interfaces/user.interface';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { tenantConfig } from '../config/tenants.config';

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly tenantConnections: { [key: string]: Connection } = {};
    private configServiceUrl = 'http://config-service:4000/config';
    private transporter: nodemailer.Transporter;
    private gmailUser: string;
    private gmailPass: string;

    async onModuleInit() {
        await this.initializeEmailClient();
    }

    private async getConfigValue(key: string): Promise<string> {
        const response = await axios.get(`${this.configServiceUrl}/${key}`);
        return response.data;
    }

    private async initializeEmailClient() {
        this.gmailUser = await this.getConfigValue('GMAIL_USER');
        this.gmailPass = await this.getConfigValue('GMAIL_PASS');

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.gmailUser,
                pass: this.gmailPass,
            },
        });
    }

    async loginStep1(email: string, password: string) {
        const tenant = this.getTenantFromEmail(email);
        if (!tenant) {
            throw new Error('No tenant found for this email domain');
        }

        const userModel = this.getUserModel(tenant);
        const user = await userModel.findOne({ email, password });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = twoFactorCode;
        await user.save();

        const mailOptions = {
            from: this.gmailUser,
            to: user.email,
            subject: 'Your 2FA Code',
            text: `Your 2FA code is ${twoFactorCode}`,
        };

        await this.transporter.sendMail(mailOptions);

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

        const jwtToken = await this.generateJwt(user);
        return { jwt: jwtToken };
    }

    private async generateJwt(user: User): Promise<string> {
        const payload = { email: user.email, tenant: user.tenant };
        const secret = await this.getConfigValue('JWT_SECRET');
        return jwt.sign(payload, secret, { expiresIn: '1h' });
    }

    private getTenantFromEmail(email: string): string | null {
        const domain = email.split('@')[1];
        const tenantConfigEntry = tenantConfig.find((config) => config.emailDomain === domain);
        return tenantConfigEntry ? tenantConfigEntry.tenant : null;
    }

    private getUserModel(tenant: string): Model<User> {
        if (!this.tenantConnections[tenant]) {
            this.tenantConnections[tenant] = createConnection(`mongodb://mongodb:27017/${tenant}`);
        }

        const userSchema = new Schema({
            email: { type: String, required: true },
            password: { type: String, required: true },
            tenant: { type: String, required: true },
            twoFactorCode: { type: String, required: false },
        });

        return this.tenantConnections[tenant].model<User>('User', userSchema);
    }
}
