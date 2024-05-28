import mongoose, { Schema, Model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

interface User extends Document {
    email: string;
    password: string;
    tenant: string;
    twoFactorSecret?: string;
    twoFactorEnabled: boolean;
}

const userSchema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tenant: { type: String, required: true },
    twoFactorSecret: { type: String, required: false },
    twoFactorEnabled: { type: Boolean, required: false, default: false },
});

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function initTenant(tenant: string, usersData: Partial<User>[]) {
    const uri = `mongodb://localhost:27017/${tenant}`;
    const connection = await mongoose.createConnection(uri);

    const UserModel: Model<User> = connection.model<User>('User', userSchema);

    for (const userData of usersData) {
        const hashedPassword = await hashPassword(userData.password as string);
        const user = new UserModel({ ...userData, password: hashedPassword });
        await user.save();
        console.log(`User ${userData.email} added to tenant ${tenant}`);
    }
}

async function main() {
    try {
        await initTenant('jacando', [{
            email: 'timo.zimmermann@jacando.com',
            password: 'password',
            tenant: 'jacando',
            twoFactorSecret: ''
        }]);

        await initTenant('gmail', [
            {
                email: 'gianlspadafora@gmail.com',
                password: 'password',
                tenant: 'gmail',
            },
            {
                email: 'user2@gmail.com',
                password: 'password',
                tenant: 'gmail',
            },
            {
                email: 'user3@gmail.com',
                password: 'password',
                tenant: 'gmail',
            },
        ]);

        console.log('Tenants and users initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing tenants and users:', error);
        process.exit(1);
    }
}

main();
