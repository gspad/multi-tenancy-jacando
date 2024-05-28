import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(private readonly httpService: HttpService) { }

    login(body: any): Observable<AxiosResponse<any>> {
        const res = this.httpService.post(`http://auth-service:3000/auth/login`, body);
        return res;
    }

    verifyTotp(body: any): Observable<AxiosResponse<any>> {
        return this.httpService.post(`http://auth-service:3000/auth/verify-totp`, body);
    }
}
