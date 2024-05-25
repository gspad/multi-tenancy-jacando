import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
    imports: [HttpModule],
    controllers: [AuthController, UserController],
    providers: [AuthService, UserService],
})
export class AppModule { }
