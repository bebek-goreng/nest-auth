import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService
    ) { }


    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { name, email, password } = signUpDto;

        const existingUser = await this.userModel.findOne({ email }).exec();

        if (existingUser) {
            throw new HttpException('Email already registered', 400);
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        const user = await this.userModel.create({
            name,
            email,
            password: hashPassword
        });

        const token = this.jwtService.sign({
            id: user._id,
            name: name,
        });

        return { token }
    }

    async signIn(signInDto: SignInDto): Promise<{ token: string }> {

        const { email, password } = signInDto;

        const user = await this.userModel.findOne({
            email
        });

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const isPasswordMatch = await bcrypt.compareSync(password, user.password);

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        const token = this.jwtService.sign({
            id: user._id,
            name: user.name
        });
        return { token };
    }
}
