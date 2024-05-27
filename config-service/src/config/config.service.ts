import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor() {
        const envFilePath = path.resolve(__dirname, '../../.env');
        this.envConfig = dotenv.parse(fs.readFileSync(envFilePath));
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    getAll(): { [key: string]: string } {
        return this.envConfig;
    }
}