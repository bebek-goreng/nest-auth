import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../src/auth/schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<User>>('UserModel');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/signup', () => {

    it('should reject signup user with invalid email and invalid password length', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'test',
          email: 'test',
          password: 'test'
        })

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['Please enter correct email'])
      );
      expect(response.body.error).toBe('Bad Request');
    });

    it('should create new user and return jwt token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'test',
          email: 'test@mail.com',
          password: 'password'
        })

      expect(response.body.token).toBeDefined();
    });

    it('should reject user with email when already registered', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          name: 'test',
          email: 'test@mail.com',
          password: 'password'
        })

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email already registered');
    });

    afterAll(async () => {
      await userModel.deleteMany({
        name: 'test'
      });
    });

  });



  describe('POST /api/auth/signin', () => {
    beforeAll(async () => {
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync('password', salt);

      const user = await userModel.create({
        name: 'test',
        email: 'test@mail.com',
        password: hashPassword
      });
    });

    it('should reject user with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'test2@mail.com',
          password: 'password'
        })

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid Credentials');
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject user with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'test@mail.com',
          password: '12345678'
        })

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid Credentials');
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should login a user with correct email and password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'test@mail.com',
          password: 'password'
        })

      expect(response.body.token).toBeDefined();
    });

    afterAll(async () => {
      await userModel.deleteMany({
        name: 'test'
      });
    });
    
  });
});
