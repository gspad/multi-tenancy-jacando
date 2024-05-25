import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
    constructor(private readonly httpService: HttpService) { }

    getAllUsers(): Observable<AxiosResponse<any>> {
        return this.httpService.get(`http://user-service:3002/api/user/all`);
    }
}
