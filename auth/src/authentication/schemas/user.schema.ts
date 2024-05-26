import { Schema } from 'mongoose';

export const UserSchema = new Schema({
    email: String,
    password: String,
    tenant: String,
    phoneNumber: String,
    twoFactorCode: String,
});
