import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(private readonly httpService: HttpService) { }

    loginStep1(body: any): Observable<AxiosResponse<any>> {
        return this.httpService.post(`http://auth-service:3001/api/auth/login-step1`, body);
    }

    loginStep2(body: any): Observable<AxiosResponse<any>> {
        return this.httpService.post(`http://auth-service:3001/api/auth/login-step2`, body);
    }
}
