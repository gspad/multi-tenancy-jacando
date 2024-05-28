import { Injectable } from '@nestjs/common';
import { Model, Connection, createConnection, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';

@Injectable()
export class UserService {
    private readonly tenantConnections: { [key: string]: Connection } = {};
    private readonly userSchema: Schema;

    constructor() {
        this.userSchema = new Schema({
            email: { type: String, required: true },
            password: { type: String, required: true },
            tenant: { type: String, required: true },
            twoFactorCode: { type: String, required: false },
        });
    }

    private async getUserModel(tenant: string): Promise<Model<User>> {
        if (!this.tenantConnections[tenant]) {
            try {
                this.tenantConnections[tenant] = await createConnection(`mongodb://mongodb:27017/${tenant}`);
            } catch (error) {
                throw new Error(`Unable to connect to tenant database: ${tenant}`);
            }
        }

        return this.tenantConnections[tenant].model<User>('User', this.userSchema);
    }

    async getUsersByTenant(tenant: string): Promise<User[]> {
        const userModel = await this.getUserModel(tenant);
        return userModel.find({ tenant }).exec();
    }
}

