export interface User {
    email: string;
    password: string;
    tenant: string;
    twoFactorCode?: string;
}
