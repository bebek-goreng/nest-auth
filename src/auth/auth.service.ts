import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';


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
            throw new Error('Email already registered');
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
}
