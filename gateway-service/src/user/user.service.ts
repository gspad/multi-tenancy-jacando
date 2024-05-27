import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
    constructor(private readonly httpService: HttpService) { }

    getAllUsersFor(tenant: string): Observable<AxiosResponse<any>> {
        return this.httpService.get(`http://user-service:3002/users?tenant=${tenant}`);
    }
}
