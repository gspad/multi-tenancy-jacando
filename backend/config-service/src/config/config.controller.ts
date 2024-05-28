import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) { }

    @Get(':key')
    getConfig(@Param('key') key: string): string {
        return this.configService.get(key);
    }

    @Get()
    getAllConfig(): { [key: string]: string } {
        return this.configService.getAll();
    }
}

