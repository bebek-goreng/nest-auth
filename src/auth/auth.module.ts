import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return {
        secret: config.get<string>('SECRET_KEY'),
        signOptions: {
          expiresIn: config.get<string | number>('JWT_EXPIRES'),
        },
      };
    },
  }),
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
