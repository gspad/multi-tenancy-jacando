import { Document } from 'mongoose';

export interface User extends Document {
    email: string;
    password: string;
    tenant: string;
    phoneNumber: string;
    twoFactorCode?: string;
}
