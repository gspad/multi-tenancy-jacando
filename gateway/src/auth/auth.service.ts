import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(private readonly httpService: HttpService) { }

    loginStep1(body: any): Observable<AxiosResponse<any>> {
        // return this.httpService.post(`http://auth-service:3001/api/auth/login-step1`, body);
        return { tenant: 'test-tenant', message: 'Login step 1 successful (hardcoded)' };
    }

    loginStep2(body: any): Observable<AxiosResponse<any>> {
        // return this.httpService.post(`http://auth-service:3001/api/auth/login-step2`, body);
        return { message: 'Login step 2 successful (hardcoded)' };
    }
}
