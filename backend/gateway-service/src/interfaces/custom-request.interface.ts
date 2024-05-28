import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: {
        email: string;
        tenant: string;
    },
    tenant?: string;
}
