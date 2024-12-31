import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { RolesGuards } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-guard';
import { JwtStrategy } from './guards/jwt-strategy';
import { UserModule } from 'src/user/user.module';

@Module({
    imports:[
        forwardRef(()=> UserModule),
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory:async(configService:ConfigService)=>({
                secret:configService.get('JWT_SECRET'),
                signOptions:{expiresIn:'1000s'}
            })
        })
    ],
    providers:[AuthService,RolesGuards,JwtAuthGuard,JwtStrategy],
    exports:[AuthService]
})
export class AuthModule {}
