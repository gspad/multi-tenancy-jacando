import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { CustomRequest } from '../interfaces/custom-request.interface';
import { tenantConfig } from '../config/tenants.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) { }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const secret = this.configService.get<string>('JWT_SECRET');

        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = decoded;

            const tenantFromRequest = this.extractTenantFromRequest(req);
            if (!tenantFromRequest) {
                return res.status(400).json({ message: 'Tenant not specified' });
            }

            if (req.user.tenant !== tenantFromRequest) {
                return res.status(403).json({ message: 'Unauthorized access to this tenant' });
            }

            req.tenant = tenantFromRequest;
            next();
        });
    }

    private extractTenantFromRequest(req: CustomRequest): string | null {
        const tenantFromPath = req.path.split('/')[1];
        const tenantConfigEntry = tenantConfig.find(config => config.tenant === tenantFromPath);
        return tenantConfigEntry ? tenantConfigEntry.tenant : null;
    }
}
