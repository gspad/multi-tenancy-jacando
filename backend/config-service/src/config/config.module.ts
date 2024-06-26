import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
    imports: [],
    controllers: [ConfigController],
    providers: [ConfigService],
})
export class ConfigurationModule { }

