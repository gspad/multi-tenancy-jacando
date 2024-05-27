import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, createConnection, Schema } from 'mongoose';
import { User } from '../interfaces/user.interface';

@Injectable()
export class UserService {
    private readonly tenantConnections: { [key: string]: Connection } = {};

    constructor(@InjectModel('User') private userModel: Model<User>) { }

    private getUserModel(tenant: string): Model<User> {
        if (!this.tenantConnections[tenant]) {
            this.tenantConnections[tenant] = createConnection(`mongodb://mongodb:27017/${tenant}`);
        }

        return this.tenantConnections[tenant].model<User>('User', new Schema({
            email: { type: String, required: true },
            password: { type: String, required: true },
            tenant: { type: String, required: true },
            twoFactorCode: { type: String, required: false },
        }));
    }

    async getUsersByTenant(tenant: string): Promise<User[]> {
        const userModel = this.getUserModel(tenant);
        return userModel.find({ tenant }).exec();
    }
}
