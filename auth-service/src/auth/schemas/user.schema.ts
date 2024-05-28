import { Schema } from 'mongoose';

export const UserSchema = new Schema({
    email: String,
    password: String,
    tenant: String,
    twoFactorSecret: String,
    twoFactorEnabled: { type: Boolean, default: false },
});
